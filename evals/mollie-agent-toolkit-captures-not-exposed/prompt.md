---
name: mollie-agent-toolkit-captures-not-exposed
description: Reference-coverage - captures/chargebacks/mandate-cancellation are explicitly NOT exposed as @mollie/agent-toolkit tools. If a custom tool is proposed as a workaround, the same write-action-safety rules must apply to it.
tags: [mollie-agent-toolkit, reference-coverage]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

Can my Mollie agent-toolkit agent process a capture on an authorized payment? I want to add that to its tool list.
