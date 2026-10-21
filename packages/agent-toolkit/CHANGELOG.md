# Changelog

## 0.5.0

### Breaking

- `MollieAgentToolkitOptions.tools` is now required. The constructor throws a clear error if `tools` is omitted, instead of silently defaulting to every tool (including `create_payment`, `create_refund`, and other write tools).
- Added `ALL_TOOLS` as a named export (`import { ALL_TOOLS } from "@mollie/agent-toolkit"`) for the rare case where an agent genuinely needs every tool — pass it explicitly as `tools: ALL_TOOLS`.

### Migration

- If you previously constructed `new MollieAgentToolkit({ apiKey })` without a `tools` option, pick the smallest explicit allowlist your agent needs, e.g. `tools: ["list_payments", "get_payment"]`, or pass `tools: ALL_TOOLS` to keep the old behavior.

## 0.4.0

### Added

- `list_payment_links`, `get_payment_link`, `create_payment_link`, `update_payment_link`, `list_payment_link_payments`
- 5 new tests for payment link tools (26 total)

## 0.3.1

### Changed

- README and adapter docs: replace all `gpt-4o` references with `gpt-5.5`
- README OpenAI example: updated to use `@openai/agents` SDK instead of raw chat completions loop

## 0.3.0

### Added

- `list_sales_invoices`, `get_sales_invoice`, `create_sales_invoice`, `update_sales_invoice`
- 4 new tests for sales invoice tools (21 total)

## 0.2.1

### Changed

- README: replace version-pinned status notice with alpha warning

## 0.2.0

### Added

- `list_settlements`, `get_settlement`
- `list_methods`
- `list_subscriptions`, `create_subscription`
- Vercel AI SDK, OpenAI Agents SDK, and LangChain examples
- 17 unit tests across toolkit, adapters, and tools

## 0.1.0

Initial release.

### Tools

- `list_payments`, `get_payment`, `create_payment`
- `list_refunds`, `create_refund`
- `list_customers`, `get_customer`, `create_customer`
- `list_balances`, `get_balance`
- `list_settlements`, `get_settlement`
- `list_methods`
- `list_subscriptions`, `create_subscription`

### Adapters

- OpenAI function calling (`@mollie/agent-toolkit/openai`)
- LangChain (`@mollie/agent-toolkit/langchain`)
- Vercel AI SDK (`@mollie/agent-toolkit/vercel-ai`)
