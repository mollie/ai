# Mollie AI

Resources for building AI-powered integrations with Mollie.

## Plugin installation

One command gives your AI coding assistant live access to your Mollie account (via the [Mollie MCP server](https://docs.mollie.com/docs/mollie-mcp-server)) plus integration skills that activate when you're building a Mollie integration.

```bash
# Claude Code
claude plugin install mollie@claude-community

# Codex
codex plugin add mollie@openai-curated

# Cursor
/add-plugin mollie
```

> **Requires** a Mollie Advanced access token with `profile.read` scope.  
> Set `MOLLIE_API_OAUTH_ORG_TOKEN` in your environment before installing.

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
| [`packages/agent-toolkit/examples/openai`](packages/agent-toolkit/examples/openai/) | Settlement reconciliation agent (OpenAI) |
| [`packages/agent-toolkit/examples/langchain`](packages/agent-toolkit/examples/langchain/) | Customer support agent with refund capability (LangChain) |
