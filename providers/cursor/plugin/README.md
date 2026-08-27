# Mollie for Cursor

Connects Cursor to your Mollie account via the [Mollie MCP server](https://docs.mollie.com/docs/mollie-mcp-server), plus integration skills that activate automatically when you're building a Mollie integration.

## Requirements

A Mollie Advanced access token with `profile.read` scope. Set `MOLLIE_API_ADVANCED_ACCESS_TOKEN` in your environment before installing.

## Installation

Go to **Settings → Plugins → Add local plugin** and point it at this directory, or install from the [Cursor marketplace](https://cursor.com/marketplace/mollie).

## Configuration

The MCP server connection is defined in [`mcp.json`](mcp.json) — no additional setup is required beyond the access token above.

## Skills

| Skill | Description |
|---|---|
| [`mollie-payments`](skills/mollie-payments/) | New integrations — payments, Connect (platforms/marketplaces), recurring/subscriptions, refunds/captures/settlements, troubleshooting |
| [`mollie-upgrade`](skills/mollie-upgrade/) | SDK version upgrades, and migrating from the Orders API to the Payments API |
| [`mollie-agent-toolkit`](skills/mollie-agent-toolkit/) | Building an AI agent that calls Mollie via `@mollie/agent-toolkit`, with write-tool safety guidance |
