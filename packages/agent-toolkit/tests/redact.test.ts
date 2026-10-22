import { describe, expect, it } from "vitest";
import { redactSensitiveData } from "../src/redact.js";

describe("redactSensitiveData", () => {
  it("redacts known-sensitive keys at the top level", () => {
    expect(
      redactSensitiveData({
        iban: "NL00BANK0123456789",
        cardNumber: "4111111111111111",
        cvv: "123",
        customerId: "cus_123",
        email: "customer@example.com",
        token: "secret-token",
        apiKey: "secret-key",
        password: "secret-password",
      }),
    ).toEqual({
      iban: "[REDACTED]",
      cardNumber: "[REDACTED]",
      cvv: "[REDACTED]",
      customerId: "[REDACTED]",
      email: "[REDACTED]",
      token: "[REDACTED]",
      apiKey: "[REDACTED]",
      password: "[REDACTED]",
    });
  });

  it("redacts known-sensitive keys matching case-insensitively", () => {
    expect(
      redactSensitiveData({ IBAN: "NL00BANK0123456789", CardNumber: "4111111111111111" }),
    ).toEqual({ IBAN: "[REDACTED]", CardNumber: "[REDACTED]" });
  });

  it("redacts sensitive keys nested inside objects", () => {
    expect(
      redactSensitiveData({
        payment: {
          amount: { value: "10.00", currency: "EUR" },
          consumerAccount: "NL00BANK0123456789",
        },
      }),
    ).toEqual({
      payment: {
        amount: { value: "10.00", currency: "EUR" },
        consumerAccount: "[REDACTED]",
      },
    });
  });

  it("redacts sensitive keys nested inside arrays of objects", () => {
    expect(
      redactSensitiveData([
        { id: "cus_1", email: "one@example.com", status: "active" },
        { id: "cus_2", email: "two@example.com", status: "inactive" },
      ]),
    ).toEqual([
      { id: "cus_1", email: "[REDACTED]", status: "active" },
      { id: "cus_2", email: "[REDACTED]", status: "inactive" },
    ]);
  });

  it("leaves non-sensitive fields unchanged", () => {
    const value = { amount: "10.00", currency: "EUR", status: "paid" };

    expect(redactSensitiveData(value)).toEqual(value);
  });

  it("does not mutate the input", () => {
    const value = {
      iban: "NL00BANK0123456789",
      payment: { amount: { value: "10.00", currency: "EUR" } },
    };
    const original = structuredClone(value);

    redactSensitiveData(value);

    expect(value).toEqual(original);
  });

  it("redacts additional keys passed via extraKeys", () => {
    expect(
      redactSensitiveData({ secretCode: "x" }, { extraKeys: ["secretCode"] }),
    ).toEqual({ secretCode: "[REDACTED]" });
  });

  it("returns primitives and null unchanged", () => {
    expect(redactSensitiveData(null)).toBe(null);
    expect(redactSensitiveData("hello")).toBe("hello");
    expect(redactSensitiveData(42)).toBe(42);
  });

  it("does not throw or hang on a circular reference", () => {
    const value: Record<string, unknown> = { status: "ok" };
    value.self = value;
    let result: unknown;

    expect(() => {
      result = redactSensitiveData(value);
    }).not.toThrow();
    expect(result).toEqual({ status: "ok", self: "[CIRCULAR]" });
  });

  it("redacts a shared (diamond) reference at both locations instead of flagging it circular", () => {
    const address = { email: "shared@example.com", city: "Amsterdam" };
    const value = { billing: address, shipping: address };

    expect(redactSensitiveData(value)).toEqual({
      billing: { email: "[REDACTED]", city: "Amsterdam" },
      shipping: { email: "[REDACTED]", city: "Amsterdam" },
    });
  });
});
