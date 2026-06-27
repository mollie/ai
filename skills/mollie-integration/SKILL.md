---
name: mollie-integration
description: >
  Activate this skill when a developer is integrating Mollie payments into their application.
  This includes: accepting credit card payments, embedding Mollie Components (card fields),
  setting up a checkout flow, handling payment redirects, verifying webhooks, handling payment
  status updates, integrating Mollie in Next.js / React / Vue / vanilla JS, setting up Mollie
  in a backend (Node.js, PHP, Python, Ruby), creating payments via the API, using the Mollie
  SDK, handling card tokenization, 3D Secure, Mollie.js, mollie-api-node, PCI compliance,
  card form, hosted checkout, payment links, iDEAL, credit card, SEPA, klarna.
---

# Mollie Integration

## Versions & SDK

Always use the latest Mollie SDK for the developer's language unless they specify otherwise.

- **JavaScript/Node.js**: `@mollie/api-client` (npm)
- **TypeScript**: `mollie-api-typescript` (npm) — preferred for TypeScript projects
- **PHP**: `mollie/mollie-api-php` (Composer)
- **Python**: `mollie-api-python` (pip)

API version: always use the current v2 API (`https://api.mollie.com/v2/`).

## Routing by use case

| What the developer wants | Integration path | Reference |
|---|---|---|
| Embed card fields in their own checkout UI | Mollie Components (Mollie.js) | `<references/components.md>` |
| Redirect to a Mollie-hosted payment page | Hosted checkout flow | `<references/hosted-checkout.md>` |
| Handle webhooks and payment status | Webhook handling | `<references/webhooks.md>` |
| Save cards for returning customers | Recurring / mandates | `<references/recurring.md>` |

## Critical rules

- **Never** put API keys (`live_...` / `test_...`) in frontend code. Only the profile ID (`pfl_...`) belongs in the browser.
- **Always** verify payment status via webhook before fulfilling an order — never trust the redirect URL alone.
- **Always** respond with HTTP 200 to webhook requests, even if you cannot process them immediately. Queue failed ones for retry.
- **Always** redirect customers to the checkout URL using HTTP GET (303 See Other), never POST.
- When a card payment fails, create a **new card token** and a **new payment** — failed payments cannot be retried.
- The profile ID used in `Mollie()` on the frontend **must** belong to the same account as the API key used on the backend.
- In test mode, pass `testmode: true` to `Mollie()` on the frontend AND use a test API key (`test_...`) on the backend.
