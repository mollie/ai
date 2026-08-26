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
  // details can contain LLM-originated params of unknown shape — a circular
  // reference (or a stringify-unsafe value) must not turn the audit call
  // itself into a crash path.
  let serialized: string;
  try {
    serialized = JSON.stringify(details);
  } catch {
    serialized = "[unserializable]";
  }
  console.error(`[audit] ${new Date().toISOString()} ${event}`, serialized);
}

async function confirmRefund(
  paymentId: string,
  amount: { currency: string; value: string },
  isFullRefund: boolean,
): Promise<{ approved: boolean; reason?: string }> {
  if (!process.stdin.isTTY) {
    // No one is at a terminal to approve this (CI, Docker, a test harness) —
    // rl.question would otherwise hang forever waiting for a line that never
    // comes. Default to denied rather than blocking indefinitely. Don't audit
    // here — the call site in invoke logs a single event per decision and
    // includes this as the reason, so the trail doesn't get two entries for
    // one denial.
    return { approved: false, reason: "non_interactive" };
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    // Always show the actual figure — a vague "the full remaining amount" gives
    // the operator nothing to actually approve or reject against.
    const label = isFullRefund
      ? `${amount.value} ${amount.currency} (the full remaining amount)`
      : `${amount.value} ${amount.currency}`;
    const answer = await rl.question(
      `\nAgent wants to refund ${label} on payment ${paymentId}. Approve? (y/N) `,
    );
    return { approved: answer.trim().toLowerCase() === "y" };
  } finally {
    rl.close();
  }
}

const langChainTools = toLangChainTools(toolkit).map((tool) => {
  if (tool.name !== "create_refund") return tool;

  return {
    ...tool,
    invoke: async (params: unknown) => {
      // Guard before destructuring — the Zod schema should prevent params from
      // being null/undefined, but that can't be guaranteed across every
      // LangChain call path, and destructuring a non-object throws before any
      // guard or audit call below is reached.
      if (params === null || typeof params !== "object") {
        audit("refund_blocked_by_invalid_params", { params });
        return JSON.stringify({
          error: "create_refund was called with invalid params (expected an object). Refund not processed.",
        });
      }

      const { paymentId, refundRequest } = params as {
        paymentId?: unknown;
        refundRequest?: { amount?: { currency: string; value: string }; description?: string };
      };

      // The cast above is compile-time only — a malformed tool schema or an LLM
      // that sends the wrong key (e.g. payment_id) would otherwise reach the API
      // call as `undefined` and surface a cryptic "payment undefined" error.
      if (typeof paymentId !== "string" || paymentId.length === 0) {
        audit("refund_blocked_by_invalid_params", { params });
        return JSON.stringify({
          error: "create_refund was called without a valid paymentId string. Refund not processed.",
        });
      }

      const requestedAmount = refundRequest?.amount;

      // Fetch the real payment before asking for approval — never trust a
      // model-proposed amount without checking it against the source of truth.
      let payment: {
        amount: { currency: string; value: string };
        amountRemaining?: { currency: string; value: string };
      };
      try {
        const rawPayment = await getPayment.execute({ paymentId });
        // getPayment.execute returns `unknown` — the cast above it is
        // compile-time only. If the SDK ever returns an unexpected shape (API
        // version mismatch, a response envelope, etc.), payment.amount would
        // be undefined and throw later, outside this catch. Check the shape
        // now so a malformed response fails the same way a lookup error does.
        const candidate = rawPayment as {
          amount?: { currency?: unknown; value?: unknown };
          amountRemaining?: { currency?: unknown; value?: unknown };
        };
        if (typeof candidate.amount?.currency !== "string" || typeof candidate.amount?.value !== "string") {
          throw new Error(`unexpected payment response shape for ${paymentId}`);
        }
        // amountRemaining is optional, but if present it must have the same
        // shape as amount — otherwise a full refund (no requestedAmount, so
        // the NaN/currency check below never runs) would fall through to a
        // malformed `remaining` and show the operator a prompt like
        // "null null (the full remaining amount)".
        if (
          candidate.amountRemaining &&
          (typeof candidate.amountRemaining.currency !== "string" ||
            typeof candidate.amountRemaining.value !== "string")
        ) {
          throw new Error(`unexpected amountRemaining shape for ${paymentId}`);
        }
        payment = candidate as {
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

      // Compare against what's still refundable, not the original charge — a
      // payment that's already been partially refunded has less left to give.
      // Resolved unconditionally so the confirmation prompt below always shows
      // a real figure, even for a full refund with no requested amount.
      //
      // This is a snapshot, not a lock: the operator approval below is
      // interactive and can take seconds or minutes, during which a
      // concurrent refund (another operator, an automation, a webhook-driven
      // process) can reduce the payment's real remaining balance. The ceiling
      // check and the confirmation prompt both work off this snapshot, so
      // they're a UX guardrail against obviously-wrong amounts, not the final
      // enforcement boundary — Mollie's API re-validates the amount against
      // the payment's true state when `tool.invoke` actually calls it below,
      // and rejects the refund if it no longer fits.
      const remaining = payment.amountRemaining ?? payment.amount;

      if (requestedAmount) {
        // Simple ceiling check for the example. Don't use parseFloat for real
        // money in production — use a decimal library instead.
        const requested = parseFloat(requestedAmount.value);
        const available = parseFloat(remaining.value);
        // NaN comparisons are always false, so a malformed value on either side
        // (empty string, "full", a locale-formatted "10,00", or an unexpected
        // API shape for `remaining`) would otherwise sail straight past this
        // guard instead of being blocked — check both explicitly.
        // Mollie always returns uppercase ISO 4217 codes, but an LLM-proposed
        // currency isn't guaranteed to match case — normalize before comparing
        // so "eur" isn't treated as a mismatch against "EUR".
        // requestedAmount.currency comes from the same compile-time-only cast
        // as paymentId (see the guard above) — a non-string value (e.g. an
        // LLM sending currency: null) would throw calling .toUpperCase()
        // below, uncaught by any try/catch. Check the type first so this
        // fails the same guarded way as every other malformed-input case.
        if (
          Number.isNaN(requested) ||
          Number.isNaN(available) ||
          typeof requestedAmount.currency !== "string" ||
          requestedAmount.currency.toUpperCase() !== remaining.currency.toUpperCase() ||
          requested <= 0 ||
          requested > available
        ) {
          audit("refund_blocked_by_validation", { paymentId, requestedAmount, remainingAmount: remaining });
          return JSON.stringify({
            error: `Refund amount ${requestedAmount.value} ${requestedAmount.currency} exceeds or mismatches the payment's remaining refundable amount (${remaining.value} ${remaining.currency}). Refund not processed.`,
          });
        }
      }

      const confirmAmount = requestedAmount ?? remaining;
      let confirmation: { approved: boolean; reason?: string };
      try {
        confirmation = await confirmRefund(paymentId, confirmAmount, !requestedAmount);
        // Single audit call for the whole decision — confirmRefund reports why
        // via `reason` instead of auditing itself, so a non-interactive denial
        // doesn't produce two log entries (one from confirmRefund, one here)
        // for the same event.
        audit(confirmation.approved ? "refund_approved" : "refund_denied", {
          paymentId,
          refundRequest,
          confirmedAmount: confirmAmount,
          ...(confirmation.reason ? { reason: confirmation.reason } : {}),
        });
      } catch (err) {
        // rl.question rejects (e.g. AbortError) if stdin closes while the
        // prompt is pending — an operator Ctrl+D or a SIGHUP mid-approval.
        // Without this catch that rejection would propagate straight out of
        // invoke, skipping the audit entry at exactly the decision point this
        // example's safety guarantee depends on. Treat it as a denial.
        const message = err instanceof Error ? err.message : String(err);
        audit("refund_error", { paymentId, refundRequest, confirmedAmount: confirmAmount, error: message });
        return JSON.stringify({
          error: `Could not obtain operator confirmation (${message}). Refund not processed.`,
        });
      }

      if (!confirmation.approved) {
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
