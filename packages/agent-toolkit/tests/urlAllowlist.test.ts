import { describe, expect, it } from "vitest";
import { assertAllowedUrl } from "../src/urlAllowlist.js";

describe("assertAllowedUrl", () => {
  it("allows any URL when the allowlist is undefined", () => {
    expect(() =>
      assertAllowedUrl("not a URL", undefined, "redirectUrl"),
    ).not.toThrow();
    expect(() =>
      assertAllowedUrl("not a URL", undefined, "webhookUrl"),
    ).not.toThrow();
  });

  it("allows any URL when the allowlist is empty", () => {
    expect(() => assertAllowedUrl("not a URL", [], "redirectUrl")).not.toThrow();
    expect(() => assertAllowedUrl("not a URL", [], "webhookUrl")).not.toThrow();
  });

  it("allows a hostname in the allowlist", () => {
    expect(() =>
      assertAllowedUrl("https://example.com/callback", ["example.com"], "redirectUrl"),
    ).not.toThrow();
  });

  it("mentions the rejected hostname and field name when rejecting a URL", () => {
    expect(() =>
      assertAllowedUrl("https://evil.com/callback", ["example.com"], "redirectUrl"),
    ).toThrowError(/(?=.*evil\.com)(?=.*redirectUrl)/i);
  });

  it("matches hostnames case-insensitively", () => {
    expect(() =>
      assertAllowedUrl("https://example.com/x", ["Example.com"], "redirectUrl"),
    ).not.toThrow();
  });

  it("does not allow subdomains through a parent-domain entry", () => {
    expect(() =>
      assertAllowedUrl("https://checkout.example.com/x", ["example.com"], "redirectUrl"),
    ).toThrow();
  });

  it("rejects non-https URLs on an allowed hostname", () => {
    expect(() =>
      assertAllowedUrl("http://example.com/callback", ["example.com"], "webhookUrl"),
    ).toThrowError(/https/i);
  });

  it("mentions the field name when the URL is malformed", () => {
    expect(() =>
      assertAllowedUrl("not a URL", ["example.com"], "redirectUrl"),
    ).toThrowError(/redirectUrl/i);
  });
});
