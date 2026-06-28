import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const settlementTools = (client: Client): MollieTool[] => [
  {
    name: "list_settlements",
    description:
      "List settlements for the current Mollie profile. Settlements represent payouts from Mollie to your bank account.",
    parameters: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of settlements to return (default 50)."),
      from: z
        .string()
        .optional()
        .describe("Return settlements starting from this settlement ID (pagination cursor)."),
    }),
    execute: async (params) => client.settlements.list(params),
  },

  {
    name: "get_settlement",
    description:
      "Retrieve a single settlement by its ID. Use 'next' to retrieve the upcoming settlement or 'open' for the open balance.",
    parameters: z.object({
      settlementId: z
        .string()
        .describe("The settlement ID (e.g. stl_jDk30akdN), 'next', or 'open'."),
    }),
    execute: async (params) => client.settlements.get(params),
  },
];
