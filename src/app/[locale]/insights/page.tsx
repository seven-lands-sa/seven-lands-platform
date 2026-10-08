import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { insightsEmptyState, publishedArticles } from "@/content/insights";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { PathRail } from "@/components/brand/PathArt";
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
  const empty = insightsEmptyState[locale];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(locale, [{ name: tMeta("title"), path: "/insights" }], identity),
          ]),
        }}
      />

      <section className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className="text-[0.8125rem] text-muted transition-colors duration-200 hover:text-ink-950"
            >
              {tCta("backHome")}
            </Link>
          </nav>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="display-1 mt-6 max-w-[18ch]">{t("hero.title")}</h1>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <p className="lede text-[1rem]">{t("hero.lede")}</p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="white" aria-labelledby="insights-heading">
        {publishedArticles.length > 0 ? (
          <>
            <h2 id="insights-heading" className="sr-only">
              {t("hero.title")}
            </h2>
            <ul className="flex flex-col border-t border-ink-950/12" role="list">
              {publishedArticles.map((article) => (
                <li key={article.slug} className="border-b border-ink-950/12">
                  <Link href={`/insights/${article.slug}`} className="group grid gap-6 py-9 md:grid-cols-12">
                    <div className="flex flex-col gap-3 md:col-span-3">
                      <span className="num text-[0.75rem] text-muted">
                        {formatDate(article.date, locale)}
                      </span>
                      <span className="text-[0.75rem] text-muted">
                        {tc("readingTime", { minutes: article.readingMinutes })}
                      </span>
                    </div>
                    <div className="md:col-span-7">
                      <h3 className="display-3">{article.title}</h3>
                      <p className="mt-3 max-w-[54ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex items-start md:col-span-2 md:justify-end">
                      <ArrowRight className="text-steel-600" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          /* HONEST EMPTY STATE — no filler articles to make the hub look busy. */
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="insights-heading" className="display-2 max-w-[24ch]">
                {empty.title}
              </h2>
              <p className="lede measure mt-6 text-[1rem]">{empty.body}</p>
              <p className="mt-6 border-s-2 border-ice-400 ps-4 text-[0.8125rem] leading-relaxed text-muted">
                {empty.note}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/services" size="lg" variant="secondary">
                  <span>{tCta("exploreServices")}</span>
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/start-a-project" size="lg">
                  <span>{tCta("start")}</span>
                  <ArrowRight />
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="rounded-[1.25rem] border border-ink-950/12 bg-offwhite p-7">
                <PathRail nodes={4} className="opacity-60" />
                <ul className="mt-6 flex flex-col divide-y divide-ink-950/10" role="list">
                  {(locale === "ar"
                    ? [
                        "نكتب مما نراه في المشاريع، لا من نظريات عامة.",
                        "لا ننشر مقالًا لملء الصفحة.",
                        "كل مقال يشرح قرارًا يمكن تطبيقه فعليًا.",
                      ]
                    : [
                        "We write from what we see in projects, not general theory.",
                        "We don't publish an article to fill a page.",
                        "Every piece explains a decision you can actually apply.",
                      ]
                  ).map((line, index) => (
                    <li key={line} className="flex gap-4 py-4">
                      <span className="num text-[0.75rem] font-semibold text-muted">0{index + 1}</span>
                      <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Section>

      <FinalCta />
    </>
  );
}
