import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { publishedCaseStudies, workEmptyState } from "@/content/work";
import { getServiceLabels } from "@/lib/services/public";
import { CRAFT_MEDIA } from "@/lib/services/images";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { PathRail } from "@/components/brand/PathArt";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.work" });
  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: t("title"),
    description: t("description"),
    path: "/work",
  });
}

export default async function WorkPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "work" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const empty = workEmptyState[locale];

  // Filters are only rendered when there is content to filter.
  const labels = await getServiceLabels(locale);
  const activeFilters = Array.from(new Set(publishedCaseStudies.flatMap((item) => item.landSlugs)))
    .map((slug) => ({ slug, label: labels.get(slug) }))
    .filter((entry) => Boolean(entry.label));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema(locale, [{ name: t("hero.title"), path: "/work" }], identity)]),
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
              <h1 className="display-1 mt-6 max-w-[20ch]">{t("hero.title")}</h1>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <p className="lede text-[1rem]">{t("hero.lede")}</p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="white" aria-labelledby="work-heading">
        {publishedCaseStudies.length > 0 ? (
          <>
            <h2 id="work-heading" className="sr-only">
              {t("hero.title")}
            </h2>
            {activeFilters.length > 0 ? (
              <ul className="mb-10 flex flex-wrap gap-2" role="list" aria-label={t("filtersLabel")}>
                {activeFilters.map((filter) => (
                  <li
                    key={filter!.slug}
                    className="rounded-full border border-ink-950/15 px-3.5 py-1.5 text-[0.8125rem] text-steel-600"
                  >
                    {filter.label!.short}
                  </li>
                ))}
              </ul>
            ) : null}

            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
              {publishedCaseStudies.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/work/${item.slug}`}
                    data-analytics="case_study_view"
                    data-analytics-slug={item.slug}
                    className="group block overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-offwhite transition-colors duration-200 hover:border-ink-950/30"
                  >
                    <span className="block aspect-[4/3] bg-ink-950/5" />
                    <span className="block p-6">
                      <span className="flex items-center gap-3 text-[0.75rem] text-muted">
                        <span className="num">{item.year}</span>
                        <span className="h-px flex-1 bg-ink-950/10" />
                        <span>{item.sector}</span>
                      </span>
                      <span className="display-3 mt-4 block">{item.client}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          /* HONEST EMPTY STATE — no fabricated clients, sectors, metrics or logos. */
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="work-heading" className="display-2 max-w-[24ch]">
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
                <PathRail nodes={5} className="opacity-60" />
                <ul className="mt-6 flex flex-col divide-y divide-ink-950/10" role="list">
                  {(locale === "ar"
                    ? [
                        "نوثّق الهدف، والمنهج، والتنفيذ، ثم النتائج.",
                        "لا ننشر شعار عميل قبل موافقته الكتابية.",
                        "النتائج تُنشر عند توفر بيانات حقيقية من الحسابات الرسمية.",
                      ]
                    : [
                        "We document the objective, approach and execution, then the results.",
                        "No client logo is published before written approval.",
                        "Results go live once real data comes from the official accounts.",
                      ]
                  ).map((line, index) => (
                    <li key={line} className="flex gap-4 py-4">
                      <span className="num text-[0.75rem] font-semibold text-muted">
                        0{index + 1}
                      </span>
                      <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* MULTIDISCIPLINARY CRAFT & DISCIPLINE VIGNETTES */}
      <Section tone="light" aria-labelledby="craft-heading">
        <div className="mb-12">
          <p className="eyebrow">{locale === "ar" ? "الحرفية والإتقان" : "Disciplines & Craft"}</p>
          <h2 id="craft-heading" className="display-2 mt-4 max-w-[26ch]">
            {locale === "ar" ? "مجالات الإبداع ومعايير التنفيذ" : "Disciplines of Execution & Craftsmanship"}
          </h2>
          <p className="lede mt-5 max-w-[48ch] text-[1rem]">
            {locale === "ar"
              ? "نلبي متطلبات المشاريع الطموحة عبر دمج الاستراتيجية، والهوية البصرية، والإنتاج السينمائي، وهندسة البرمجيات."
              : "We deliver ambitious mandates through the convergence of strategy, brand architecture, cinematic film, and software engineering."}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(CRAFT_MEDIA).map(([key, item]) => (
            <div
              key={key}
              className="group overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-white transition-all duration-300 hover:border-ink-950/30 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-950/5">
                <Image
                  src={item.src}
                  alt={locale === "ar" ? item.titleAr : item.titleEn}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="text-[1.0625rem] font-bold text-ink-950">
                  {locale === "ar" ? item.titleAr : item.titleEn}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-[1.8] text-steel-600">
                  {locale === "ar" ? item.descAr : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
