import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { isCustomPageCandidate, isKnownPath } from "@/lib/routes";

const intlMiddleware = createMiddleware(routing);

/** Marks the internal request that renders the 404 body, so it is never re-checked. */
const INTERNAL_HEADER = "x-sl-notfound-render";

/**
 * Locale routing + real 404 status codes.
 *
 * The app is partially prerendered: an unknown path inside a locale would answer
 * 200 with a not-found page streamed into an already-committed shell — a soft 404
 * that search engines happily index. So unknown paths are detected here (before
 * anything is flushed) and answered with the localized not-found page plus a real
 * 404 status.
 */
export default async function proxy(request: NextRequest) {
  // The 404 body itself is rendered by /[locale]/not-found — let it through.
  if (request.headers.get(INTERNAL_HEADER) === "1") {
    return intlMiddleware(request);
  }

  const response = intlMiddleware(request);

  // Locale redirects (e.g. "/" → "/ar") pass straight through.
  if (response.status >= 300 && response.status < 400) return response;

  const match = request.nextUrl.pathname.match(/^\/(ar|en)(\/.*)?$/);
  if (!match) return response;

  const locale = match[1];
  const rest = (match[2] ?? "").replace(/\/+$/, "");

  const isPreview = rest === "/preview" || rest.startsWith("/preview/");

  if (isPreview) {
    /* §20/§21 — the preview surface answers a REAL 404 to anyone without an admin session.
       Two reasons it is decided here rather than only inside the route: (1) a streamed
       `notFound()` inside the locale layout is a soft 404 (status 200 with a 404 body), which is
       exactly what the rest of this file exists to prevent; (2) the page keeps its own permission
       check, so a stale or tampered cookie still fails closed — this is the cheap outer door, the
       route holds the real lock. No token ever reaches the HTML. */
    const session = request.cookies.get("payload-token")?.value;
    if (!session) return localizedNotFound(locale, request);

    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, private, max-age=0");
    return response;
  }

  if (isKnownPath(rest)) return response;

  /* A single-segment path outside the static table may still be a custom CMS page (§5/§39). Whether
     it is one is decided HERE, before anything is flushed: an unpublished slug has to answer a real
     404 status, and a route-level `notFound()` inside a streaming render only answers 200 with a
     not-found body on this stack (measured on `/[locale]/[slug]`). The slug list is read from the
     application itself; if that read ever fails, the request is let through, so a temporary API
     hiccup cannot take working pages down (the route still answers its own 404 body). */
  if (isCustomPageCandidate(rest)) {
    const published = await isPublishedCustomSlug(request, locale, rest.slice(1));
    if (!published) return localizedNotFound(locale, request);
    return response;
  }

  return localizedNotFound(locale, request);
}

/** Cached-for-nothing read of the published custom slugs (see the `/public-slugs` endpoint). */
async function isPublishedCustomSlug(request: NextRequest, locale: string, slug: string): Promise<boolean> {
  try {
    const response = await fetch(new URL("/api/pages/public-slugs", request.nextUrl.origin), {
      cache: "no-store",
      headers: { "sec-fetch-site": "same-origin" },
    });
    if (!response.ok) return true;
    const slugs = (await response.json()) as { ar?: string[]; en?: string[] };
    return (slugs[locale as "ar" | "en"] ?? []).includes(slug);
  } catch {
    return true;
  }
}

/** The localized not-found body with a real 404 status (see the file header). */
async function localizedNotFound(locale: string, request: NextRequest): Promise<NextResponse> {
  const target = new URL(`/${locale}/not-found`, request.url);

  try {
    const rendered = await fetch(target, {
      headers: { [INTERNAL_HEADER]: "1" },
      cache: "no-store",
    });
    const html = await rendered.text();

    return new NextResponse(html, {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex",
        "cache-control": "no-store",
      },
    });
  } catch {
    // Never block a visitor on a nice-to-have: fall back to the rewritten not-found page.
    const fallback = NextResponse.rewrite(target);
    fallback.headers.set("x-robots-tag", "noindex");
    return fallback;
  }
}

export const config = {
  // Skip API routes, the Payload admin, Next internals and any request with a file extension.
  // `admin` must be excluded or next-intl would redirect /admin to /ar/admin.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
