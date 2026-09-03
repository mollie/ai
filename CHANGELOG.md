# Changelog

## [1.4.0]

### Payment links added to @mollie/agent-toolkit

- `@mollie/agent-toolkit` gains `list_payment_links`, `get_payment_link`,
  `create_payment_link`, `update_payment_link`, and `list_payment_link_payments`
  (bumped to `0.4.0`) — the underlying SDK and the hosted MCP server already
  supported payment links, but custom agents built directly on the toolkit
  (LangChain/OpenAI Agents SDK/Vercel AI SDK) had no equivalent.
- `mollie-agent-toolkit/SKILL.md`'s tool table and human-confirmation guidance
  updated to include the new tools — `create_payment_link` is treated as a
  write tool requiring confirmation, same tier as `create_payment`.
- Bumped plugin version to `1.4.0` (additive, non-breaking).

## [1.3.0]

### Skills restructuring

- `skills/mollie-integration` renamed to **`skills/mollie-payments`**. Existing
  references (`payments.mdc`, internal docs, muscle memory) pointing at
  `mollie-integration` should be updated to `mollie-payments`.
- Existing reference docs (`hosted-checkout.md`, `components.md`,
  `build-your-own-checkout.md`, `webhooks.md`) moved under
  `mollie-payments/references/payments/`.
- Added new reference folders under `mollie-payments/references/`: `connect/`,
  `recurring/`, `operations/`, `troubleshooting/`, `product-selection/`. The
  router previously dead-ended platform/marketplace detection to a doc link —
  it now routes into a full Connect workflow.
- Added two new top-level skills: **`mollie-upgrade`** (SDK version upgrades,
  Orders API → Payments API migration) and **`mollie-agent-toolkit`** (guidance
  for building agents on top of `@mollie/agent-toolkit`, including write-tool
  safety and human-confirmation patterns).
- Bumped plugin version to `1.3.0` (additive, non-breaking) and updated
  `plugin.json` / `README.md` skill descriptions accordingly.
