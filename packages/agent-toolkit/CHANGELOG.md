# Changelog

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
