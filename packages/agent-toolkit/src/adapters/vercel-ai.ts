/**
 * Adapter for the Vercel AI SDK.
 * Compatible with: ai (vercel/ai-sdk)
 *
 * @example
 * import { MollieAgentToolkit } from "@mollie/agent-toolkit";
 * import { toVercelAITools } from "@mollie/agent-toolkit/vercel-ai";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });
 *
 * const { text } = await generateText({
 *   model: openai("gpt-5.5"),
 *   tools: toVercelAITools(toolkit),
 *   prompt: "List my last 5 payments",
 * });
 */
import type { MollieAgentToolkit } from "../toolkit.js";
import type { MollieTool } from "../types.js";

export interface VercelAITool {
  description: string;
  parameters: MollieTool["parameters"];
  execute: (params: unknown) => Promise<unknown>;
}

export function toVercelAITools(
  toolkit: MollieAgentToolkit,
): Record<string, VercelAITool> {
  const result: Record<string, VercelAITool> = {};

  for (const tool of toolkit.getTools()) {
    result[tool.name] = {
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.execute,
    };
  }

  return result;
}
