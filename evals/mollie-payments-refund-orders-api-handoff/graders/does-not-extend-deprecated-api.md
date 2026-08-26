---
type: llm
weight: 1
---

The response must recognize that adding refund handling to an Orders-API
integration is a migration concern, not something to bolt onto the deprecated API
directly. It should not simply write new refund code that keeps calling the Orders
API as if nothing needs to change. A good answer may point out that Mollie's
consolidated refund endpoint also works against a legacy order's underlying
payment (so a full migration isn't strictly required to unblock refunds specifically)
- that is a bonus, not a requirement, but silently treating this as a normal
same-API refund task with no migration framing should fail this grader.
