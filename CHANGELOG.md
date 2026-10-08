# Changelog

## [1.6.1] (Codex)

### Revert: OpenAI directory submission rejects app references

- `1.6.0` replaced `providers/codex/plugin/mcp.json` with `.app.json`,
  referencing our registered ChatGPT app, on the assumption that bundling an
  MCP server config was what caused OpenAI's plugin directory to mark the
  plugin `requires_local_executor: true`. Attempting to submit that build
  through the OpenAI plugin directory portal failed immediately: "App
  references detected: Plugins with `.app.json` cannot be submitted. Declare
  an MCP server URL instead." Confirmed against OpenAI's own docs
  (developers.openai.com/plugins/deploy/submission(-errors)): `apps`/`.app.json`
  is for local/workspace installs, not public directory submission — "Directory
  submissions must use **With MCP** and submit the MCP server directly."
- Restored `providers/codex/plugin/mcp.json` (streamable-http,
  `https://mcp.mollie.com/mcp`), referenced from the manifest via
  `"mcpServers": "./mcp.json"`. Removed `.app.json`/`apps`.
- Kept the manifest at `providers/codex/plugin/.codex-plugin/plugin.json` (the
  Stripe-reference layout move is unrelated to the app-vs-MCP question).
- Note: this restores the plugin to a submittable state, but the original
  `requires_local_executor: true` flag may require completing OpenAI's
  dashboard-side MCP server review/domain verification separately — that
  can't be resolved from this repo alone.
- Bumped Codex plugin version to `1.6.1`.

## [1.6.0] (Codex)

### Codex plugin now installable on ChatGPT web and mobile

- The Codex plugin bundled its own MCP server config (`providers/codex/plugin/mcp.json`,
  pointing at `https://mcp.mollie.com/mcp`). OpenAI's plugin directory marks any
  plugin that bundles its own MCP config as `requires_local_executor: true`,
  which restricts installation to ChatGPT desktop and Codex — ChatGPT web and
  mobile can only reach MCP servers through a registered app.
- `mcp.json` removed. Added `providers/codex/plugin/.app.json`, referencing our
  registered ChatGPT app (`asdk_app_6a906843cab08191875b1054ea7b609a`) instead.
- Manifest moved from `providers/codex/plugin/plugin.json` to
  `providers/codex/plugin/.codex-plugin/plugin.json`, matching the reference
  layout used by [Stripe's Codex plugin](https://github.com/stripe/ai). The
  `interface` block moves from `extensions["com.openai"].interface` to the
  manifest's top level; `extensions` and `$schema` are dropped. Added
  `"skills": "./skills/"` and `"apps": "./.app.json"`.
- Bumped Codex plugin version to `1.6.0` (Codex versions independently of the
  Claude/Cursor/Gemini manifests).

## [1.4.0]


### Payment links and sales invoices (Revenue Collection)

- Added `mollie-payments/references/payments/payment-links.md` — payment links
  were already a frontmatter keyword with no reference or routing behind them.
  Covers reusable vs. single-use links, `expiresAt`/`allowedMethods`, Connect
  `applicationFee`, and the status-tracking trap (a link has no status of its
  own — each resulting payment does).
- Added `mollie-payments/references/payments/sales-invoices.md` — routes
  developers to the Sales Invoices API (Revenue Collection), which
  `@mollie/agent-toolkit` already supports but the skill's decision tree never
  surfaced. Explicitly disambiguates from Mollie's own, unrelated Invoices API
  (which bills the merchant for fees).
- `SKILL.md` and `references/product-selection/routing-guide.md` updated to
  route both cases: payment link as a third Step 4 checkout option, sales
  invoices short-circuiting straight out of Step 1 since it isn't a
  Payments-API checkout flow.
- Added activation evals `mollie-payments-payment-link-activation` and
  `mollie-payments-sales-invoice-activation`.

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
