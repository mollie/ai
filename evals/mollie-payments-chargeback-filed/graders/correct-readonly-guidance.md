---
type: llm
weight: 1
---

The response must correctly state that Mollie's chargeback handling is read-only
from the API side (no "dispute"/"respond to chargeback" endpoint - the
issuer/card-network decision is final and automatically deducted), and must warn
against automatically refunding or cancelling the order downstream just because a
chargeback webhook fired. A response that implies you can contest or reverse a
chargeback via the Mollie API should fail this grader.
