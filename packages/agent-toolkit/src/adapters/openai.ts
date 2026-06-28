/**
 * Adapter for the OpenAI Agents SDK / function-calling format.
 * Compatible with: openai-agents, @openai/agents
 *
 * @example
 * import OpenAI from "openai";
 * import { MollieAgentToolkit } from "@mollie/agent-toolkit";
 * import { toOpenAITools } from "@mollie/agent-toolkit/openai";
 *
 * const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });
 * const tools = toOpenAITools(toolkit);
 *
 * const response = await openai.chat.completions.create({
 *   model: "gpt-5.5",
 *   tools,
 *   messages: [{ role: "user", content: "List my last 5 payments" }],
 * });
 */
import { z } from "zod";
import type { MollieAgentToolkit } from "../toolkit.js";
import type { MollieTool } from "../types.js";

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export function toOpenAITools(toolkit: MollieAgentToolkit): OpenAITool[] {
  return toolkit.getTools().map((tool: MollieTool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: z.toJSONSchema(tool.parameters),
    },
  }));
}

/**
 * Execute a tool call returned by the OpenAI API.
 * Pass the raw tool_call object from the response.
 */
export async function executeOpenAIToolCall(
  toolkit: MollieAgentToolkit,
  toolCall: { function: { name: string; arguments: string } },
): Promise<unknown> {
  const tool = toolkit.getTools().find((t) => t.name === toolCall.function.name);

  if (!tool) {
    throw new Error(`Unknown tool: ${toolCall.function.name}`);
  }

  const params = JSON.parse(toolCall.function.arguments);

  return tool.execute(params);
}
