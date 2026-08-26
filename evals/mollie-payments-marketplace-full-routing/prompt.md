---
name: mollie-payments-marketplace-full-routing
description: >
  Deep routing test - a marketplace + one-time + hosted-checkout request that should
  make the skill synthesize Connect (OAuth/application fees) AND hosted checkout AND
  webhooks together, not just one dimension. Manually verified across 3 real turns
  on 2026-08-25 (Connect -> onboarding sub-question -> full checkout code using the
  seller's OAuth token, applicationFee, testmode, and 303 redirect). Encoded here as
  a single combined prompt since claude plugin eval's multi-turn context.history_file
  mechanism wasn't verified end-to-end (the harness is early-access-gated in this
  environment) - if multi-turn authoring is added later, this is the scenario to
  convert.
tags: [mollie-payments, routing, reference-coverage]
runs: 3
max_turns: 12
allowed_tools: [Skill, Read, Bash, Glob, Grep]
---

I'm building a marketplace where multiple independent sellers list products and get paid through my platform - sellers already have their own Mollie accounts and will connect via standard OAuth. Customers pay once per order (no recurring needed), and I want the simplest checkout with no custom frontend work. Node.js backend, test mode for now. Walk me through the full setup, including how the checkout and webhook should work.
