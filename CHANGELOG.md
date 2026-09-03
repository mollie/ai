# Changelog

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
