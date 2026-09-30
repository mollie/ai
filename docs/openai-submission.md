# OpenAI plugin directory submission

Checklist and review-details draft for submitting `providers/codex/plugin/` at
<https://platform.openai.com/plugins>. Based on
<https://developers.openai.com/plugins/deploy/submission>. `node ci/validate-structure.mjs`
enforces the manifest, icon and skill-description limits.

## Package

1. `node ci/generate-providers.mjs` (keeps `providers/codex/plugin/skills` in sync).
2. Zip the **contents of** `providers/codex/plugin/` so `.codex-plugin/`, `.mcp.json`,
   `skills/` and `assets/` sit at the ZIP root. No credentials in the ZIP.
3. Bump `version` in `.codex-plugin/plugin.json` for every resubmission.

## Outside this repo (must be done before "Submit for review")

- **Domain verification**: serve the token from the portal at
  `https://mcp.mollie.com/.well-known/openai-apps-challenge` (plain text, token only).
- **Tool annotations**: every tool on `mcp.mollie.com` needs explicit `readOnlyHint`,
  `destructiveHint` and `openWorldHint`, each with a justification. `create_payment`,
  `create_refund`, `create_subscription` and similar payment writes should be
  `readOnlyHint: false`, `destructiveHint: true`.
- **Reviewer access**: a dedicated Mollie test account with sample data, no MFA, and a
  token/login that works without private-network access. Enter in **Review details**.
  Note the README documents `MOLLIE_API_ADVANCED_ACCESS_TOKEN`; confirm how a reviewer
  authenticates against the hosted MCP server, because `.mcp.json` declares no auth.
- **Demo recording**: record and set `demo_recording_url`.
- **Policy check**: the guidelines prohibit "execution of money transfers" and limit
  commerce to physical goods. Confirm with OpenAI that Mollie's payment, refund and
  subscription tools are in scope.

## Review test cases (enter in Review details)

Exactly five positive and three negative. Tool names are taken from the skills; verify
them against the live server's tool list before submitting.

### Positive

1. **List recent payments**
   - Prompt: `Show me my 5 most recent Mollie payments and their statuses.`
   - Tools: `list_payments`
   - Expected: Returns up to 5 payments with id, amount and status; no writes.
2. **Inspect a single payment**
   - Prompt: `What is the status of Mollie payment tr_test123 and which method was used?`
   - Tools: `get_payment`
   - Expected: Returns status and method for that payment only.
3. **Check balances**
   - Prompt: `What is my current Mollie balance?`
   - Tools: `list_balances`
   - Expected: Lists balances with currency and available amount.
4. **List payment methods**
   - Prompt: `Which Mollie payment methods can I offer for EUR?`
   - Tools: `list_methods`
   - Expected: Lists enabled methods for the profile, filtered to EUR.
5. **Review settlements**
   - Prompt: `List my latest Mollie settlements.`
   - Tools: `list_settlements`
   - Expected: Lists settlements with status and amount; read-only.

### Negative (must not trigger the plugin)

1. `Explain how Stripe webhooks verify signatures.`
2. `Write a SQL query that sums orders per customer.`
3. `Transfer 500 EUR from my bank account to my savings account.`
