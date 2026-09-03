import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const paymentLinkTools = (client: Client): MollieTool[] => [
  {
    name: "list_payment_links",
    description: "List payment links for the current Mollie profile.",
    parameters: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of payment links to return (1–250, default 10)."),
      from: z
        .string()
        .optional()
        .describe("Pagination cursor — start from this payment link ID."),
    }),
    execute: async (params) => client.paymentLinks.list(params),
  },

  {
    name: "get_payment_link",
    description: "Retrieve a single payment link by its ID.",
    parameters: z.object({
      paymentLinkId: z.string().describe("The payment link ID, e.g. pl_4Y0eZitmBnQ6IDoMqZQKh."),
    }),
    execute: async (params) => client.paymentLinks.get(params),
  },

  {
    name: "create_payment_link",
    description:
      "Create a payment link — a shareable URL the customer can use to pay, instead of an embedded checkout. Unlike a payment, a payment link has no status of its own; each payment made against it does. Set reusable to true to let multiple customers pay via the same link.",
    parameters: z.object({
      description: z
        .string()
        .describe("Description shown on the payment link's page and bank statement."),
      amount: z
        .object({
          currency: z.string().length(3).describe("ISO 4217 currency code, e.g. EUR."),
          value: z.string().describe('Exact decimal amount as a string, e.g. "10.00".'),
        })
        .optional()
        .describe("Omit to let the customer enter their own amount (e.g. for donations)."),
      redirectUrl: z
        .string()
        .url()
        .optional()
        .describe("URL the customer is redirected to after paying."),
      webhookUrl: z
        .string()
        .url()
        .optional()
        .describe("URL Mollie calls to deliver status updates for payments made via this link."),
      reusable: z
        .boolean()
        .optional()
        .describe("Allow multiple customers to pay via the same link. Defaults to false (single use)."),
      expiresAt: z
        .string()
        .optional()
        .describe("ISO 8601 datetime the link expires at. Omit for a link that never expires."),
    }),
    execute: async (params) => client.paymentLinks.create(params),
  },

  {
    name: "update_payment_link",
    description: "Update a payment link's description, redirect/webhook URL, expiry, or reusability.",
    parameters: z.object({
      paymentLinkId: z.string().describe("The ID of the payment link to update."),
      requestBody: z.object({
        description: z.string().optional(),
        redirectUrl: z.string().url().optional(),
        webhookUrl: z.string().url().optional(),
        reusable: z.boolean().optional(),
        expiresAt: z.string().optional(),
      }),
    }),
    execute: async (params) => client.paymentLinks.update(params),
  },

  {
    name: "list_payment_link_payments",
    description:
      "List the payments made against a payment link. Use this to check status for a reusable link, since the link itself has no single status — each resulting payment does.",
    parameters: z.object({
      paymentLinkId: z.string().describe("The ID of the payment link."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of payments to return (1–250, default 10)."),
      from: z
        .string()
        .optional()
        .describe("Pagination cursor — start from this payment ID."),
    }),
    execute: async (params) => client.paymentLinks.listPayments(params),
  },
];
