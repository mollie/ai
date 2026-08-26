---
name: mollie-upgrade-activation
description: A natural Orders-to-Payments migration question should activate mollie-upgrade. With no real Orders API code in the sandbox, the correct behavior is to ask for the actual codebase rather than inventing migration steps from nothing.
tags: [mollie-upgrade, activation]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I'm on the old Orders API, help me migrate to the Payments API.
