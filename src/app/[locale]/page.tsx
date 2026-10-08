import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { TrustStatement } from "@/components/sections/TrustStatement";
import { LandsSystem } from "@/components/sections/LandsSystem";
import { getServiceIndex } from "@/lib/services/public";
import { Problems } from "@/components/sections/Problems";
import { WorkTeaser } from "@/components/sections/WorkTeaser";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { WhySection } from "@/components/sections/WhySection";
import { FinalCta } from "@/components/sections/FinalCta";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedSystemPage } from "@/lib/pages/adapter";
import { resolvePublicMedia } from "@/lib/content/media";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  const identity = await getSiteIdentity(locale);
  /* §37 — when the CMS page is published for this locale, its SEO contract wins; otherwise the
     shipped metadata stands unchanged. The canonical URL always stays derived from the real route. */
  const page = await getPublishedSystemPage("home", locale);
  const shareImage = page ? resolvePublicMedia(page.seo.ogImage as never, { locale }) : null;
  return buildMetadata({
    identity,
    locale,
    title: page?.seo.title ?? t("title"),
    description: page?.seo.description ?? t("description"),
    path: "",
    noIndex: page?.seo.noindex ?? false,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "home.lands" });
  /* §44 — the CMS document is served only when this locale is published; until then the static
     composition below is the page, byte for byte. */
  const cms = await getPublishedSystemPage("home", locale);
  /* The seven capabilities as the home page must show them: CMS-published copy first, shipped
     content for the rest — never a second, drifting copy of the same names. */
  const services = await getServiceIndex(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(locale, identity), websiteSchema(locale, identity)]),
        }}
      />

      {cms ? (
        <PageBlocks page={cms} locale={locale} />
      ) : (
        <>
      {/* 1 — Hero */}
      <Hero />

      {/* 2 — Verified-proof substitute: the working model, stated honestly. */}
      <TrustStatement locale={locale} />

      {/* 3 — The signature Seven Lands system */}
      <Section tone="light" aria-labelledby="lands-heading">
        <SectionHeading
          id="lands-heading"
          eyebrow={t("eyebrow")}
          title={t("heading")}
          lede={t("lede")}
        />
        <div className="mt-14" data-reveal>
          <LandsSystem lands={services} />
        </div>
      </Section>

      {/* 4 — Problems, framed as the visitor's own situation */}
      <Problems locale={locale} />

      {/* 5 — Selected work (honest state until real cases are publishable) */}
      <WorkTeaser locale={locale} />

      {/* 6 — How we work */}
      <ProcessSection locale={locale} />

      {/* 7 — Why Seven Lands */}
      <WhySection locale={locale} />

      {/*
        8 — Testimonials are intentionally NOT rendered: no real, attributable
        testimonials have been supplied. Section will be added when they exist.
      */}

      {/* 9 — Final CTA */}
      <FinalCta />
        </>
      )}
    </>
  );
}
