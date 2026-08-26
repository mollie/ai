---
name: mollie-payments-refund-orders-api-handoff
description: >
  Cross-skill boundary test - a refund request that turns out to be on the old
  Orders API should route to mollie-upgrade (per mollie-payments' own Step 1 rule),
  not have refund code bolted onto the deprecated API. Manually verified across 2
  real turns on 2026-08-25, where the model started in mollie-payments, then
  explicitly said "that's a migration case" and pulled in mollie-upgrade mid-
  conversation. Encoded here as a single combined prompt for the same reason as the
  marketplace-full-routing case (multi-turn history_file unverified in this
  environment).
tags: [mollie-payments, mollie-upgrade, routing, cross-skill]
runs: 3
max_turns: 10
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I need to add refund handling to my Mollie integration, but it still uses the old Orders API - we call mollieClient.orders.create() and store orderNumber. Does that change anything for the refund code?
