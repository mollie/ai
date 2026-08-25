/**
 * LangChain example — customer support agent
 *
 * Looks up payment status and handles refund requests. `create_refund` is
 * gated in code, not just by a system-prompt instruction: every refund the
 * agent proposes is validated against the real payment amount and requires
 * an explicit human "yes" on the terminal before it actually calls the API.
 * A system prompt alone is not a safety control — it can be steered around
 * by anything that reaches the model (a customer message, injected text).
 *
 * Setup:
 *   export MOLLIE_API_KEY="test_xxx"
 *   export OPENAI_API_KEY="sk-..."
 *   npx tsx index.ts
 */

import { createInterface } from "node:readline/promises";
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toLangChainTools } from "@mollie/agent-toolkit/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "list_refunds", "create_refund"],
});

// Raw tool access (not the LangChain-wrapped/JSON-stringified form) so the
// refund gate below can fetch the real payment and compare amounts directly.
const rawTools = toolkit.getTools();
const getPayment = rawTools.find((t) => t.name === "get_payment");
if (!getPayment) {
  throw new Error(
    'The refund gate below requires "get_payment" to validate refund amounts — ' +
      'add it to the `tools` list passed to MollieAgentToolkit.',
  );
}

function audit(event: string, details: Record<string, unknown>) {
  console.error(`[audit] ${new Date().toISOString()} ${event}`, JSON.stringify(details));
}

async function confirmRefund(paymentId: string, amount?: { currency: string; value: string }) {
  if (!process.stdin.isTTY) {
    // No one is at a terminal to approve this (CI, Docker, a test harness) —
    // rl.question would otherwise hang forever waiting for a line that never
    // comes. Default to denied rather than blocking indefinitely.
    audit("refund_denied_non_interactive", { paymentId, amount });
    return false;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const label = amount ? `${amount.value} ${amount.currency}` : "the full remaining amount";
    const answer = await rl.question(
      `\nAgent wants to refund ${label} on payment ${paymentId}. Approve? (y/N) `,
    );
    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

const langChainTools = toLangChainTools(toolkit).map((tool) => {
  if (tool.name !== "create_refund") return tool;

  return {
    ...tool,
    invoke: async (params: unknown) => {
      const { paymentId, refundRequest } = params as {
        paymentId: string;
        refundRequest?: { amount?: { currency: string; value: string }; description?: string };
      };
      const requestedAmount = refundRequest?.amount;

      // Fetch the real payment before asking for approval — never trust a
      // model-proposed amount without checking it against the source of truth.
      let payment: {
        amount: { currency: string; value: string };
        amountRemaining?: { currency: string; value: string };
      };
      try {
        payment = (await getPayment.execute({ paymentId })) as {
          amount: { currency: string; value: string };
          amountRemaining?: { currency: string; value: string };
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        audit("refund_blocked_by_lookup_failure", { paymentId, error: message });
        return JSON.stringify({
          error: `Could not look up payment ${paymentId} before refunding (${message}). Refund not processed.`,
        });
      }

      if (requestedAmount) {
        // Simple ceiling check for the example. Don't use parseFloat for real
        // money in production — use a decimal library instead.
        // Compare against what's still refundable, not the original charge —
        // a payment that's already been partially refunded has less left to give.
        const remaining = payment.amountRemaining ?? payment.amount;
        const requested = parseFloat(requestedAmount.value);
        const available = parseFloat(remaining.value);
        // NaN > available is false, so a malformed value (empty string, "full",
        // a locale-formatted "10,00") would otherwise sail straight past this
        // guard instead of being blocked — check for it explicitly.
        if (
          Number.isNaN(requested) ||
          requestedAmount.currency !== remaining.currency ||
          requested > available
        ) {
          audit("refund_blocked_by_validation", { paymentId, requestedAmount, remainingAmount: remaining });
          return JSON.stringify({
            error: `Refund amount ${requestedAmount.value} ${requestedAmount.currency} exceeds or mismatches the payment's remaining refundable amount (${remaining.value} ${remaining.currency}). Refund not processed.`,
          });
        }
      }

      const approved = await confirmRefund(paymentId, requestedAmount);
      audit(approved ? "refund_approved" : "refund_denied", { paymentId, refundRequest });

      if (!approved) {
        return JSON.stringify({ error: "Refund was not approved by the operator. Refund not processed." });
      }

      try {
        const result = await tool.invoke(params);
        audit("refund_executed", { paymentId, refundRequest });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        audit("refund_failed", { paymentId, refundRequest, error: message });
        return JSON.stringify({
          error: `Refund was approved but the Mollie API call failed (${message}). Refund not processed.`,
        });
      }
    },
  };
});

const llm = new ChatOpenAI({ model: "gpt-5.5", temperature: 0 });

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a customer support agent for a Mollie merchant. " +
      "Help customers with payment questions and process refund requests. " +
      "Refunds require operator approval on the terminal before they take effect — " +
      "if approval is denied, tell the customer their refund could not be processed and to contact support.",
  ],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = createToolCallingAgent({ llm, tools: langChainTools, prompt });
const executor = new AgentExecutor({ agent, tools: langChainTools, verbose: true });

const result = await executor.invoke({
  input: process.argv[2] ?? "Show me the last 5 payments",
});

console.log("\n" + result.output);
