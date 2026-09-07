---
name: mollie-payments-sales-invoice-activation
description: A natural B2B invoicing question (no explicit skill name) should activate mollie-payments and route to the sales-invoices reference, not Mollie's own unrelated Invoices API or generic Payments API code.
tags: [mollie-payments, activation]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

How do I send one of my business customers a formal invoice for consulting work,
with 30-day payment terms and VAT itemized on the invoice?
