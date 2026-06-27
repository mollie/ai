import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const balanceTools = (client: Client): MollieTool[] => [
  {
    name: "list_balances",
    description:
      "List all Mollie balances for the current profile. Each balance shows the available and pending amount.",
    parameters: z.object({
      limit: z.number().int().min(1).max(250).optional(),
    }),
    execute: async (params) => client.balances.list(params),
  },

  {
    name: "get_balance",
    description: "Retrieve a specific balance by ID.",
    parameters: z.object({
      balanceId: z.string().describe("Balance ID, e.g. bal_gVMhHKqSSRYJyPsuoPNFH."),
    }),
    execute: async (params) => client.balances.get(params),
  },
];
