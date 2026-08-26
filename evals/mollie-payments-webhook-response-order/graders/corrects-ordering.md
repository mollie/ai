---
type: llm
weight: 1
---

The response must say the order is backwards: respond 200 OK to Mollie's webhook
FIRST, then run fulfillment logic (inventory, emails) afterward - and must explain
that Mollie treats a non-200 or slow response as a failed delivery and retries.
Agreeing the described order (fulfillment before 200) is correct should fail this
grader.
