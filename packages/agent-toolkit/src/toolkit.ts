import { Client } from "mollie-api-typescript";
import { paymentTools } from "./tools/payments.js";
import { refundTools } from "./tools/refunds.js";
import { customerTools } from "./tools/customers.js";
import { balanceTools } from "./tools/balances.js";
import { settlementTools } from "./tools/settlements.js";
import { methodTools } from "./tools/methods.js";
import { subscriptionTools } from "./tools/subscriptions.js";
import type { MollieTool, MollieAgentToolkitOptions, ToolName } from "./types.js";

const ALL_TOOLS = new Set<ToolName>([
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
]);

export class MollieAgentToolkit {
  private readonly tools: MollieTool[];

  constructor({ apiKey, tools }: MollieAgentToolkitOptions) {
    const client = new Client({ security: { apiKey } });

    const enabled = new Set<ToolName>(tools ?? ALL_TOOLS);

    const all: MollieTool[] = [
      ...paymentTools(client),
      ...refundTools(client),
      ...customerTools(client),
      ...balanceTools(client),
      ...settlementTools(client),
      ...methodTools(client),
      ...subscriptionTools(client),
    ];

    this.tools = all.filter((t) => enabled.has(t.name as ToolName));
  }

  /** Returns all enabled tools in the Mollie-native format. */
  getTools(): MollieTool[] {
    return this.tools;
  }
}
