import { describe, it, expect, vi } from "vitest";
import { MollieAgentToolkit } from "../src/toolkit.js";
import { toOpenAITools, executeOpenAIToolCall } from "../src/adapters/openai.js";
import { toLangChainTools } from "../src/adapters/langchain.js";
import { toVercelAITools } from "../src/adapters/vercel-ai.js";

const mocks = vi.hoisted(() => ({
  paymentsList: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock("mollie-api-typescript", () => {
  const mockClient = {
    payments: { list: mocks.paymentsList, get: vi.fn(), create: vi.fn() },
    refunds: { list: vi.fn(), get: vi.fn(), create: vi.fn() },
    customers: { list: vi.fn(), get: vi.fn(), create: vi.fn() },
    balances: { list: vi.fn(), get: vi.fn() },
    settlements: { list: vi.fn(), get: vi.fn() },
    methods: { list: vi.fn() },
    subscriptions: { list: vi.fn(), create: vi.fn() },
    salesInvoices: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn() },
  };
  class Client { constructor() { Object.assign(this, mockClient); } }
  return { Client };
});

const makeToolkit = (tools?: string[]) =>
  new MollieAgentToolkit({ apiKey: "test_xxx", tools: tools as never });

describe("OpenAI adapter", () => {
  it("produces the correct tool shape", () => {
    const tools = toOpenAITools(makeToolkit(["list_payments"]));
    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({
      type: "function",
      function: {
        name: "list_payments",
        description: expect.any(String),
        parameters: expect.objectContaining({ type: "object" }),
      },
    });
  });

  it("parameters is valid JSON Schema with properties", () => {
    const tools = toOpenAITools(makeToolkit(["list_payments"]));
    const params = tools[0].function.parameters;
    expect(params).toHaveProperty("type", "object");
    expect(params).toHaveProperty("properties");
  });

  it("executeOpenAIToolCall calls the correct tool", async () => {
    const toolkit = makeToolkit(["list_payments"]);
    const result = await executeOpenAIToolCall(toolkit, {
      function: { name: "list_payments", arguments: "{}" },
    });
    expect(result).toEqual({ data: [] });
  });

  it("executeOpenAIToolCall throws for unknown tool", async () => {
    const toolkit = makeToolkit(["list_payments"]);
    await expect(
      executeOpenAIToolCall(toolkit, {
        function: { name: "unknown_tool", arguments: "{}" },
      }),
    ).rejects.toThrow("Unknown tool");
  });
});

describe("LangChain adapter", () => {
  it("produces the correct tool shape", () => {
    const tools = toLangChainTools(makeToolkit(["list_payments", "get_payment"]));
    expect(tools).toHaveLength(2);
    expect(tools[0]).toMatchObject({
      name: "list_payments",
      description: expect.any(String),
      schema: expect.any(Object),
    });
  });

  it("invoke returns a JSON string", async () => {
    const tools = toLangChainTools(makeToolkit(["list_payments"]));
    const result = await tools[0].invoke({});
    expect(typeof result).toBe("string");
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

describe("Vercel AI adapter", () => {
  it("produces an object keyed by tool name", () => {
    const tools = toVercelAITools(makeToolkit(["list_payments", "get_payment"]));
    expect(Object.keys(tools)).toEqual(["list_payments", "get_payment"]);
  });

  it("each entry has description, parameters, and execute", () => {
    const tools = toVercelAITools(makeToolkit(["list_payments"]));
    expect(tools.list_payments).toMatchObject({
      description: expect.any(String),
      parameters: expect.any(Object),
      execute: expect.any(Function),
    });
  });
});
