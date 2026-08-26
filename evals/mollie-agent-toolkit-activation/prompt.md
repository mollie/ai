---
name: mollie-agent-toolkit-activation
description: A natural agent-building question should activate mollie-agent-toolkit and follow its Step 1 (ask which framework) rather than assuming one.
tags: [mollie-agent-toolkit, activation]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

Build an agent that can check Mollie balances using @mollie/agent-toolkit.
