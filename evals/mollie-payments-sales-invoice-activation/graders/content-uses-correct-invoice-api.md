---
type: llm
weight: 1
---

The final response should generate code against the Sales Invoices API
(`salesInvoices.create`, with `recipient`, `lines`, `paymentTerm`, `vatRate` per
line) — not Mollie's own unrelated Invoices API (`invoices.list`/`invoices.get`,
which bills the merchant for Mollie's fees and has no create/send action). A
response that fetches or references `client.invoices` for this request, or that
never mentions VAT line items / payment terms / a recipient, should fail this
grader.
