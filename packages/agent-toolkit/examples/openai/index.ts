/**
 * OpenAI function calling example — payment reconciliation agent
 *
 * Lists recent settlements and summarises them.
 *
 * Setup:
 *   export MOLLIE_API_KEY="test_xxx"
 *   export OPENAI_API_KEY="sk-..."
 *   npx tsx index.ts
 */

import OpenAI from "openai";
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toOpenAITools, executeOpenAIToolCall } from "@mollie/agent-toolkit/openai";

const client = new OpenAI();

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_settlements", "get_settlement", "list_payments"],
});

const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: "Summarise my last 3 settlements — amounts, status, and period covered.",
  },
];

// Simple agentic loop — keeps going until the model stops calling tools
while (true) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: toOpenAITools(toolkit),
  });

  const message = response.choices[0].message;
  messages.push(message);

  if (!message.tool_calls || message.tool_calls.length === 0) {
    console.log(message.content);
    break;
  }

  for (const toolCall of message.tool_calls) {
    const result = await executeOpenAIToolCall(toolkit, toolCall);
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    });
  }
}
