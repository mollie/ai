export type RedactionOptions = {
  /** Additional key names (case-insensitive) to treat as sensitive, on top of the built-in list. */
  extraKeys?: readonly string[];
};

/**
 * Key names (matched case-insensitively) whose values are always redacted.
 * Covers the categories called out in write-action-safety guidance: card
 * data, IBAN-adjacent routing details, and customer identifiers.
 */
const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  "iban",
  "accountHolder",
  "accountHolderName",
  "cardNumber",
  "cardHolder",
  "cardFingerprint",
  "cardToken",
  "cvv",
  "cvc",
  "customerId",
  "consumerName",
  "consumerAccount",
  "email",
  "phone",
  "token",
  "apiKey",
  "authorization",
  "password",
];

const REDACTED = "[REDACTED]";
const CIRCULAR = "[CIRCULAR]";

/**
 * Deeply walks a value and replaces the value of any object key that matches
 * a known-sensitive field name (case-insensitive) with `"[REDACTED]"`.
 *
 * Intended for use just before logging request/response data or audit
 * events that may carry card data, IBAN-adjacent routing details, or
 * customer identifiers — see
 * `skills/mollie-payments/references/operations/write-action-safety.md`.
 *
 * Does not mutate the input. Matches keys regardless of nesting depth, and
 * guards against circular references so a self-referential object can't
 * turn logging into a crash (or hang) path.
 */
export function redactSensitiveData(value: unknown, options?: RedactionOptions): unknown {
  const sensitiveKeys = new Set(
    [...DEFAULT_SENSITIVE_KEYS, ...(options?.extraKeys ?? [])].map((key) => key.toLowerCase()),
  );
  return redactValue(value, sensitiveKeys, new WeakSet());
}

function redactValue(value: unknown, sensitiveKeys: ReadonlySet<string>, seen: WeakSet<object>): unknown {
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return CIRCULAR;
    }
    seen.add(value);
    const result = value.map((item) => redactValue(item, sensitiveKeys, seen));
    seen.delete(value);
    return result;
  }

  if (value !== null && typeof value === "object") {
    if (seen.has(value)) {
      return CIRCULAR;
    }
    seen.add(value);

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sensitiveKeys.has(key.toLowerCase())
        ? REDACTED
        : redactValue(val, sensitiveKeys, seen);
    }
    seen.delete(value);
    return result;
  }

  return value;
}
