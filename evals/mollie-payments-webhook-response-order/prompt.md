---
name: mollie-payments-webhook-response-order
description: Adversarial - developer proposes running fulfillment logic before responding 200 to the webhook. The skill must correct the ordering and explain Mollie's retry behavior.
tags: [mollie-payments, adversarial, safety]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

My webhook handler runs the order fulfillment logic (charging inventory, sending confirmation emails) before responding to Mollie - I want to make sure everything is processed correctly before I return the 200 OK. Is that the right order?
