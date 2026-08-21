# Changelog

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
