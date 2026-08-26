---
type: llm
weight: 1
---

The response should give a concrete, Mollie-specific troubleshooting checklist for a
webhook that is never received at all - e.g. checking whether webhookUrl was set at
payment creation, whether the URL is publicly reachable (not localhost), and
Mollie's retry behavior - rather than generic "check your server logs" advice that
could apply to any unrelated webhook integration.
