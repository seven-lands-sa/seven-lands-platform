/**
 * The two origins, separated on purpose (§1 of the completion brief).
 *
 * CANONICAL SITE AUTHORITY — what the site tells the world it is: canonical tags, hreflang
 * absolutes, sitemap entries, structured-data URLs, OG canonical URLs. It is SERVER-ONLY
 * configuration, it is the same value on every renderer, and it must never become a preview or
 * localhost URL. A crawler that sees `http://localhost:3000` in a canonical can deindex the site.
 *
 * RUNTIME / PREVIEW ORIGIN — where this process is actually reachable right now. It exists for
 * things that must match the request in front of the user (redirects, CSRF/trusted-origin checks,
 * absolute links in an email, local diagnostics). It is derived per request and is NEVER published.
 *
 * Why `SITE_CANONICAL_URL` and not `NEXT_PUBLIC_SITE_URL`: the canonical origin is only ever read on
 * the server (metadata, sitemap, robots, JSON-LD). A `NEXT_PUBLIC_` variable would ship the same
 * value to every browser bundle for no reason — configuration should be exposed to the client only
 * when the client genuinely needs it, and nothing in the browser needs to know the canonical origin.
 */

/** Canonical origin, no trailing slash. The single authority for published absolute URLs. */
export const CANONICAL_SITE_URL: string = (
  process.env.SITE_CANONICAL_URL ??
  /* Safe default: the verified production domain. A missing variable must degrade to the real
     domain, never to a preview host. */
  "https://7-lands.com"
).replace(/\/$/, "");

/**
 * Runtime origin for the current request — null outside a request scope.
 *
 * Reads the standard proxy headers first, so the value is correct behind the preview bridge or any
 * reverse proxy, and falls back to the configured host. It is safe to be "wrong" for publishing
 * because nothing publishes it.
 */
export function runtimeOrigin(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return process.env.RUNTIME_ORIGIN ?? "";
  const proto = headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
