/**
 * LangChain example — customer support agent
 *
 * Looks up payment status and handles refund requests.
 * Write tools are included but you should add your own confirmation step
 * before allowing create_refund in production.
 *
 * Setup:
 *   export MOLLIE_API_KEY="test_xxx"
 *   export OPENAI_API_KEY="sk-..."
 *   npx tsx index.ts
 */

import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toLangChainTools } from "@mollie/agent-toolkit/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "list_refunds", "create_refund"],
});

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a customer support agent for a Mollie merchant. " +
      "Help customers with payment questions and process refund requests. " +
      "Always confirm the payment details before issuing a refund.",
  ],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = createToolCallingAgent({ llm, tools: toLangChainTools(toolkit), prompt });
const executor = new AgentExecutor({ agent, tools: toLangChainTools(toolkit), verbose: true });

const result = await executor.invoke({
  input: process.argv[2] ?? "Show me the last 5 payments",
});

console.log("\n" + result.output);
