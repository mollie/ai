import { describe, it, expect, vi, beforeEach } from "vitest";
import { MollieAgentToolkit } from "../src/toolkit.js";

const mocks = vi.hoisted(() => ({
  paymentsList: vi.fn().mockResolvedValue({ data: [{ id: "tr_test" }] }),
  paymentsGet: vi.fn().mockResolvedValue({ id: "tr_test", status: "paid" }),
  refundsCreate: vi.fn().mockResolvedValue({ id: "re_test" }),
  settlementsList: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock("mollie-api-typescript", () => {
  const mockClient = {
    payments: { list: mocks.paymentsList, get: mocks.paymentsGet, create: vi.fn() },
    refunds: { list: vi.fn(), get: vi.fn(), create: mocks.refundsCreate },
    customers: { list: vi.fn(), get: vi.fn(), create: vi.fn() },
    balances: { list: vi.fn(), get: vi.fn() },
    settlements: { list: mocks.settlementsList, get: vi.fn() },
    methods: { list: vi.fn() },
    subscriptions: { list: vi.fn(), create: vi.fn() },
  };
  class Client { constructor() { Object.assign(this, mockClient); } }
  return { Client };
});

describe("Payment tools", () => {
  let toolkit: MollieAgentToolkit;

  beforeEach(() => {
    toolkit = new MollieAgentToolkit({ apiKey: "test_xxx" });
    vi.clearAllMocks();
  });

  it("list_payments calls payments.list with correct params", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "list_payments")!;
    await tool.execute({ limit: 10 });
    expect(mocks.paymentsList).toHaveBeenCalledWith({ limit: 10 });
  });

  it("get_payment calls payments.get with paymentId", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "get_payment")!;
    await tool.execute({ paymentId: "tr_test" });
    expect(mocks.paymentsGet).toHaveBeenCalledWith({ paymentId: "tr_test" });
  });

  it("create_refund calls refunds.create with correct params", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "create_refund")!;
    await tool.execute({
      paymentId: "tr_test",
      refundRequest: { amount: { currency: "EUR", value: "5.00" } },
    });
    expect(mocks.refundsCreate).toHaveBeenCalledWith({
      paymentId: "tr_test",
      refundRequest: { amount: { currency: "EUR", value: "5.00" } },
    });
  });
});

describe("Settlement tools", () => {
  it("list_settlements calls settlements.list with correct params", async () => {
    const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx" });
    const tool = toolkit.getTools().find((t) => t.name === "list_settlements")!;
    await tool.execute({ limit: 5 });
    expect(mocks.settlementsList).toHaveBeenCalledWith({ limit: 5 });
  });
});
