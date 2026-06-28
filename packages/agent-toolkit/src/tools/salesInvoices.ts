import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

const recipient = z.object({
  type: z.enum(["consumer", "business"]),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.string().email().optional(),
  streetAndNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().length(2).optional().describe("ISO 3166-1 alpha-2 country code."),
  locale: z.string().optional().describe("e.g. nl_NL, en_US."),
});

const invoiceLine = z.object({
  description: z.string(),
  quantity: z.number().int().min(1),
  vatRate: z.string().describe('VAT percentage as a decimal string, e.g. "21.00".'),
  unitPrice: z.object({
    currency: z.string().length(3),
    value: z.string().describe('e.g. "49.99".'),
  }),
});

export const salesInvoiceTools = (client: Client): MollieTool[] => [
  {
    name: "list_sales_invoices",
    description: "List sales invoices for the current Mollie profile.",
    parameters: z.object({
      limit: z.number().int().min(1).max(250).optional().describe("Number of invoices to return (default 50)."),
      from: z.string().optional().describe("Pagination cursor — start from this invoice ID."),
    }),
    execute: async (params) => client.salesInvoices.list(params),
  },

  {
    name: "get_sales_invoice",
    description: "Retrieve a single sales invoice by ID.",
    parameters: z.object({
      salesInvoiceId: z.string().describe("Sales invoice ID, e.g. invoice_4Y0eZitmBnQ6IDoMqZQKh."),
    }),
    execute: async (params) => client.salesInvoices.get(params),
  },

  {
    name: "create_sales_invoice",
    description:
      "Create a sales invoice. Set status to 'draft' to save without sending, 'issued' to send to the recipient, or 'paid' to record a payment immediately.",
    parameters: z.object({
      salesInvoiceRequest: z.object({
        status: z.enum(["draft", "issued", "paid"]).describe("'draft' saves the invoice, 'issued' sends it, 'paid' marks it as paid."),
        recipientIdentifier: z.string().describe("Your internal identifier for the recipient."),
        recipient,
        lines: z.array(invoiceLine).min(1),
        currency: z.string().length(3).optional().describe("ISO 4217 currency code. Defaults to EUR."),
        paymentTerm: z.string().optional().describe("e.g. '30 days'. Options: 7/14/30/45/60/90/120 days."),
        memo: z.string().optional().describe("Free-form text shown on the invoice PDF."),
        vatScheme: z.enum(["standard", "one-stop-shop"]).optional(),
        isEInvoice: z.boolean().optional().describe("Available for BE, DE, NL only. Cannot be changed after issuance."),
      }),
    }),
    execute: async (params) => client.salesInvoices.create(params),
  },

  {
    name: "update_sales_invoice",
    description:
      "Update a sales invoice. Draft invoices are fully editable. Changing status to 'issued' sends the invoice; 'cancelled' cancels it.",
    parameters: z.object({
      salesInvoiceId: z.string().describe("The ID of the invoice to update."),
      requestBody: z.object({
        status: z.enum(["draft", "issued", "paid", "cancelled"]).optional(),
        memo: z.string().optional(),
        paymentTerm: z.string().optional(),
        recipientIdentifier: z.string().optional(),
        recipient: recipient.optional(),
        lines: z.array(invoiceLine).optional(),
      }),
    }),
    execute: async (params) => client.salesInvoices.update(params),
  },
];
