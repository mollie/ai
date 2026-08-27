# Mollie AI

Resources for building AI-powered integrations with Mollie.

## Plugin installation

The plugin gives your AI coding assistant live access to your Mollie account via the [Mollie MCP server](https://docs.mollie.com/docs/mollie-mcp-server), plus integration skills that activate when you're building a Mollie integration.

**Requires** a Mollie Advanced access token with `profile.read` scope. Set `MOLLIE_API_ADVANCED_ACCESS_TOKEN` in your environment before installing.

### Claude Code

Requires [Claude Code](https://code.claude.com/docs). Update first if `/plugin`
isn't recognised: `npm install -g @anthropic-ai/claude-code@latest`.

Installing is two steps – register the marketplace, then install the plugin:

```bash
# 1. Add this repo as a marketplace
claude plugin marketplace add mollie/ai

# 2. Install the plugin
claude plugin install mollie@mollie
```

Both commands also work as slash commands inside an interactive session
(`/plugin marketplace add mollie/ai`, then `/plugin install mollie@mollie`).

Then run `/reload-plugins` to activate it without restarting. The plugin's
skills are namespaced, e.g. `/mollie:<command>`.

#### Verifying

Run `/plugin` and open the **Installed** tab, or from the shell:

```bash
claude plugin list
```

#### Updating

```bash
claude plugin marketplace update mollie
```

### Cursor

Go to **Settings → Plugins → Add local plugin** and point it at [`providers/cursor/plugin`](providers/cursor/plugin/) — that's where the Mollie MCP server config and skills for Cursor live.

### Codex

```bash
codex plugin add github:mollie/ai
```

### Gemini CLI

```bash
gemini extensions install github:mollie/ai
```

## Repository layout

Skills are authored once in [`skills/`](skills/). Each tool's actual plugin — manifest, MCP config, and a copy of the skills — lives under `providers/<tool>/plugin/` (e.g. [`providers/claude/plugin`](providers/claude/plugin/)). The root `.claude-plugin/`, `.codex-plugin/`, and `.cursor-plugin/` folders only hold a `marketplace.json` pointer into the matching `providers/` directory.

After editing `skills/` or a provider's `plugin.json`, run:

```bash
node ci/generate-providers.mjs
```

to re-copy skills into each `providers/*/plugin/skills/` and sync plugin versions into the marketplace files. CI (`ci/validate-structure.mjs`) fails if `providers/` drifts out of sync with `skills/`.

## Skills

Skills activate automatically when you're working on a Mollie integration. They steer the AI toward correct patterns, up-to-date SDKs, and common pitfalls to avoid.

| Skill | Description |
|---|---|
| [`mollie-payments`](skills/mollie-payments/) | New integrations — payments, Connect (platforms/marketplaces), recurring/subscriptions, refunds/captures/settlements, troubleshooting |
| [`mollie-upgrade`](skills/mollie-upgrade/) | SDK version upgrades, and migrating from the Orders API to the Payments API |
| [`mollie-agent-toolkit`](skills/mollie-agent-toolkit/) | Building an AI agent that calls Mollie via `@mollie/agent-toolkit`, with write-tool safety guidance |

## Packages

| Package | Description |
|---|---|
| [`agent-toolkit`](packages/agent-toolkit/) | Use Mollie in AI agent frameworks (OpenAI, LangChain, Vercel AI SDK) |

## Examples

Ready-to-run agent examples built on the agent toolkit.

| Example | Description |
|---|---|
| [`packages/agent-toolkit/examples/vercel-ai`](packages/agent-toolkit/examples/vercel-ai/) | Read-only payments and balance agent (Vercel AI SDK) |
| [`packages/agent-toolkit/examples/openai`](packages/agent-toolkit/examples/openai/) | Settlement reconciliation agent (OpenAI Agents SDK) |
| [`packages/agent-toolkit/examples/langchain`](packages/agent-toolkit/examples/langchain/) | Customer support agent with refund capability (LangChain) |
