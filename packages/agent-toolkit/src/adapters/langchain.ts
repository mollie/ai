/**
 * Adapter for LangChain / LangGraph.
 * Compatible with: langchain, @langchain/core
 *
 * @example
 * import { MollieAgentToolkit } from "@mollie/agent-toolkit";
 * import { toLangChainTools } from "@mollie/agent-toolkit/langchain";
 *
 * const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });
 * const tools = toLangChainTools(toolkit);
 *
 * const agent = createToolCallingAgent({ llm, tools, prompt });
 */
import type { MollieAgentToolkit } from "../toolkit.js";
import type { MollieTool } from "../types.js";

export interface LangChainTool {
  name: string;
  description: string;
  schema: MollieTool["parameters"];
  invoke: (params: unknown) => Promise<string>;
}

export function toLangChainTools(toolkit: MollieAgentToolkit): LangChainTool[] {
  return toolkit.getTools().map((tool: MollieTool) => ({
    name: tool.name,
    description: tool.description,
    schema: tool.parameters,
    invoke: async (params: unknown) => {
      const result = await tool.execute(params);
      return JSON.stringify(result, null, 2);
    },
  }));
}
