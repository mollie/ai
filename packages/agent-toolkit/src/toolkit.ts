import { Client } from "mollie-api-typescript";
import { paymentTools } from "./tools/payments.js";
import { refundTools } from "./tools/refunds.js";
import { customerTools } from "./tools/customers.js";
import { balanceTools } from "./tools/balances.js";
import { settlementTools } from "./tools/settlements.js";
import { methodTools } from "./tools/methods.js";
import { subscriptionTools } from "./tools/subscriptions.js";
import { salesInvoiceTools } from "./tools/salesInvoices.js";
import { paymentLinkTools } from "./tools/paymentLinks.js";
import type { MollieTool, MollieAgentToolkitOptions, ToolName } from "./types.js";

/** Every tool the toolkit exposes. Pass this to `tools` only if you deliberately want all of them. There is no default. */
export const ALL_TOOLS: readonly ToolName[] = [
  "list_payments",
  "get_payment",
  "create_payment",
  "list_refunds",
  "create_refund",
  "list_customers",
  "get_customer",
  "create_customer",
  "list_balances",
  "get_balance",
  "list_settlements",
  "get_settlement",
  "list_methods",
  "list_subscriptions",
  "create_subscription",
  "list_sales_invoices",
  "get_sales_invoice",
  "create_sales_invoice",
  "update_sales_invoice",
  "list_payment_links",
  "get_payment_link",
  "create_payment_link",
  "update_payment_link",
  "list_payment_link_payments",
];

export class MollieAgentToolkit {
  private readonly tools: MollieTool[];

  constructor({ apiKey, tools, allowedRedirectDomains, allowedWebhookDomains, requireConfirmation }: MollieAgentToolkitOptions) {
    if (!tools) {
      throw new Error(
        "MollieAgentToolkit requires an explicit `tools` allowlist. There is no default. Omitting `tools` used to silently enable every tool, including ones that move money (create_payment, create_refund, create_payment_link, ...). Pass the smallest set your agent needs, e.g. `tools: [\"list_payments\", \"get_payment\"]`, or `tools: ALL_TOOLS` if you deliberately want every tool.",
      );
    }

    const client = new Client({ security: { apiKey } });

    const enabled = new Set<ToolName>(tools);

    const all: MollieTool[] = [
      ...paymentTools(client, { allowedRedirectDomains, allowedWebhookDomains, requireConfirmation }),
      ...refundTools(client, { requireConfirmation }),
      ...customerTools(client),
      ...balanceTools(client),
      ...settlementTools(client),
      ...methodTools(client),
      ...subscriptionTools(client, { allowedWebhookDomains, requireConfirmation }),
      ...salesInvoiceTools(client),
      ...paymentLinkTools(client, { allowedRedirectDomains, allowedWebhookDomains, requireConfirmation }),
    ];

    this.tools = all.filter((t) => enabled.has(t.name as ToolName));
  }

  /** Returns all enabled tools in the Mollie-native format. */
  getTools(): MollieTool[] {
    return this.tools;
  }
}
