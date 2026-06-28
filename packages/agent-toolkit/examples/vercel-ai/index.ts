/**
 * Vercel AI SDK example — read-only Mollie agent
 *
 * Answers questions about your Mollie account using natural language.
 * Uses a read-only tool allowlist — no payments or refunds are created.
 *
 * Setup:
 *   export MOLLIE_API_KEY="test_xxx"
 *   export OPENAI_API_KEY="sk-..."
 *   npx tsx index.ts
 */

import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toVercelAITools } from "@mollie/agent-toolkit/vercel-ai";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  // Read-only — safe to run against a live account
  tools: ["list_payments", "get_payment", "list_balances", "get_balance", "list_settlements"],
});

const { text } = await generateText({
  model: openai("gpt-5.5"),
  tools: toVercelAITools(toolkit),
  maxSteps: 5,
  system:
    "You are a helpful assistant for Mollie merchants. " +
    "Answer questions about their payments, balances, and settlements concisely.",
  prompt: process.argv[2] ?? "What is my current balance?",
});

console.log(text);
