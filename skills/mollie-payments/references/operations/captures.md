# Captures (authorize-then-capture)

Before writing any capture code, read `<references/operations/write-action-safety.md>`.

Only relevant for methods that support authorize-then-capture: **credit cards**
(with `captureMode: manual`), **Klarna Pay Later**, **Klarna Slice It**, **Billie**,
and **Riverty**. Every other method captures automatically at payment time — skip
this file for those.

## When to use manual capture

Use it when you can't fulfil the order immediately — e.g. made-to-order goods, or
anything that takes more than 24 hours to ship. Authorize at checkout, capture once
the order actually ships.

## 1. Create the payment with `captureMode: manual`

```javascript
const payment = await mollie.payments.create({
  method: 'klarnapaylater',
  captureMode: 'manual',
  amount: { currency: 'EUR', value: '99.00' },
  description: 'Order #4567',
  redirectUrl: 'https://example.com/orders/4567/complete',
  webhookUrl: 'https://example.com/webhooks/mollie',
  // Klarna specifically requires order lines and address data on the payment —
  // see Klarna-specific docs before shipping this to production.
});
```

If the customer completes the payment with a method that doesn't support manual
capture, the payment goes straight to `paid` — check the resulting `status`, don't
assume `authorized`.

## 2. Wait for `authorized` status

The payment reaches `authorized` after the customer completes checkout. It stays
`authorized` until you capture it or the authorization expires — check Klarna's
current authorization window before relying on it (28 days at time of writing, but
confirm against current docs before shipping).

## 3. Capture when ready to fulfil

```javascript
const capture = await mollie.paymentCaptures.create({
  paymentId: 'tr_7UhSN1zuXS',
  amount: { currency: 'EUR', value: '99.00' },  // omit to capture the full authorized amount
});
```

- Requires `payments.write` scope (API key, advanced access token, or OAuth token) —
  Mollie has no separate scope for captures; confirm against current docs before
  shipping.
- Some methods support **multiple partial captures** — after a partial capture
  succeeds, the remaining authorized amount stays available and the payment remains
  `authorized`. Once the full amount is captured, status moves to `paid`.
- If you decide not to fulfil the order, release the hold instead of capturing —
  cancel the payment while it's in `authorized` status rather than leaving it to
  expire.

## Common mistakes

| Mistake | Fix |
|---|---|
| Setting `captureMode: manual` on a method that doesn't support it | Check the method supports authorize-then-capture first; it silently goes straight to `paid` otherwise |
| Assuming capture is synchronous with shipping | Capture explicitly via the API when you ship — it does not happen automatically |
| Letting an authorization silently expire when the order won't ship | Explicitly cancel the payment to release the hold |
| Capturing more than the authorized amount | Capture amount must be ≤ the remaining authorized amount |
