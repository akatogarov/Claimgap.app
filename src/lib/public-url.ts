/**
 * NEXT_PUBLIC_URL is used at build time (metadata) and runtime (Stripe, emails).
 * Empty strings or malformed values must not crash `next build` or produce invalid redirects.
 */
export function metadataBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* fall through */
    }
  }
  return new URL("http://localhost:3000");
}

/** Origin (+ optional pathname) without trailing slash — for Stripe return URLs and emails. */
export function publicSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_URL?.trim();
  if (!raw) return "http://localhost:3000";
  try {
    const u = new URL(raw);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}
