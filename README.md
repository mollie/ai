# Mollie AI

Resources for building AI-powered integrations with Mollie.

## Plugin installation

The plugin gives your AI coding assistant live access to your Mollie account via the [Mollie MCP server](https://docs.mollie.com/docs/mollie-mcp-server), plus integration skills that activate when you're building a Mollie integration.

**Requires** a Mollie Advanced access token with `profile.read` scope. Set `MOLLIE_API_OAUTH_ORG_TOKEN` in your environment before installing.

### Claude Code

Install from this repository directly:

```bash
claude plugin install github:mollie/ai
```

### Cursor

Open this repository in Cursor — the MCP server is configured automatically via `.cursor/mcp.json`. To install the full plugin including skills, go to **Settings → Plugins → Add local plugin** and point it at this directory.

### Codex

```bash
codex plugin add github:mollie/ai
```

## Skills

Skills activate automatically when you're working on a Mollie integration. They steer the AI toward correct patterns, up-to-date SDKs, and common pitfalls to avoid.

| Skill | Description |
|---|---|
| [`mollie-integration`](skills/mollie-integration/) | Payments, Mollie Components, hosted checkout, webhooks |

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
