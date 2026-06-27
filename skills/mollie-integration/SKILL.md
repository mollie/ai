---
name: mollie-integration
description: >
  Activate this skill when a developer is integrating Mollie payments into their application.
  This includes: accepting credit card payments, embedding Mollie Components (card fields),
  setting up a checkout flow, handling payment redirects, verifying webhooks, handling payment
  status updates, integrating Mollie in Next.js / React / Vue / vanilla JS, setting up Mollie
  in a backend (Node.js, PHP, Python, Ruby), creating payments via the API, using the Mollie
  SDK, handling card tokenisation, 3D Secure, Mollie.js, mollie-api-node, PCI compliance,
  card form, hosted checkout, payment links, iDEAL, credit card, SEPA, Klarna, Apple Pay,
  Google Pay, Bancontact, building a checkout, custom checkout, payment methods.
---

# Mollie Integration

## Step 1 — Identify the developer type

**Ask this first, before anything else:**

> Are you building this for your own business (accepting payments directly as a merchant),
> or are you building a platform or marketplace that processes payments on behalf of other businesses?

**If they are a platform or marketplace** — stop here. Do not proceed with a standard
integration. Tell them:

> Your use case requires **Mollie Connect**, not a standard Mollie integration. Mollie Connect
> is the suite for platforms and marketplaces that process payments on behalf of merchants.
> It uses OAuth to link merchant accounts to your platform and supports application fees,
> submerchant onboarding, and per-client payment processing.
> Start here: https://docs.mollie.com/docs/getting-started-with-mollie-connect

**Only continue if they are a merchant accepting payments for their own business.**

---

## Step 2 — Understand their checkout preference

Once you've confirmed they are a direct merchant, ask:

> How much control do you want over the payment experience?
>
> **A) Mollie-hosted checkout** — Mollie handles the entire payment page. Simplest to integrate;
> no frontend work required. Customers are redirected to Mollie to complete payment.
>
> **B) Build your own checkout** — You embed payment method selection and (optionally) card
> fields directly in your UI. More work, but full control over design and branding.
>
> Not sure? Here's the tradeoff: hosted checkout takes ~30 minutes to integrate and handles
> everything for you. A custom checkout takes longer but keeps customers on your page throughout.

---

## Step 3 — Understand their stack

Before writing any code, ask:

> What language and framework are you using?
> - Backend: Node.js / PHP / Python / Ruby / other?
> - Frontend: React / Vue / Next.js / vanilla JS / other?
> - Are you in test mode or live?

Use the answers to generate code with the correct SDK and idioms.

---

## Step 4 — Route to the correct integration

Based on their answers:

| Checkout preference | Card handling | Reference |
|---|---|---|
| Mollie-hosted checkout | Mollie handles card UI | `<references/hosted-checkout.md>` |
| Build your own — embed card fields | Mollie Components (Mollie.js) | `<references/components.md>` |
| Build your own — other methods only | Methods API + Payments API | `<references/build-your-own-checkout.md>` |

All integrations require webhook handling — always include it: `<references/webhooks.md>`

---

## SDK selection

Always use the official Mollie SDK for the developer's language:

| Language | Package |
|---|---|
| JavaScript / Node.js | `@mollie/api-client` |
| TypeScript | `mollie-api-typescript` |
| PHP | `mollie/mollie-api-php` (Composer) |
| Python | `mollie-api-python` |

Always use the v2 API. Never construct raw API calls when an SDK is available.

---

## Critical rules — apply to every integration

- **Never** put API keys (`live_xxx` / `test_xxx`) in frontend code. Only the profile ID (`pfl_xxx`) belongs in the browser.
- **Always** verify payment status via webhook before fulfilling an order — never trust the redirect URL alone.
- **Always** respond with HTTP 200 to webhook requests before doing any async work. Mollie retries on any other status.
- **Always** redirect customers to the checkout URL using HTTP GET (303 See Other), never POST.
- The profile ID used in `Mollie()` on the frontend **must** belong to the same account as the API key used on the backend.
- In test mode, pass `testmode: true` to `Mollie()` on the frontend AND use a test API key (`test_xxx`) on the backend. Both must match.
- When a card payment fails, create a **new card token** and a **new payment** — you cannot retry on the same payment.
- Never show a payment result to the customer until the webhook has been received and processed.
