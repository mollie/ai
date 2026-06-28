# Mollie AI

Resources for building AI-powered integrations with Mollie.

## Agent Skills

Skills are instruction sets that activate in AI coding assistants (Claude Code, Cursor, etc.)
when a developer is working on a Mollie integration. They steer the AI toward correct patterns,
up-to-date SDKs, and common pitfalls to avoid.

### Available skills

| Skill | Description |
|---|---|
| [`mollie-integration`](skills/mollie-integration/) | Accepting payments, Mollie Components, webhooks |

### Installation

```bash
# Claude Code
claude skill add https://raw.githubusercontent.com/mollie/ai/main/skills/mollie-integration/SKILL.md
```

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
