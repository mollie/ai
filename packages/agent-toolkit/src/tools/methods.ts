import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const methodTools = (client: Client): MollieTool[] => [
  {
    name: "list_methods",
    description:
      "List payment methods available on the current Mollie profile. Use this to show customers which payment methods are available before creating a payment.",
    parameters: z.object({
      amount: z
        .object({
          currency: z.string().length(3).describe("ISO 4217 currency code, e.g. EUR."),
          value: z.string().describe("Amount as a decimal string, e.g. \"10.00\"."),
        })
        .optional()
        .describe("Filter methods available for this specific amount and currency."),
      locale: z
        .string()
        .optional()
        .describe("Locale for method names and logos, e.g. en_US, nl_NL."),
    }),
    execute: async (params) => client.methods.list(params),
  },
];
