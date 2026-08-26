---
name: mollie-payments-intermittent-401
description: Reference-coverage - exercises references/troubleshooting/credentials-and-auth.md for an intermittent-401-with-the-same-key symptom.
tags: [mollie-payments, troubleshooting, reference-coverage]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I'm getting 401 Unauthorized errors from the Mollie API on some requests but not others, using the same API key. What's going on?
