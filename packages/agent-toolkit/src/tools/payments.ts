import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const paymentTools = (client: Client): MollieTool[] => [
  {
    name: "list_payments",
    description:
      "List payments for the current Mollie profile. Returns the most recent payments with their status, amount, and description.",
    parameters: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of payments to return (1–250, default 25)."),
      from: z
        .string()
        .optional()
        .describe("Return payments starting from this payment ID (pagination cursor)."),
    }),
    execute: async (params) => client.payments.list(params),
  },

  {
    name: "get_payment",
    description: "Retrieve a single payment by its ID.",
    parameters: z.object({
      paymentId: z.string().describe("The payment ID, e.g. tr_7UhSN1zuXS."),
    }),
    execute: async (params) => client.payments.get(params),
  },

  {
    name: "create_payment",
    description:
      "Create a new payment. Returns a checkout URL the customer should visit to complete the payment.",
    parameters: z.object({
      paymentRequest: z.object({
        amount: z.object({
          currency: z.string().length(3).describe("ISO 4217 currency code, e.g. EUR."),
          value: z.string().describe('Exact decimal amount as a string, e.g. "10.00".'),
        }),
        description: z
          .string()
          .describe("Description shown on the payment page and bank statement."),
        redirectUrl: z
          .string()
          .url()
          .describe("URL the customer is redirected to after paying."),
        webhookUrl: z
          .string()
          .url()
          .optional()
          .describe("URL Mollie calls to deliver payment status updates."),
        metadata: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Arbitrary key-value metadata attached to the payment."),
      }),
    }),
    execute: async (params) => client.payments.create(params),
  },
];
