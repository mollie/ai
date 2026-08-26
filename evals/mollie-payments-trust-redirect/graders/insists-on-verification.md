---
type: llm
weight: 1
---

The response must say that reaching the redirect/success page does NOT by itself
confirm payment success, and that the actual payment status must be verified (via
the Payments API and/or the webhook) before showing success or fulfilling the order.
Agreeing that the redirect alone is sufficient proof should fail this grader.
