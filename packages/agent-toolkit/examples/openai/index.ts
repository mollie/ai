/**
 * OpenAI Agents SDK example — settlement reconciliation agent
 *
 * Uses the modern @openai/agents SDK (not the legacy chat completions loop).
 * The toolkit's tools plug directly into the agents SDK via the tool() adapter.
 *
 * Setup:
 *   export MOLLIE_API_KEY="test_xxx"
 *   export OPENAI_API_KEY="sk-..."
 *   npm install @openai/agents @mollie/agent-toolkit
 *   npx tsx index.ts "Summarise my last 3 settlements"
 */

import { Agent, run, tool } from "@openai/agents";
import { MollieAgentToolkit } from "@mollie/agent-toolkit";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_settlements", "get_settlement", "list_payments"],
});

// MollieTool shape matches the agents SDK tool() signature directly.
const agentTools = toolkit.getTools().map((t) =>
  tool({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    execute: t.execute,
  }),
);

const agent = new Agent({
  name: "Reconciliation Agent",
  model: "gpt-5.5",
  instructions:
    "You are a financial reconciliation assistant for Mollie merchants. " +
    "Summarise settlements clearly: amounts, periods, and status.",
  tools: agentTools,
});

const result = await run(
  agent,
  process.argv[2] ?? "Summarise my last 3 settlements — amounts, status, and period covered.",
);

console.log(result.finalOutput);
