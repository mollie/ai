import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const refundTools = (client: Client): MollieTool[] => [
  {
    name: "list_refunds",
    description: "List all refunds, or refunds for a specific payment.",
    parameters: z.object({
      paymentId: z
        .string()
        .describe("Filter refunds to those belonging to this payment ID."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of refunds to return."),
    }),
    execute: async (params) => client.refunds.list(params),
  },

  {
    name: "create_refund",
    description: "Refund a payment in full or partially.",
    parameters: z.object({
      paymentId: z.string().describe("The ID of the payment to refund."),
      refundRequest: z
        .object({
          amount: z
            .object({
              currency: z.string().length(3).describe("Must match the original payment currency."),
              value: z.string().describe('Amount to refund as a decimal string, e.g. "5.00".'),
            })
            .optional()
            .describe("Omit to refund the full remaining amount."),
          description: z.string().optional().describe("Reason for the refund."),
        })
        .optional(),
    }),
    execute: async (params) => client.refunds.create(params),
  },
];
