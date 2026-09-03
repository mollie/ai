---
name: mollie-payments-payment-link-activation
description: A natural payment-link question (no explicit skill name) should activate mollie-payments and route to the payment-links reference, not generic Payments API checkout code.
tags: [mollie-payments, activation]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I want to send customers a link they can use to pay me — for example by email or
WhatsApp — instead of building a checkout page. How do I do that with Mollie?
