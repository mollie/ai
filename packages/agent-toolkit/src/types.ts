import type { z } from "zod";

export interface MollieTool {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: z.ZodObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (params: any) => Promise<unknown>;
}

export type ToolName =
  | "list_payments"
  | "get_payment"
  | "create_payment"
  | "list_refunds"
  | "create_refund"
  | "list_customers"
  | "get_customer"
  | "create_customer"
  | "list_balances"
  | "get_balance"
  | "list_settlements"
  | "get_settlement"
  | "list_methods"
  | "list_subscriptions"
  | "create_subscription"
  | "list_sales_invoices"
  | "get_sales_invoice"
  | "create_sales_invoice"
  | "update_sales_invoice";

export interface MollieAgentToolkitOptions {
  apiKey: string;
  /** Restrict which tools are available. Defaults to all tools. */
  tools?: ToolName[];
}
