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

## Workflows

Ready-to-run agent workflows built on the agent toolkit.

| Workflow | Description |
|---|---|
| [`workflows/vercel-ai`](workflows/vercel-ai/) | Read-only payments and balance agent (Vercel AI SDK) |
| [`workflows/openai`](workflows/openai/) | Settlement reconciliation agent (OpenAI) |
| [`workflows/langchain`](workflows/langchain/) | Customer support agent with refund capability (LangChain) |
