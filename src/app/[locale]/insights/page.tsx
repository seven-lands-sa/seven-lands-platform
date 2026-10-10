import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { publishedArticles } from "@/content/insights";
import { site } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.insights" });
  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: t("title"),
    description: t("description"),
    path: "/insights",
  });
}

export default async function InsightsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "insights" });
  const tMeta = await getTranslations({ locale, namespace: "meta.insights" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const featured = publishedArticles[0];
  const gridArticles = publishedArticles.slice(1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(locale, [{ name: tMeta("title"), path: "/insights" }], identity),
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              headline: t("hero.title"),
              description: t("hero.lede"),
              inLanguage: locale === "ar" ? "ar-SA" : "en",
              hasPart: publishedArticles.map((article) => ({
                "@type": "Article",
                headline: article.title[locale],
                description: article.excerpt[locale],
                datePublished: article.date,
                image: `${site.url}${article.coverImage}`,
                url: `${site.url}/${locale}/insights/${article.slug}`,
              })),
            },
          ]),
        }}
      />

      {/* HERO SECTION */}
      <section className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.8125rem] text-muted transition-colors duration-200 hover:text-ink-950"
            >
              <span>{tCta("backHome")}</span>
            </Link>
          </nav>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white/80 px-3.5 py-1 text-[0.75rem] font-semibold text-ink-950 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-ice-500 animate-pulse" />
                {t("hero.eyebrow")}
              </span>
              <h1 className="display-1 mt-6 max-w-[22ch]">{t("hero.title")}</h1>
            </div>
            <div className="lg:col-span-4">
              <p className="lede text-[1.0625rem] leading-relaxed text-steel-700">{t("hero.lede")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      {featured && (
        <Section tone="white" aria-labelledby="featured-heading">
          <div className="mb-8 flex items-center justify-between border-b border-ink-950/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-ice-500" />
              <h2 id="featured-heading" className="text-[0.8125rem] font-bold tracking-wider uppercase text-ink-950">
                {t("featuredLabel")}
              </h2>
            </div>
            <span className="text-[0.8125rem] font-medium text-muted">
              {formatDate(featured.date, locale)}
            </span>
          </div>

          <div className="group relative overflow-hidden rounded-[1.75rem] border border-ink-950/12 bg-offwhite p-5 transition-all duration-300 hover:border-ink-950/25 hover:shadow-xl lg:p-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Cover Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem] bg-ink-950/5 lg:col-span-7">
                <Image
                  src={featured.coverImage}
                  alt={featured.coverImageAlt[locale]}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
                <div className="absolute top-4 start-4">
                  <span className="rounded-full bg-white/95 px-3.5 py-1 text-[0.75rem] font-bold text-ink-950 shadow-md backdrop-blur-sm">
                    {featured.category[locale]}
                  </span>
                </div>
              </div>

              {/* Text Meta */}
              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-[0.75rem] font-semibold text-muted">
                    <span className="rounded-md bg-ink-950/5 px-2.5 py-1">
                      {tc("readingTime", { minutes: featured.readingMinutes })}
                    </span>
                    <span>·</span>
                    <span>{featured.author[locale]}</span>
                  </div>

                  <h3 className="display-2 mt-4 text-[1.75rem] leading-[1.3] text-ink-950 group-hover:text-ice-600 transition-colors duration-200 lg:text-[2rem]">
                    <Link href={`/insights/${featured.slug}`}>
                      {featured.title[locale]}
                    </Link>
                  </h3>

                  <p className="mt-4 text-[1rem] leading-[1.8] text-steel-600">
                    {featured.excerpt[locale]}
                  </p>
                </div>

                <div className="pt-2">
                  <ButtonLink href={`/insights/${featured.slug}`} size="lg" variant="primary">
                    <span>{locale === "ar" ? "قراءة التحليل الكامل" : "Read Full Analysis"}</span>
                    <ArrowRight />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ARTICLES GRID */}
      {gridArticles.length > 0 && (
        <Section tone="light" aria-labelledby="latest-heading">
          <div className="mb-10 flex items-center justify-between border-b border-ink-950/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-ink-950/40" />
              <h2 id="latest-heading" className="text-[0.875rem] font-bold tracking-wider uppercase text-ink-950">
                {t("latestLabel")}
              </h2>
            </div>
            <span className="text-[0.8125rem] text-muted">
              {locale === "ar" ? `${gridArticles.length} تحليلات إضافية` : `${gridArticles.length} more analyses`}
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {gridArticles.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-ink-950/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ink-950/25 hover:shadow-xl lg:p-6"
              >
                <div>
                  {/* Article Thumbnail */}
                  <Link href={`/insights/${article.slug}`} className="block">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1rem] bg-ink-950/5">
                      <Image
                        src={article.coverImage}
                        alt={article.coverImageAlt[locale]}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute top-3.5 start-3.5">
                        <span className="rounded-full bg-white/95 px-3 py-0.5 text-[0.7rem] font-bold text-ink-950 shadow-xs backdrop-blur-sm">
                          {article.category[locale]}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Header Meta */}
                  <div className="mt-5 flex items-center justify-between text-[0.75rem] font-medium text-muted">
                    <span>{formatDate(article.date, locale)}</span>
                    <span className="rounded-md bg-offwhite px-2 py-0.5">
                      {tc("readingTime", { minutes: article.readingMinutes })}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <h3 className="display-3 mt-3 text-[1.25rem] leading-[1.4] text-ink-950 transition-colors duration-200 group-hover:text-ice-600">
                    <Link href={`/insights/${article.slug}`}>
                      {article.title[locale]}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-[1.8] text-steel-600">
                    {article.excerpt[locale]}
                  </p>
                </div>

                {/* Footer Link & Tags */}
                <div className="mt-6 border-t border-ink-950/8 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags[locale].slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-offwhite px-2.5 py-0.5 text-[0.6875rem] font-medium text-steel-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/insights/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-ink-950 transition-colors duration-200 group-hover:text-ice-600"
                    >
                      <span>{locale === "ar" ? "قراءة" : "Read"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* STRATEGIC ADVISORY CALLOUT */}
      <Section tone="white">
        <div className="overflow-hidden rounded-[2rem] border border-ink-950/15 bg-gradient-to-br from-ink-950 to-steel-900 p-8 text-white shadow-2xl lg:p-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="rounded-full bg-ice-500/20 px-3.5 py-1 text-[0.75rem] font-bold text-ice-300">
                {locale === "ar" ? "استشارات وحلول سفن لاند الميدانية" : "Seven Lands Field Advisory & Solutions"}
              </span>
              <h2 className="display-2 mt-4 text-[1.75rem] leading-[1.3] text-white lg:text-[2.25rem]">
                {locale === "ar"
                  ? "هل تواجه تحدياً مشابهاً في نمو علامتك أو منصتك الرقمية؟"
                  : "Facing similar challenges scaling your brand or digital platform?"}
              </h2>
              <p className="mt-4 max-w-[56ch] text-[1rem] leading-[1.8] text-steel-200">
                {locale === "ar"
                  ? "نجمع الاستراتيجية، الهوية، المحتوى، إعلانات الأداء، والبرمجيات تحت سقف واحد في سبعة مجالات متصلة تقود أعمالك لتحقيق نتائج ملموسة."
                  : "We unify brand identity, cinematic content, high-performance acquisition, and software automation across seven integrated capabilities."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
              <ButtonLink href="/start-a-project" size="lg" variant="primary" className="w-full sm:w-auto text-center justify-center">
                <span>{tCta("start")}</span>
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/services" size="lg" variant="secondary" className="w-full sm:w-auto text-center justify-center bg-white/10 text-white border-white/20 hover:bg-white/20">
                <span>{tCta("exploreServices")}</span>
                <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
