import { z } from "zod";
import type { Client } from "mollie-api-typescript";
import type { MollieTool } from "../types.js";

export const customerTools = (client: Client): MollieTool[] => [
  {
    name: "list_customers",
    description: "List customers in Mollie.",
    parameters: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .optional()
        .describe("Number of customers to return."),
      from: z.string().optional().describe("Pagination cursor — start from this customer ID."),
    }),
    execute: async (params) => client.customers.list(params),
  },

  {
    name: "get_customer",
    description: "Retrieve a single customer by ID.",
    parameters: z.object({
      customerId: z.string().describe("Customer ID, e.g. cst_kEn1PlbGa."),
    }),
    execute: async (params) => client.customers.get(params),
  },

  {
    name: "create_customer",
    description: "Create a new customer record in Mollie.",
    parameters: z.object({
      customerRequest: z.object({
        name: z.string().optional().describe("Full name of the customer."),
        email: z.string().email().optional().describe("Customer email address."),
        metadata: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Arbitrary metadata for the customer."),
      }),
    }),
    execute: async (params) => client.customers.create(params),
  },
];
