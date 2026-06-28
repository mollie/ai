import { describe, it, expect, vi, beforeEach } from "vitest";
import { MollieAgentToolkit } from "../src/toolkit.js";

const mocks = vi.hoisted(() => ({
  paymentsList: vi.fn().mockResolvedValue({ data: [{ id: "tr_test" }] }),
  paymentsGet: vi.fn().mockResolvedValue({ id: "tr_test", status: "paid" }),
  refundsCreate: vi.fn().mockResolvedValue({ id: "re_test" }),
  settlementsList: vi.fn().mockResolvedValue({ data: [] }),
  salesInvoicesList: vi.fn().mockResolvedValue({ data: [] }),
  salesInvoicesGet: vi.fn().mockResolvedValue({ id: "invoice_test", status: "draft" }),
  salesInvoicesCreate: vi.fn().mockResolvedValue({ id: "invoice_test", status: "draft" }),
  salesInvoicesUpdate: vi.fn().mockResolvedValue({ id: "invoice_test", status: "issued" }),
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
    salesInvoices: {
      list: mocks.salesInvoicesList,
      get: mocks.salesInvoicesGet,
      create: mocks.salesInvoicesCreate,
      update: mocks.salesInvoicesUpdate,
    },
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

describe("Sales invoice tools", () => {
  let toolkit: MollieAgentToolkit;

  beforeEach(() => {
    toolkit = new MollieAgentToolkit({ apiKey: "test_xxx" });
    vi.clearAllMocks();
  });

  it("list_sales_invoices calls salesInvoices.list with correct params", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "list_sales_invoices")!;
    await tool.execute({ limit: 10 });
    expect(mocks.salesInvoicesList).toHaveBeenCalledWith({ limit: 10 });
  });

  it("get_sales_invoice calls salesInvoices.get with salesInvoiceId", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "get_sales_invoice")!;
    await tool.execute({ salesInvoiceId: "invoice_test" });
    expect(mocks.salesInvoicesGet).toHaveBeenCalledWith({ salesInvoiceId: "invoice_test" });
  });

  it("create_sales_invoice calls salesInvoices.create with correct params", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "create_sales_invoice")!;
    const params = {
      salesInvoiceRequest: {
        status: "draft",
        recipientIdentifier: "cust-123",
        recipient: { type: "consumer", email: "test@example.com", country: "NL" },
        lines: [{ description: "Widget", quantity: 1, vatRate: "21.00", unitPrice: { currency: "EUR", value: "10.00" } }],
      },
    };
    await tool.execute(params);
    expect(mocks.salesInvoicesCreate).toHaveBeenCalledWith(params);
  });

  it("update_sales_invoice calls salesInvoices.update with salesInvoiceId and body", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "update_sales_invoice")!;
    await tool.execute({ salesInvoiceId: "invoice_test", requestBody: { status: "issued" } });
    expect(mocks.salesInvoicesUpdate).toHaveBeenCalledWith({
      salesInvoiceId: "invoice_test",
      requestBody: { status: "issued" },
    });
  });
});
