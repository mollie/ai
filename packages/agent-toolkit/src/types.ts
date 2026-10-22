import type { z } from "zod";
import type { RequireConfirmation } from "./confirmation.js";

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
  | "update_sales_invoice"
  | "list_payment_links"
  | "get_payment_link"
  | "create_payment_link"
  | "update_payment_link"
  | "list_payment_link_payments";

export interface MollieAgentToolkitOptions {
  apiKey: string;
  /**
   * Explicit allowlist of tools the agent may call. Required: there is no
   * default. Pass the smallest set your agent needs, or `ALL_TOOLS` from
   * `@mollie/agent-toolkit` if you deliberately want every tool.
   */
  tools: readonly ToolName[];
  /**
   * Optional allowlist of domains that `redirectUrl` fields are permitted to
   * point to. Checked by exact hostname match. When omitted, no restriction
   * is applied (opt-in, backwards compatible).
   */
  allowedRedirectDomains?: readonly string[];
  /**
   * Optional allowlist of domains that `webhookUrl` fields are permitted to
   * point to. Checked by exact hostname match. When omitted, no restriction
   * is applied (opt-in, backwards compatible).
   */
  allowedWebhookDomains?: readonly string[];
  /**
   * Optional hook invoked before a write tool (`create_payment`,
   * `create_refund`, `create_subscription`, `create_payment_link`,
   * `update_payment_link`) executes. Return `{ approved: false }` to block
   * the call — the tool throws `MollieAgentToolkitConfirmationDeniedError`
   * instead of reaching the Mollie API. When omitted, no confirmation gate
   * is applied (opt-in, backwards compatible).
   */
  requireConfirmation?: RequireConfirmation;
}
