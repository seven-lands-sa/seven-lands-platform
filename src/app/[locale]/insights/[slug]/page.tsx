import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getArticle, publishedArticles } from "@/content/insights";
import { site } from "@/content/site";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    publishedArticles.map((article) => ({ locale, slug: article.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!article || !article.published) return {};

  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: `${article.title[locale]} — سفن لاند`,
    description: article.excerpt[locale],
    path: `/insights/${article.slug}`,
    ogImagePath: article.coverImage,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);

  const article = getArticle(slug);
  if (!article || !article.published) notFound();

  const t = await getTranslations({ locale, namespace: "insights" });
  const tMeta = await getTranslations({ locale, namespace: "meta.insights" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const otherArticles = publishedArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title[locale],
              description: article.excerpt[locale],
              image: `${site.url}${article.coverImage}`,
              datePublished: article.date,
              dateModified: article.date,
              author: {
                "@type": "Organization",
                name: article.author[locale],
                url: `${site.url}/${locale}/about`,
              },
              inLanguage: locale === "ar" ? "ar-SA" : "en",
              mainEntityOfPage: `${site.url}/${locale}/insights/${article.slug}`,
              publisher: {
                "@type": "Organization",
                name: "Seven Lands",
                url: site.url,
                logo: {
                  "@type": "ImageObject",
                  url: `${site.url}/brand/seven-lands-logo.png`,
                },
              },
            },
            breadcrumbSchema(
              locale,
              [
                { name: tMeta("title"), path: "/insights" },
                { name: article.title[locale], path: `/insights/${article.slug}` },
              ],
              identity,
            ),
          ]),
        }}
      />

      <article className="bg-white">
        {/* ARTICLE HEADER */}
        <header className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
          <div className="container-x">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted">
              <Link href="/insights" className="transition-colors duration-200 hover:text-ink-950">
                {t("backToInsights")}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-ink-950">{article.category[locale]}</span>
              <span aria-hidden="true">/</span>
              <span className="num">{formatDate(article.date, locale)}</span>
            </nav>

            <div className="max-w-[80ch]">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-ice-100 px-3 py-0.5 text-[0.75rem] font-bold text-ice-800">
                  {article.category[locale]}
                </span>
                <span className="text-[0.8125rem] text-muted">
                  {tc("readingTime", { minutes: article.readingMinutes })}
                </span>
              </div>

              <h1 className="display-1 text-[2.25rem] leading-[1.25] text-ink-950 lg:text-[3rem]">
                {article.title[locale]}
              </h1>

              <p className="lede mt-6 text-[1.125rem] leading-[1.85] text-steel-700">
                {article.excerpt[locale]}
              </p>

              <div className="mt-8 flex items-center gap-4 border-t border-ink-950/10 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950 text-white font-bold text-[0.875rem]">
                  7L
                </div>
                <div>
                  <div className="text-[0.875rem] font-bold text-ink-950">
                    {article.author[locale]}
                  </div>
                  <div className="text-[0.75rem] text-muted">
                    {locale === "ar" ? "المملكة العربية السعودية · الرياض والقصيم" : "Saudi Arabia · Riyadh & Al Qassim"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* HERO COVER IMAGE */}
        <section className="container-x -mt-6 lg:-mt-10">
          <div className="relative aspect-[16/9] w-full max-w-[68rem] mx-auto overflow-hidden rounded-[1.75rem] border border-ink-950/15 bg-ink-950/5 shadow-2xl">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt[locale]}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1100px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 start-6 end-6 text-[0.8125rem] text-white/90">
              {article.coverImageAlt[locale]}
            </div>
          </div>
        </section>

        {/* ARTICLE BODY & SECTIONS */}
        <Section tone="white">
          <div className="mx-auto max-w-[70ch]">
            {/* KEY TAKEAWAYS CALLOUT BOX */}
            {article.takeaways && article.takeaways[locale]?.length > 0 && (
              <div className="mb-14 rounded-[1.5rem] border border-ice-400 bg-ice-50/50 p-6 lg:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ice-600 text-white text-[0.875rem] font-bold">
                    ✓
                  </span>
                  <h2 className="text-[1.125rem] font-bold text-ink-950">
                    {t("keyTakeaways")}
                  </h2>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {article.takeaways[locale].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[0.9375rem] leading-[1.8] text-steel-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ice-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SECTIONS */}
            <div className="space-y-14">
              {article.sections.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  {section.heading && (
                    <h2 className="display-3 text-[1.625rem] leading-[1.35] text-ink-950 pt-4">
                      {section.heading[locale]}
                    </h2>
                  )}

                  {section.paragraphs[locale]?.map((para, pIdx) => (
                    <p key={pIdx} className="text-[1.0625rem] leading-[2.05] text-steel-700">
                      {para}
                    </p>
                  ))}

                  {/* Section Image */}
                  {section.image && (
                    <figure className="my-8 overflow-hidden rounded-[1.25rem] border border-ink-950/10 shadow-lg">
                      <div className="relative aspect-[16/10] w-full bg-ink-950/5">
                        <Image
                          src={section.image.src}
                          alt={section.image.alt[locale]}
                          fill
                          sizes="(max-width: 1024px) 100vw, 750px"
                          className="object-cover"
                        />
                      </div>
                      {section.image.caption && (
                        <figcaption className="bg-offwhite p-3.5 text-center text-[0.8125rem] text-muted">
                          {section.image.caption[locale]}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Section Pull Quote */}
                  {section.quote && (
                    <blockquote className="my-8 border-s-4 border-ice-500 bg-offwhite p-6 rounded-e-[1rem] shadow-xs">
                      <p className="text-[1.125rem] font-medium leading-[1.8] text-ink-950 italic">
                        "{section.quote.text[locale]}"
                      </p>
                      {section.quote.author && (
                        <cite className="mt-3 block text-[0.8125rem] font-semibold text-muted not-italic">
                          — {section.quote.author[locale]}
                        </cite>
                      )}
                    </blockquote>
                  )}
                </div>
              ))}
            </div>

            {/* TAGS */}
            <div className="mt-14 border-t border-ink-950/10 pt-8">
              <span className="text-[0.75rem] font-bold uppercase tracking-wider text-muted">
                {locale === "ar" ? "الكلمات المفتاحية والمواضيع" : "Keywords & Topics"}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags[locale].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-offwhite px-3 py-1 text-[0.75rem] font-medium text-steel-700 hover:bg-ink-950/5 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* RELATED SEVEN LANDS SOLUTION CALLOUT */}
            <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-ink-950/12 bg-gradient-to-br from-offwhite to-white p-7 shadow-lg">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[0.75rem] font-bold text-ice-700 uppercase tracking-wider">
                    {t("relatedService")}
                  </span>
                  <h3 className="display-3 mt-1 text-[1.25rem] text-ink-950">
                    {article.relatedServiceTitle[locale]}
                  </h3>
                  <p className="mt-2 max-w-[45ch] text-[0.875rem] leading-relaxed text-steel-600">
                    {locale === "ar"
                      ? "نساعدك في سفن لاند على تطبيق هذه الرؤية كمنظومة عمل متكاملة تقود نمو علامتك ومبيعاتك."
                      : "We help you execute this strategic blueprint as an integrated capability driving verifiable market growth."}
                  </p>
                </div>
                <div className="shrink-0">
                  <ButtonLink href={`/services/${article.relatedServiceSlug}`} size="md" variant="primary">
                    <span>{locale === "ar" ? "استكشف هذا المجال" : "Explore Capability"}</span>
                    <ArrowRight />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* OTHER ARTICLES */}
        {otherArticles.length > 0 && (
          <Section tone="light" aria-labelledby="other-insights-heading">
            <div className="mx-auto max-w-[70rem]">
              <div className="mb-8 flex items-center justify-between border-b border-ink-950/10 pb-4">
                <h2 id="other-insights-heading" className="text-[1.125rem] font-bold text-ink-950">
                  {locale === "ar" ? "مقالات وقراءات أخرى مختارة" : "Recommended Further Reading"}
                </h2>
                <Link
                  href="/insights"
                  className="text-[0.8125rem] font-semibold text-ice-700 hover:underline"
                >
                  {t("backToInsights")}
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {otherArticles.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/insights/${other.slug}`}
                    className="group flex gap-4 rounded-[1.25rem] border border-ink-950/10 bg-white p-4 transition-all duration-300 hover:border-ink-950/25 hover:shadow-md"
                  >
                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-ink-950/5">
                      <Image
                        src={other.coverImage}
                        alt={other.coverImageAlt[locale]}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[0.7rem] font-bold text-ice-700">
                        {other.category[locale]}
                      </span>
                      <h3 className="mt-1 text-[0.9375rem] font-bold leading-snug text-ink-950 group-hover:text-ice-600 transition-colors">
                        {other.title[locale]}
                      </h3>
                      <span className="mt-2 text-[0.75rem] text-muted">
                        {formatDate(other.date, locale)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Section>
        )}
      </article>

      <FinalCta />
    </>
  );
}
