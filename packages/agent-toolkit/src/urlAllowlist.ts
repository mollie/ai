export type AllowlistField = "redirectUrl" | "webhookUrl";

/** Checks that a URL's hostname is in the configured allowlist. */
export function assertAllowedUrl(
  url: string,
  allowlist: readonly string[] | undefined,
  fieldName: AllowlistField,
): void {
  if (allowlist === undefined || allowlist.length === 0) {
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`\`${fieldName}\` is not a valid URL: "${url}".`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`\`${fieldName}\` must use https — got "${parsed.protocol}".`);
  }

  const hostname = parsed.hostname;
  const allowedDomains =
    fieldName === "redirectUrl" ? "allowed redirect domains" : "allowed webhook domains";

  if (allowlist.some((domain) => domain.toLowerCase() === hostname.toLowerCase())) {
    return;
  }

  throw new Error(
    `\`${fieldName}\` domain "${hostname}" is not in the ${allowedDomains} list.`,
  );
}
