#!/usr/bin/env bash
set -euo pipefail

mkdir -p src
cat > src/orders.js <<'JS'
const mollieClient = require('@mollie/api-client')({ apiKey: process.env.MOLLIE_API_KEY });

async function createOrder(cart) {
  const order = await mollieClient.orders.create({
    amount: { currency: 'EUR', value: cart.total },
    orderNumber: cart.orderNumber,
    lines: cart.items.map((item) => ({
      type: 'physical',
      name: item.name,
      quantity: item.qty,
      unitPrice: { currency: 'EUR', value: item.price },
      totalAmount: { currency: 'EUR', value: item.lineTotal },
      vatRate: '21.00',
      vatAmount: { currency: 'EUR', value: item.vat },
    })),
    billingAddress: cart.billingAddress,
    redirectUrl: 'https://shop.example.com/checkout/return',
    webhookUrl: 'https://shop.example.com/webhooks/mollie',
    method: 'klarnapaylater',
  });
  return order;
}

async function shipOrder(orderId, lineIds) {
  return mollieClient.orders_shipments.create({
    orderId,
    lines: lineIds.map((id) => ({ id })),
  });
}

async function cancelOrder(orderId) {
  return mollieClient.orders.cancel(orderId);
}

module.exports = { createOrder, shipOrder, cancelOrder };
JS
