---
name: mollie-payments-chargeback-filed
description: Reference-coverage - exercises references/operations/chargebacks-and-settlements.md. The API is read-only for chargebacks; the skill must not imply Mollie has a dispute/respond endpoint.
tags: [mollie-payments, reference-coverage]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

A customer just filed a chargeback on one of our payments. What do I need to do on the Mollie side?
