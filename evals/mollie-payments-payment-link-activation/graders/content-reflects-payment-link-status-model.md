---
type: llm
weight: 1
---

The final response should treat a payment link as a shareable URL distinct from an
embedded checkout (no `redirectUrl`-driven live session), and should reflect that
status is tracked on the resulting payment(s), not on the link itself — e.g.
mentioning the webhook fires per payment, or that a reusable link needs
`listPayments` to see all payments made against it. A response that only shows
`payments.create()` / hosted-checkout code, or that treats the link's own GET
response as reflecting whether the customer paid, should fail this grader.
