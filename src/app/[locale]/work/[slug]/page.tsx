import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { caseStudies, publishedCaseStudies } from "@/content/work";
import { landBySlug } from "@/content/services";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

/**
 * CASE STUDY TEMPLATE — complete and production-ready, deliberately empty.
 * `caseStudies` holds no published, approved entries yet, so every slug 404s and
 * the Work hub shows its honest state. Add a real entry with `published: true`
 * and `clientApproved: true` and this template renders in full.
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
 *       publishedCaseStudies.map((item) => ({ locale, slug: item.slug })),
 *     );
 *   }
 *
 * Until then the route renders on demand and every slug 404s by design.
 */
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = publishedCaseStudies.find((c) => c.slug === slug);
  if (!item) return {};

  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: `${item.client} — ${item.sector}`,
    description: item.objective,
    path: `/work/${item.slug}`,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);

  const item = caseStudies.find((c) => c.slug === slug);
  if (!item || !item.published || !item.clientApproved) notFound();

  const t = await getTranslations({ locale, namespace: "work" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const labels = t.raw("caseStudyLabels") as Record<string, string>;
  const scope = item.landSlugs
    .map((landSlug) => landBySlug.get(landSlug as never)?.copy[locale].title)
    .filter(Boolean);

  const index = publishedCaseStudies.findIndex((c) => c.slug === item.slug);
  const next = publishedCaseStudies[(index + 1) % publishedCaseStudies.length];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(locale, [
              { name: t("hero.title"), path: "/work" },
              { name: item.client, path: `/work/${item.slug}` },
            ], identity),
          ]),
        }}
      />

      <section className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[0.8125rem] text-muted">
            <Link href="/work" className="transition-colors duration-200 hover:text-ink-950">
              {t("hero.title")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="num">{item.year}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">{item.sector}</p>
              <h1 className="display-1 mt-6 max-w-[24ch]">{item.client}</h1>
              <p className="lede measure mt-7 text-[1.0625rem]">{item.objective}</p>
            </div>

            <dl className="lg:col-span-4 lg:col-start-9">
              <div className="border-t border-ink-950/15 pt-4">
                <dt className="eyebrow">{labels.scope}</dt>
                <dd className="mt-3 flex flex-col gap-1 text-[0.9375rem] text-steel-600">
                  {scope.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </dd>
              </div>
              <div className="mt-6 border-t border-ink-950/15 pt-4">
                <dt className="eyebrow">{labels.sector}</dt>
                <dd className="num mt-3 text-[0.9375rem] text-steel-600">
                  {item.sector} · {item.year}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display-3">{labels.challenge}</h2>
            <p className="mt-5 text-[0.9375rem] leading-[1.9] text-steel-600">{item.challenge}</p>

            <h2 className="display-3 mt-12">{labels.objective}</h2>
            <p className="mt-5 text-[0.9375rem] leading-[1.9] text-steel-600">{item.objective}</p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="display-3">{labels.approach}</h2>
            <p className="mt-5 text-[0.9375rem] leading-[1.9] text-steel-600">{item.approach}</p>

            <h2 className="display-3 mt-12">{labels.execution}</h2>
            <ul className="mt-5 flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10" role="list">
              {item.execution.map((step, stepIndex) => (
                <li key={step} className="flex gap-4 py-4">
                  <span className="num text-[0.75rem] font-semibold text-muted">
                    {String(stepIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {item.gallery.length > 0 ? (
        <Section tone="light">
          <h2 className="eyebrow mb-6">{labels.gallery}</h2>
          <ul className="grid gap-4 md:grid-cols-2" role="list">
            {item.gallery.map((image) => (
              <li key={image.src} className="overflow-hidden rounded-[1.25rem] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-2">{labels.results}</h2>
            <p className="mt-5 text-[0.8125rem] leading-relaxed text-muted">{t("resultsNote")}</p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {item.results.map((result) => (
              <div key={result.label} className="border-t border-ink-950/15 pt-4">
                <dt className="text-[0.8125rem] text-muted">{result.label}</dt>
                <dd className="num mt-2 text-[1.5rem] font-bold">{result.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {next ? (
        <Section tone="light" size="compact">
          <ButtonLink href={`/work/${next.slug}`} variant="secondary" size="lg">
            <span>
              {labels.next}: {next.client}
            </span>
            <ArrowRight />
          </ButtonLink>
          <p className="mt-6">
            <Link
              href="/work"
              className="text-[0.875rem] text-muted underline-offset-4 hover:text-ink-950 hover:underline"
            >
              {tCta("viewWork")}
            </Link>
          </p>
        </Section>
      ) : null}

      <FinalCta />
    </>
  );
}
