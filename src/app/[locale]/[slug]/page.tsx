import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedCustomPage } from "@/lib/pages/adapter";
import { getSiteIdentity } from "@/lib/content";
import { resolvePublicMedia } from "@/lib/content/media";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

/**
 * CUSTOM PAGES — the `/{locale}/{slug}` route (§5, §15, §37, §43).
 *
 * A page created in the admin panel appears here the moment it is **published for this locale**.
 * Everything else answers a real 404:
 *
 *   · a slug that has no document,
 *   · a page that exists but is a draft,
 *   · a page published for Arabic only, requested in English (no silent AR→EN fallback — §15),
 *   · a system route (those have their own, static-authority routes and can never reach this file).
 *
 * The slug is never taken from the URL and trusted: `getPublishedCustomPage` matches the document
 * by its stored slug and additionally requires that the document has no `systemKey`, so a custom
 * route can never be used to shadow a system page. The canonical URL is derived from the real
 * route (`/{locale}/{slug}`) — a page's SEO contract can set its title, description, share image
 * and `noindex`, but it can never point the canonical somewhere else (§37).
 */

/* A published-or-404 decision has to happen per request: with a prerendered shell the visitor
   could receive HTTP 200 carrying a not-found body (a soft 404). */
export const instant = false;

type PageProps = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedCustomPage(slug, locale);
  if (!page) return {};
  const identity = await getSiteIdentity(locale);
  const shareImage = resolvePublicMedia(page.seo.ogImage as never, { locale });
  return buildMetadata({
    identity,
    locale,
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? "",
    path: `/${page.slug}`,
    noIndex: page.seo.noindex,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function CustomPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  /* Opt out of the prerendered shell BEFORE anything is flushed: a path that is not published has
     to answer a real 404 status, not a 200 carrying a not-found body (soft 404). */
  await connection();

  const page = await getPublishedCustomPage(slug, locale);
  if (!page) notFound();

  return <PageBlocks page={page} locale={locale} />;
}
