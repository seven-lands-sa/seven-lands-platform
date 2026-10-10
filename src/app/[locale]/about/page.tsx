import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { principles, process } from "@/content/home";
import { getServiceIndex } from "@/lib/services/public";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedSystemPage } from "@/lib/pages/adapter";
import { resolvePublicMedia } from "@/lib/content/media";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { ArrowRight, ButtonLink, PinIcon } from "@/components/ui/Button";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { PathArt } from "@/components/brand/PathArt";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  const identity = await getSiteIdentity(locale);
  /* §37 — when this locale is published in the CMS its SEO contract wins; the shipped metadata is
     the fallback, and the canonical URL always stays derived from the real route. */
  const page = await getPublishedSystemPage("about", locale);
  const shareImage = page ? resolvePublicMedia(page.seo.ogImage as never, { locale }) : null;
  return buildMetadata({
    identity,
    locale,
    title: page?.seo.title ?? t("title"),
    description: page?.seo.description ?? t("description"),
    path: "/about",
    noIndex: page?.seo.noindex ?? false,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  /* §44 — the CMS document serves this locale only once it is published for it; until then the
     shipped composition below is the page, unchanged. */
  const cms = await getPublishedSystemPage("about", locale);

  const identity = await getSiteIdentity(locale);
  const services = await getServiceIndex(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const story = t.raw("story") as string[];
  const data = principles[locale];
  const steps = process[locale];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema(locale, identity),
            breadcrumbSchema(locale, [{ name: t("hero.eyebrow"), path: "/about" }], identity),
          ]),
        }}
      />

      {cms ? (
        <PageBlocks page={cms} locale={locale} />
      ) : (
        <>
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

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="display-1 mt-6 max-w-[28ch]">{t("hero.title")}</h1>
              <p className="lede measure mt-7 text-[1.0625rem]">{t("hero.lede")}</p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <div className="overflow-hidden rounded-[1.5rem] border border-ink-950/15 bg-white p-3 shadow-xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.125rem] bg-ink-950/5">
                  <Image
                    src="/media/editorial/studio-discovery-workshop.webp"
                    alt={locale === "ar" ? "استوديو سفن لاند في الرياض — مساحة العمل والتخطيط الإبداعي" : "Seven Lands Studio Riyadh — Strategy & Creative Workshop"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 35vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <span className="absolute bottom-3 start-4 text-[0.8125rem] font-bold text-white">
                    {locale === "ar" ? "استوديو التخطيط والتنفيذ · الرياض" : "Studio & Workshop · Riyadh"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <Section tone="white" aria-labelledby="story-heading">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <h2 id="story-heading" className="display-2 max-w-[20ch]">
              {t("storyHeading")}
            </h2>
            <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-ink-950/10 shadow-md">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="/media/editorial/creative-branding-studio.webp"
                  alt={locale === "ar" ? "استوديو الإبداع وصناعة الهويات التجارية في الرياض" : "Creative Branding & Identity Studio — Seven Lands Riyadh"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="flex flex-col gap-6">
              {story.map((paragraph) => (
                <p key={paragraph} className="text-[1rem] leading-[1.95] text-steel-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* THE SEVEN CAPABILITIES AS AN INDEX */}
      <Section tone="light" aria-labelledby="index-heading">
        <SectionHeading
          id="index-heading"
          eyebrow={locale === "ar" ? "المجالات" : "Capabilities"}
          title={locale === "ar" ? "سبعة مجالات، فريق واحد." : "Seven capabilities, one team."}
          lede={
            locale === "ar"
              ? "كل مجال يعمل كتخصص مستقل، ويُدار مع بقية المجالات حول الهدف نفسه."
              : "Each capability stands as its own discipline, run alongside the others against the same goal."
          }
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {services.map((land) => (
            <li key={land.slug} className="bg-white">
              <Link
                href={`/services/${land.slug}`}
                className="flex h-full flex-col gap-4 p-6 transition-colors duration-200 hover:bg-offwhite"
              >
                <span className="flex items-center justify-between">
                  <LandGlyph glyph={land.glyph} className="h-6 w-6 text-navy-800" />
                  <span className="num text-[0.75rem] text-muted">{land.number}</span>
                </span>
                <span className="text-[0.9375rem] font-semibold">{land.title}</span>
                <span className="mt-auto inline-flex items-center gap-2 text-[0.8125rem] text-steel-600">
                  {tCta("openLand")}
                  <ArrowRight />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* PRINCIPLES */}
      <Section tone="white" aria-labelledby="principles-heading">
        <SectionHeading
          id="principles-heading"
          eyebrow={locale === "ar" ? "المبادئ" : "Principles"}
          title={data.heading}
          lede={data.lede}
        />
        <ul className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2" role="list">
          {data.items.map((item, index) => (
            <li key={item.title} className="grid gap-4 border-t border-ink-950/15 pt-6 sm:grid-cols-[auto_1fr] sm:gap-6">
              <span className="num text-[0.75rem] font-semibold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[1.125rem] font-bold">{item.title}</h3>
                <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* HOW WE WORK + LOCATION */}
      <Section tone="light" aria-labelledby="work-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="work-heading" className="display-2 max-w-[22ch]">
              {steps.heading}
            </h2>
            <ol className="mt-8 flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10" role="list">
              {steps.steps.map((step, index) => (
                <li key={step.label} className="flex gap-5 py-5">
                  <span className="num text-[0.75rem] font-semibold text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[1.0625rem] font-bold">{step.label}</h3>
                    <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <dl className="flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10">
              <div className="flex flex-col gap-2 py-5">
                <dt className="eyebrow">{t("factsModel")}</dt>
                <dd className="text-[0.9375rem] leading-[1.9] text-steel-600">{t("factsModelValue")}</dd>
              </div>
              <div className="flex flex-col gap-2 py-5">
                <dt className="eyebrow">{t("factsStart")}</dt>
                <dd className="text-[0.9375rem] leading-[1.9] text-steel-600">{t("factsStartValue")}</dd>
              </div>
              <div className="flex flex-col gap-2 py-5">
                <dt className="eyebrow">{t("factsArea")}</dt>
                <dd className="text-[0.9375rem] leading-[1.9] text-steel-600">{t("factsAreaValue")}</dd>
              </div>
            </dl>

            <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-ink-950/8">
                <Image
                  src="/media/editorial/tech-performance-hub.webp"
                  alt={locale === "ar" ? "بيئة العمل المتقدمة وأنظمة تحليلات النمو الرقمي في الرياض" : "Advanced Growth Analytics & Technology Hub — Seven Lands Riyadh"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="display-3">{t("locationHeading")}</h3>
                <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{t("locationBody")}</p>
                <a
                  href={identity.location.mapsUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="maps_click"
                  data-analytics-location="about"
                  className="mt-5 inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-navy-800 underline-offset-[6px] hover:underline"
                >
                  <PinIcon />
                  <span>{identity.location.display}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* TEAM — honest pending state, no invented names or photos */}
      <Section tone="white" size="compact" aria-labelledby="team-heading">
        <div className="grid gap-6 border-t border-ink-950/15 pt-8 lg:grid-cols-12">
          <h2 id="team-heading" className="display-3 lg:col-span-4">
            {t("teamHeading")}
          </h2>
          <p className="text-[0.9375rem] leading-[1.9] text-steel-600 lg:col-span-7 lg:col-start-6">
            {t("teamNote")}
          </p>
        </div>
      </Section>

      <Section tone="light" size="compact">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/services" size="lg" variant="secondary">
            <span>{tCta("exploreServices")}</span>
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/start-a-project" size="lg">
            <span>{tCta("start")}</span>
            <ArrowRight />
          </ButtonLink>
        </div>
      </Section>

      <FinalCta />
        </>
      )}
    </>
  );
}
