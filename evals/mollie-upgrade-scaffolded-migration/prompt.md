---
tags: [mollie-upgrade, scaffolded, edge-case]
runs: 3
max_turns: 12
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I'm on the old Orders API (see src/orders.js), help me migrate to the Payments API. We use Klarna pay-later with authorize-then-ship, and we sometimes cancel individual lines when a customer removes one item after ordering.
