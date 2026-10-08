import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import type { PublicPage } from "@/lib/pages/adapter";
import { runtimeOrigin } from "@/lib/site-origin";

/**
 * DRAFT PREVIEW — the only reader of unpublished content (§20, §21).
 *
 * Contract enforced here, not by hope:
 *  · authorization — two locks: the proxy answers a real 404 to any request without an admin
 *    session cookie, and `GET /api/pages/preview-data` (which supplies the data) re-checks
 *    `pages.read`. A stale or forged cookie therefore fails closed and shows nothing.
 *  · no token in HTML — the session cookie is HttpOnly and stays in the request; no preview token
 *    is ever embedded in the markup and there is no shareable link that bypasses the session.
 *  · draft, not published — the data comes from the newest DRAFT (all locales read explicitly), so
 *    an editor sees unsaved-to-public work; the public routes never call this path.
 *  · never indexable, never cached — noindex header from the proxy plus route metadata, `no-store`
 *    everywhere, absent from the sitemap, never linked from a public page.
 *  · private media stays private — media resolution is the same public filter the renderer uses, so
 *    a private asset shows as a placeholder here instead of leaking its URL.
 *  · request-time on every visit — the read goes through a `cache: "no-store"` fetch (below), which
 *    is what keeps it out of the prerendered shell; measured, not assumed: while the read happened
 *    directly in this component the preview kept serving the build-time draft for 300 s.
 *  · cacheComponents is untouched — a route-level opt-out, never a global switch.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "معاينة — Seven Lands",
  robots: { index: false, follow: false, nocache: true },
};

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ path?: string | string[] }>;
};

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  /* Opt out of the prerendered shell before anything is flushed (§21). */
  await connection();

  const query = await searchParams;
  const raw = Array.isArray(query.path) ? query.path[0] : query.path;
  const target = (raw ?? "/").trim() || "/";

  return (
    <Suspense
      fallback={
        <div className="container-x py-16 text-[0.9375rem] text-steel-600" role="status">
          جارٍ تحميل المعاينة…
        </div>
      }
    >
      <PreviewBody locale={locale} target={target} />
    </Suspense>
  );
}

async function PreviewBody({ locale, target }: { locale: AppLocale; target: string }): Promise<ReactNode> {
  const requestHeaders = await headers();
  const jar = await cookies();

  const response = await fetch(
    `${runtimeOrigin(requestHeaders)}/api/pages/preview-data?path=${encodeURIComponent(target)}&locale=${locale}`,
    {
      headers: {
        cookie: jar.toString(),
        /* Payload only trusts a cookie when the request is recognisably same-origin or a direct
           navigation (`Sec-Fetch-Site: same-origin|same-site|none`). A server-side fetch sends no
           Sec-Fetch-* header at all, so the session would be treated as anonymous — measured. */
        "sec-fetch-site": "same-origin",
      },
      cache: "no-store",
    },
  );
  if (!response.ok) notFound();

  const payload = (await response.json()) as PublicPage & {
    pagePaths: Record<string, string>;
    localeState: Record<string, { state?: string | null } | undefined>;
  };
  const page: PublicPage = { ...payload, pagePaths: new Map(Object.entries(payload.pagePaths ?? {})) };

  const state = payload.localeState?.[locale]?.state ?? "draft";
  const isPublished = state === "published";

  return (
    <>
      {/* The preview bar is admin chrome, never part of the public design: it exists only inside a
          session-authorized preview and names the page, the language and the live state. */}
      <div className="border-b border-ink-950/15 bg-ink-950 text-white">
        <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[0.8125rem]">
          <span className="font-medium">معاينة</span>
          <span className="text-white/70">
            {page.path} · {locale === "ar" ? "العربية" : "English"} ·{" "}
            {isPublished ? "النسخة المنشورة" : "مسودة غير منشورة"}
          </span>
          <Link
            href={page.path === "/" ? "/" : page.path}
            className="ms-auto text-white/80 underline underline-offset-4 transition-colors hover:text-white"
          >
            عرض الصفحة العامة
          </Link>
        </div>
      </div>

      <PageBlocks page={page} locale={locale} />
    </>
  );
}
