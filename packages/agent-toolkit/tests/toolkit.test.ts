import { describe, it, expect, vi } from "vitest";
import { MollieAgentToolkit } from "../src/toolkit.js";

vi.mock("mollie-api-typescript", () => {
  const mockClient = {
    payments: { list: vi.fn(), get: vi.fn(), create: vi.fn() },
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

describe("MollieAgentToolkit", () => {
  describe("getTools()", () => {
    it("returns all tools when no filter is specified", () => {
      const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx" });
      const names = toolkit.getTools().map((t) => t.name);

      expect(names).toContain("list_payments");
      expect(names).toContain("create_payment");
      expect(names).toContain("list_settlements");
      expect(names).toContain("list_methods");
      expect(names).toContain("list_subscriptions");
      expect(names).toContain("list_sales_invoices");
      expect(names).toContain("create_sales_invoice");
      expect(names.length).toBe(19);
    });

    it("filters to only the specified tools", () => {
      const toolkit = new MollieAgentToolkit({
        apiKey: "test_xxx",
        tools: ["list_payments", "get_payment"],
      });
      const names = toolkit.getTools().map((t) => t.name);

      expect(names).toEqual(["list_payments", "get_payment"]);
    });

    it("excludes write tools when only read tools are specified", () => {
      const toolkit = new MollieAgentToolkit({
        apiKey: "test_xxx",
        tools: ["list_payments", "get_payment", "list_balances"],
      });
      const names = toolkit.getTools().map((t) => t.name);

      expect(names).not.toContain("create_payment");
      expect(names).not.toContain("create_refund");
    });

    it("returns an empty list when an empty tools array is passed", () => {
      const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: [] });
      expect(toolkit.getTools()).toHaveLength(0);
    });

    it("each tool has a name, description, parameters, and execute function", () => {
      const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx" });
      for (const tool of toolkit.getTools()) {
        expect(typeof tool.name).toBe("string");
        expect(typeof tool.description).toBe("string");
        expect(tool.parameters).toBeDefined();
        expect(typeof tool.execute).toBe("function");
      }
    });
  });
});
