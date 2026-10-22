import { describe, it, expect, vi, beforeEach } from "vitest";
import { MollieAgentToolkit, ALL_TOOLS } from "../src/toolkit.js";

const mocks = vi.hoisted(() => ({
  paymentsList: vi.fn().mockResolvedValue({ data: [{ id: "tr_test" }] }),
  paymentsGet: vi.fn().mockResolvedValue({ id: "tr_test", status: "paid" }),
  paymentsCreate: vi.fn().mockResolvedValue({ id: "tr_test" }),
  refundsCreate: vi.fn().mockResolvedValue({ id: "re_test" }),
  settlementsList: vi.fn().mockResolvedValue({ data: [] }),
  subscriptionsCreate: vi.fn().mockResolvedValue({ id: "sub_test" }),
  salesInvoicesList: vi.fn().mockResolvedValue({ data: [] }),
  salesInvoicesGet: vi.fn().mockResolvedValue({ id: "invoice_test", status: "draft" }),
  salesInvoicesCreate: vi.fn().mockResolvedValue({ id: "invoice_test", status: "draft" }),
  salesInvoicesUpdate: vi.fn().mockResolvedValue({ id: "invoice_test", status: "issued" }),
  paymentLinksList: vi.fn().mockResolvedValue({ data: [] }),
  paymentLinksGet: vi.fn().mockResolvedValue({ id: "pl_test" }),
  paymentLinksCreate: vi.fn().mockResolvedValue({ id: "pl_test" }),
  paymentLinksUpdate: vi.fn().mockResolvedValue({ id: "pl_test" }),
  paymentLinksListPayments: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock("mollie-api-typescript", () => {
  const mockClient = {
    payments: { list: mocks.paymentsList, get: mocks.paymentsGet, create: mocks.paymentsCreate },
    refunds: { list: vi.fn(), get: vi.fn(), create: mocks.refundsCreate },
    customers: { list: vi.fn(), get: vi.fn(), create: vi.fn() },
    balances: { list: vi.fn(), get: vi.fn() },
    settlements: { list: mocks.settlementsList, get: vi.fn() },
    methods: { list: vi.fn() },
    subscriptions: { list: vi.fn(), create: mocks.subscriptionsCreate },
    salesInvoices: {
      list: mocks.salesInvoicesList,
      get: mocks.salesInvoicesGet,
      create: mocks.salesInvoicesCreate,
      update: mocks.salesInvoicesUpdate,
    },
    paymentLinks: {
      list: mocks.paymentLinksList,
      get: mocks.paymentLinksGet,
      create: mocks.paymentLinksCreate,
      update: mocks.paymentLinksUpdate,
      listPayments: mocks.paymentLinksListPayments,
    },
  };
  class Client { constructor() { Object.assign(this, mockClient); } }
  return { Client };
});

describe("Payment tools", () => {
  let toolkit: MollieAgentToolkit;

  beforeEach(() => {
    toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: ALL_TOOLS });
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
    const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: ALL_TOOLS });
    const tool = toolkit.getTools().find((t) => t.name === "list_settlements")!;
    await tool.execute({ limit: 5 });
    expect(mocks.settlementsList).toHaveBeenCalledWith({ limit: 5 });
  });
});

describe("Sales invoice tools", () => {
  let toolkit: MollieAgentToolkit;

  beforeEach(() => {
    toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: ALL_TOOLS });
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

describe("Payment link tools", () => {
  let toolkit: MollieAgentToolkit;

  beforeEach(() => {
    toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: ALL_TOOLS });
    vi.clearAllMocks();
  });

  it("list_payment_links calls paymentLinks.list with correct params", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "list_payment_links")!;
    await tool.execute({ limit: 10 });
    expect(mocks.paymentLinksList).toHaveBeenCalledWith({ limit: 10 });
  });

  it("get_payment_link calls paymentLinks.get with paymentLinkId", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "get_payment_link")!;
    await tool.execute({ paymentLinkId: "pl_test" });
    expect(mocks.paymentLinksGet).toHaveBeenCalledWith({ paymentLinkId: "pl_test" });
  });

  it("create_payment_link calls paymentLinks.create with a requestBody wrapper", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "create_payment_link")!;
    const params = {
      requestBody: {
        description: "Invoice #4567",
        amount: { currency: "EUR", value: "99.00" },
        reusable: false,
      },
    };
    await tool.execute(params);
    expect(mocks.paymentLinksCreate).toHaveBeenCalledWith(params);
  });

  it("update_payment_link calls paymentLinks.update with paymentLinkId and body", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "update_payment_link")!;
    await tool.execute({ paymentLinkId: "pl_test", requestBody: { description: "Updated" } });
    expect(mocks.paymentLinksUpdate).toHaveBeenCalledWith({
      paymentLinkId: "pl_test",
      requestBody: { description: "Updated" },
    });
  });

  it("list_payment_link_payments calls paymentLinks.listPayments with paymentLinkId", async () => {
    const tool = toolkit.getTools().find((t) => t.name === "list_payment_link_payments")!;
    await tool.execute({ paymentLinkId: "pl_test", limit: 10 });
    expect(mocks.paymentLinksListPayments).toHaveBeenCalledWith({ paymentLinkId: "pl_test", limit: 10 });
  });
});

describe("URL allowlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create_payment rejects a redirectUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["create_payment"],
      allowedRedirectDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "create_payment")!;

    await expect(
      tool.execute({
        paymentRequest: {
          amount: { currency: "EUR", value: "10.00" },
          description: "test",
          redirectUrl: "https://evil.com/callback",
        },
      }),
    ).rejects.toThrow();
    expect(mocks.paymentsCreate).not.toHaveBeenCalled();
  });

  it("create_payment allows a redirectUrl on an allowed domain", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["create_payment"],
      allowedRedirectDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "create_payment")!;
    const params = {
      paymentRequest: {
        amount: { currency: "EUR", value: "10.00" },
        description: "test",
        redirectUrl: "https://example.com/callback",
      },
    };

    await tool.execute(params);
    expect(mocks.paymentsCreate).toHaveBeenCalledWith(params);
  });

  it("create_payment_link rejects a webhookUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["create_payment_link"],
      allowedWebhookDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "create_payment_link")!;

    await expect(
      tool.execute({
        requestBody: {
          description: "test",
          amount: { currency: "EUR", value: "10.00" },
          webhookUrl: "https://evil.com/callback",
        },
      }),
    ).rejects.toThrow();
    expect(mocks.paymentLinksCreate).not.toHaveBeenCalled();
  });

  it("update_payment_link rejects a webhookUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["update_payment_link"],
      allowedWebhookDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "update_payment_link")!;

    await expect(
      tool.execute({
        paymentLinkId: "pl_test",
        requestBody: { webhookUrl: "https://evil.com/callback" },
      }),
    ).rejects.toThrow();
    expect(mocks.paymentLinksUpdate).not.toHaveBeenCalled();
  });

  it("create_payment_link rejects a redirectUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["create_payment_link"],
      allowedRedirectDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "create_payment_link")!;

    await expect(
      tool.execute({
        requestBody: {
          description: "test",
          amount: { currency: "EUR", value: "10.00" },
          redirectUrl: "https://evil.com/callback",
        },
      }),
    ).rejects.toThrow();
    expect(mocks.paymentLinksCreate).not.toHaveBeenCalled();
  });

  it("update_payment_link rejects a redirectUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["update_payment_link"],
      allowedRedirectDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "update_payment_link")!;

    await expect(
      tool.execute({
        paymentLinkId: "pl_test",
        requestBody: { redirectUrl: "https://evil.com/callback" },
      }),
    ).rejects.toThrow();
    expect(mocks.paymentLinksUpdate).not.toHaveBeenCalled();
  });

  it("create_payment_link allows external URLs when no allowlist is configured", async () => {
    const toolkit = new MollieAgentToolkit({ apiKey: "test_xxx", tools: ["create_payment_link"] });
    const tool = toolkit.getTools().find((t) => t.name === "create_payment_link")!;
    const params = {
      requestBody: {
        description: "test",
        amount: { currency: "EUR", value: "10.00" },
        redirectUrl: "https://external.example/return",
        webhookUrl: "https://hooks.external.example/callback",
      },
    };

    await tool.execute(params);
    expect(mocks.paymentLinksCreate).toHaveBeenCalledWith(params);
  });

  it("create_subscription rejects a webhookUrl outside the allowed domains", async () => {
    const toolkit = new MollieAgentToolkit({
      apiKey: "test_xxx",
      tools: ["create_subscription"],
      allowedWebhookDomains: ["example.com"],
    });
    const tool = toolkit.getTools().find((t) => t.name === "create_subscription")!;

    await expect(
      tool.execute({
        customerId: "cst_test",
        subscriptionRequest: {
          amount: { currency: "EUR", value: "10.00" },
          interval: "1 month",
          description: "test",
          webhookUrl: "https://evil.com/callback",
        },
      }),
    ).rejects.toThrow();
    expect(mocks.subscriptionsCreate).not.toHaveBeenCalled();
  });
});
