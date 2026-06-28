import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const subscriptionTools = (client: Client): MollieTool[] => [
  {
    name: "list_subscriptions",
    description: "List subscriptions for a specific customer.",
    parameters: z.object({
      customerId: z.string().describe("Customer ID, e.g. cst_kEn1PlbGa."),
      limit: z.number().int().min(1).max(250).optional(),
      from: z.string().optional().describe("Pagination cursor."),
    }),
    execute: async (params) => client.subscriptions.list(params),
  },

  {
    name: "create_subscription",
    description:
      "Create a recurring subscription for a customer. The customer must have a valid mandate (saved payment method) on file.",
    parameters: z.object({
      customerId: z.string().describe("Customer ID, e.g. cst_kEn1PlbGa."),
      subscriptionRequest: z.object({
        amount: z.object({
          currency: z.string().length(3),
          value: z.string().describe("Amount per billing cycle, e.g. \"9.99\"."),
        }),
        interval: z
          .string()
          .describe(
            "Billing interval, e.g. \"1 month\", \"2 weeks\", \"7 days\".",
          ),
        description: z.string().describe("Description shown on each payment."),
        webhookUrl: z.string().url().optional(),
        startDate: z
          .string()
          .optional()
          .describe("First billing date in YYYY-MM-DD format. Defaults to today."),
        times: z
          .number()
          .int()
          .optional()
          .describe("Number of charges. Omit for an indefinite subscription."),
      }),
    }),
    execute: async (params) => client.subscriptions.create(params),
  },
];
