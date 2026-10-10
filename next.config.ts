import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

const isProd = process.env.NODE_ENV === "production";

/**
 * NOTE ON SECURITY HEADERS
 * `X-Frame-Options` / `frame-ancestors` are intentionally NOT set here: preview and
 * staging environments embed the app in an iframe. Set framing rules at the hosting
 * layer once the production domain is confirmed.
 */
/**
 * A deliberately conservative CSP: it locks down script/style/object/base origins
 * without needing nonces (Next.js streams inline bootstrap scripts).
 * Native tracking domains for GA4, GTM, Meta, Snap, TikTok, Clarity, LinkedIn
 * are permitted on script-src, img-src, and connect-src.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://7-lands.com https://www.7-lands.com https://*.vercel.app https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://tr.snapchat.com https://analytics.tiktok.com https://px.ads.linkedin.com https://c.clarity.ms",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://sc-static.net https://analytics.tiktok.com https://snap.licdn.com https://www.clarity.ms",
  "connect-src 'self' https://7-lands.com https://www.7-lands.com https://*.vercel.app https://ghostmind.optdmsa.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://connect.facebook.net https://tr.snapchat.com https://analytics.tiktok.com https://px.ads.linkedin.com https://*.clarity.ms",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Allows the sandboxed preview host to reach the dev server's assets.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 390, 430, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      /*
       * MEDIA FILE RESPONSES — REVOCATION-SAFE BY DEFAULT (§6 of the completion brief).
       *
       * A media document can be switched public → private at any moment, and the same bytes are
       * served to anonymous visitors and to the admin. A shared cache that keeps a copy of an
       * asset after it returns to `private` would defeat the visibility rule entirely — and no
       * filename trick fixes that, which is the point.
       *
       * So: every media file response is `private, no-store`. Any cache that understands
       * Cache-Control (browser, CDN, proxy) must not store it, and revocation is immediate.
       * The cost is real — public artwork revalidates instead of being served from cache — and it
       * is the correct default while media access is security-relevant. The step that removes the
       * cost is documented, not assumed: a later object-storage phase serves public assets from a
       * CDN path with explicit purge-on-transition, and keeps private ones behind short-lived
       * signed URLs (docs/phase-c/MEDIA_VISIBILITY.md).
       */
      {
        /*
         * Phase D §7 — the SVG backstop. SVG is the one image format that can carry script, and it
         * reaches the browser through this route. The upload gate refuses dangerous SVGs before they
         * are stored; this header makes the refusal hold even for a file that slipped through: if the
         * bytes are opened directly or embedded in an object/iframe, the document runs with no
         * scripts, no network access and a sandbox. It is inert for raster images, so it is applied to
         * every media response rather than guessed from an extension in a header rule.
         */
        source: "/api/media/file/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Content-Security-Policy", value: "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/*
 * Phase A — Payload wraps the config.
 * `withPayload` is applied OUTSIDE the next-intl plugin so both sets of additions
 * survive: it preserves our existing `turbopack` rules and our `headers()` function,
 * and adds serverExternalPackages (graphql, sharp, drizzle-kit, …) plus an
 * Accept-CH/Vary pair used by the admin's colour-scheme negotiation.
 * It does NOT change cacheComponents — that interaction is verified, not configured away.
 */
const payloadConfig = withPayload(withNextIntl(nextConfig));

/*
 * CLIENT-HINT SCOPING
 *
 * `withPayload` appends its client-hint negotiation AFTER our own `headers()` entries, on
 * `source: "/:path*"`:
 *
 *     Accept-CH:   Sec-CH-Prefers-Color-Scheme
 *     Critical-CH: Sec-CH-Prefers-Color-Scheme
 *     Vary:        Sec-CH-Prefers-Color-Scheme
 *
 * `Critical-CH` tells the browser the response is unusable without those hints, so it discards it
 * and re-issues the navigation. The admin genuinely needs that (it applies the stored colour scheme
 * before first paint); the public site does not — no public byte depends on a client hint, and every
 * public navigation was paying a forced re-request for a hint nobody reads.
 *
 * The fix works WITH the official wrapper: we take the config it returns and narrow the `source` of
 * the rules that carry client-hint headers to the admin. No node_modules patch, no fork, no
 * middleware, and the rest of Payload's additions (serverExternalPackages, its routes) are intact.
 * The security headers stay catch-all.
 */
const CLIENT_HINT_HEADERS = ["accept-ch", "critical-ch"];

function scopeClientHints(config: typeof payloadConfig): typeof payloadConfig {
  const previous = config.headers;
  if (!previous) return config;
  return {
    ...config,
    async headers() {
      const rules = await previous();
      return rules.map((rule) => {
        const carriesClientHints = rule.headers.some((header) =>
          CLIENT_HINT_HEADERS.includes(header.key.toLowerCase()),
        );
        if (!carriesClientHints) return rule;
        /* Already narrow (someone scoped it properly): leave it alone. */
        if (rule.source !== "/:path*") return rule;
        return { ...rule, source: "/admin/:path*" };
      });
    },
  };
}

/*
 * Escape hatch used ONLY to measure the cost of the scoping above (scripts/measure-nav-cost.mjs
 * builds once with and once without it, then compares). It is not a runtime switch: headers() is
 * baked into the routes manifest at build time, so the flag cannot change behaviour in a running
 * server. Leave it unset.
 */
export default process.env.CLIENT_HINTS_UNSCOPED === "true" ? payloadConfig : scopeClientHints(payloadConfig);
