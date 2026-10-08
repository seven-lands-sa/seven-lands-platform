import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { articles, publishedArticles } from "@/content/insights";
import { site } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

/**
 * ARTICLE TEMPLATE — complete and production-ready, deliberately empty.
 * No articles exist yet (`articles` is empty), so every slug 404s and the hub
 * shows its honest state. Publishing an entry activates this template, the hub
 * listing, the sitemap and Article structured data.
 */

type PageProps = { params: Promise<{ locale: AppLocale; slug: string }> };

/**
 * NO CONTENT YET → nothing to pre-render.
 * Cache Components requires every `generateStaticParams` to return at least one
 * result, so it is not exported while the collection is empty. With the first
 * really publishable entry, restore it:
 *
 *   export function generateStaticParams() {
 *     return routing.locales.flatMap((locale) =>
 *       publishedArticles.map((article) => ({ locale, slug: article.slug })),
 *     );
 *   }
 *
 * Until then the route renders on demand and every slug 404s by design.
 */
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = publishedArticles.find((a) => a.slug === slug);
  if (!article) return {};

  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: article.title,
    description: article.excerpt,
    path: `/insights/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);

  const article = articles.find((a) => a.slug === slug);
  if (!article || !article.published) notFound();

  const t = await getTranslations({ locale, namespace: "insights" });
  const tMeta = await getTranslations({ locale, namespace: "meta.insights" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              datePublished: article.date,
              inLanguage: locale === "ar" ? "ar-SA" : "en",
              mainEntityOfPage: `${site.url}/${locale}/insights/${article.slug}`,
              publisher: { "@id": `${site.url}/#organization` },
            },
            breadcrumbSchema(locale, [
              { name: tMeta("title"), path: "/insights" },
              { name: article.title, path: `/insights/${article.slug}` },
            ], identity),
          ]),
        }}
      />

      <article className="bg-white">
        <header className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
          <div className="container-x">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[0.8125rem] text-muted">
              <Link href="/insights" className="transition-colors duration-200 hover:text-ink-950">
                {t("backToInsights")}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="num">{formatDate(article.date, locale)}</span>
            </nav>

            <h1 className="display-1 max-w-[28ch]">{article.title}</h1>
            <p className="lede measure mt-6 text-[1.0625rem]">{article.excerpt}</p>
          </div>
        </header>

        <Section tone="white">
          <div className="mx-auto flex max-w-[68ch] flex-col gap-6">
            {article.body.map((paragraph) => (
              <p key={paragraph} className="text-[1.0625rem] leading-[1.95] text-steel-600">
                {paragraph}
              </p>
            ))}
          </div>
        </Section>
      </article>

      <Section tone="light" size="compact">
        <ButtonLink href="/insights" variant="secondary">
          <span>{t("backToInsights")}</span>
          <ArrowRight />
        </ButtonLink>
      </Section>

      <FinalCta />
    </>
  );
}
