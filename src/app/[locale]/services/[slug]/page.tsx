import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { landBySlug, lands, scopeNote } from "@/content/services";
import { process } from "@/content/home";
import { publishedCaseStudies } from "@/content/work";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { ArrowRight, ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    lands.map((land) => ({ locale, slug: land.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const land = landBySlug.get(slug as never);
  if (!land) return {};

  const copy = land.copy[locale];
  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: copy.title,
    description: copy.promise,
    path: `/services/${land.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);

  const land = landBySlug.get(slug as never);
  if (!land) notFound();

  const copy = land.copy[locale];
  const t = await getTranslations({ locale, namespace: "serviceDetail" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const steps = process[locale];
  const relatedWork = publishedCaseStudies.filter((item) => item.landSlugs.includes(land.slug));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceSchema(locale, land.slug, identity),
            faqSchema(locale, land.slug),
            breadcrumbSchema(locale, [
              { name: locale === "ar" ? "خدماتنا" : "Services", path: "/services" },
              { name: copy.title, path: `/services/${land.slug}` },
            ], identity),
          ]),
        }}
      />

      {/* HERO — outcome first, service second */}
      <section className="border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[0.8125rem] text-muted">
            <Link href="/services" className="transition-colors duration-200 hover:text-ink-950">
              {tCta("backToServices")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="num">{land.number}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4">
                <LandGlyph glyph={land.glyph} className="h-8 w-8 text-navy-800" />
                <span className="num text-[0.8125rem] font-semibold text-muted">
                  {land.number} / 07
                </span>
              </div>
              <h1 className="display-1 mt-6 max-w-[26ch]">{copy.title}</h1>
              <p className="lede measure mt-7 text-[1.0625rem] md:text-[1.125rem]">{copy.promise}</p>

              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/start-a-project" size="lg">
                  <span>{tCta("start")}</span>
                  <ArrowRight />
                </ButtonLink>
                <ButtonAnchor
                  href={withWhatsAppMessage(identity.whatsapp.href, copy.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="whatsapp"
                  data-analytics="whatsapp_click"
                  data-analytics-location={`service_${land.slug}`}
                >
                  <WhatsAppIcon />
                  <span>{tCta("whatsappShort")}</span>
                </ButtonAnchor>
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <div className="border-t border-ink-950/15 pt-5">
                <p className="eyebrow mb-3">{t("outcomeLabel")}</p>
                <p className="text-[0.9375rem] leading-[1.9] text-steel-600">{copy.intro}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHEN YOU NEED THIS */}
      <Section tone="white" aria-labelledby="problems-heading">
        <h2 id="problems-heading" className="display-2 max-w-[24ch]">
          {t("problemsHeading")}
        </h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 md:grid-cols-2" role="list">
          {copy.problems.map((item, index) => (
            <li key={item.question} className="bg-white p-7 md:p-9">
              <span className="num text-[0.75rem] font-semibold text-muted">
                {String(index + 1,).padStart(2, "0")}
              </span>
              <h3 className="display-3 mt-5 max-w-[26ch]">{item.question}</h3>
              <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{item.answer}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* SCOPE */}
      <Section tone="light" aria-labelledby="capabilities-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="capabilities-heading" className="display-2 max-w-[20ch]">
              {t("capabilitiesHeading")}
            </h2>
            <p className="mt-5 text-[0.8125rem] leading-relaxed text-muted">
              {t("capabilitiesNote")}
            </p>
          </div>

          <ul className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:col-span-7 lg:col-start-6" role="list">
            {copy.capabilities.map((capability) => (
              <li
                key={capability}
                className="flex items-baseline gap-3 border-t border-ink-950/12 py-4 text-[0.9375rem] text-steel-600"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-navy-800" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2.5 8.5 6 12l7.5-8" />
                </svg>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* METHOD */}
      <Section tone="white" aria-labelledby="method-heading">
        <h2 id="method-heading" className="display-2 max-w-[24ch]">
          {t("methodHeading")}
        </h2>
        <ol className="mt-12 grid gap-8 border-t border-ink-950/15 pt-8 md:grid-cols-4 md:gap-6" role="list">
          {steps.steps.map((step, index) => (
            <li key={step.label}>
              <span className="num text-[0.75rem] font-semibold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="display-3 mt-4">{step.label}</h3>
              <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* RELATED WORK — honest state until real cases are publishable */}
      <Section tone="light" aria-labelledby="related-heading">
        <h2 id="related-heading" className="display-2">
          {t("relatedHeading")}
        </h2>
        {relatedWork.length > 0 ? (
          <ul className="mt-10 grid gap-6 md:grid-cols-3" role="list">
            {relatedWork.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/work/${item.slug}`}
                  className="block rounded-[1.25rem] border border-ink-950/10 bg-white p-6 transition-colors duration-200 hover:border-ink-950/30"
                >
                  <span className="num text-[0.75rem] text-muted">{item.year}</span>
                  <span className="display-3 mt-3 block">{item.client}</span>
                  <span className="mt-2 block text-[0.875rem] text-steel-600">{item.sector}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-[1.9] text-steel-600">
            {t("relatedEmpty")}
          </p>
        )}
      </Section>

      {/* FAQ */}
      <Section tone="white" aria-labelledby="faq-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="faq-heading" className="display-2">
              {t("faqHeading")}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ul className="border-t border-ink-950/12" role="list">
              {copy.faqs.map((faq) => (
                <li key={faq.q} className="border-b border-ink-950/12">
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[1.0625rem] font-semibold marker:content-none">
                      <span>{faq.q}</span>
                      <span
                        aria-hidden="true"
                        className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-ink-950/25 text-ink-950 transition-transform duration-200 group-open:rotate-45"
                      >
                        <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                          <path d="M7 2.5v9M2.5 7h9" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-4 max-w-[60ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                      {faq.a}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* OTHER LANDS */}
      <Section tone="light" size="compact" aria-labelledby="other-lands-heading">
        <h2 id="other-lands-heading" className="eyebrow mb-6">
          {t("otherLands")}
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {lands
            .filter((item) => item.slug !== land.slug)
            .map((item) => (
              <li key={item.slug} className="bg-white">
                <Link
                  href={`/services/${item.slug}`}
                  className="flex h-full items-center gap-4 p-5 transition-colors duration-200 hover:bg-offwhite"
                >
                  <span className="num text-[0.75rem] font-semibold text-muted">{item.number}</span>
                  <span className="text-[0.9375rem] font-semibold">{item.copy[locale].short}</span>
                  <ArrowRight className="ms-auto text-steel-600" />
                </Link>
              </li>
            ))}
        </ul>
        <p className="mt-6 text-[0.8125rem] text-muted">{scopeNote[locale]}</p>
      </Section>

      <FinalCta />
    </>
  );
}
