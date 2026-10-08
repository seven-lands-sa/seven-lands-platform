import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getServiceIndex } from "@/lib/services/public";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { PathRail } from "@/components/brand/PathArt";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  const identity = await getSiteIdentity(locale);
  return buildMetadata({
    identity,
    locale,
    title: t("title"),
    description: t("description"),
    path: "/services",
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "services" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  /* One authority (§55): published CMS copy for this locale, shipped content for the rest. */
  const services = await getServiceIndex(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(locale, [{ name: t("hero.eyebrow"), path: "/services" }], identity),
            ...services
              .map((service) =>
                serviceSchema(locale, service.slug, identity, {
                  title: service.title,
                  promise: service.promise,
                  capabilities: service.capabilities,
                }),
              )
              .filter(Boolean),
          ]),
        }}
      />

      {/* HERO */}
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
              <h1 className="display-1 mt-6 max-w-[24ch]">{t("hero.title")}</h1>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <p className="lede text-[1rem]">{t("hero.lede")}</p>
              <p className="mt-5 text-[0.9375rem] leading-[1.9] text-steel-600">{t("hero.support")}</p>
            </div>
          </div>

          <PathRail nodes={7} className="mt-14 opacity-70" />
        </div>
      </section>

      {/* THE SEVEN CAPABILITIES */}
      <Section tone="white" aria-labelledby="lands-list-heading">
        <h2 id="lands-list-heading" className="sr-only">
          {t("listHeading")}
        </h2>

        <ol className="flex flex-col border-t border-ink-950/12" role="list">
          {services.map((service) => {
            return (
              <li key={service.slug} className="group border-b border-ink-950/12">
                <Link
                  href={`/services/${service.slug}`}
                  data-analytics="service_cta_click"
                  data-analytics-location="services_hub"
                  className="grid gap-6 py-9 transition-colors duration-200 md:grid-cols-12 md:gap-8 lg:py-11"
                >
                  <div className="flex items-start gap-5 md:col-span-5">
                    <span className="num pt-1 text-[0.8125rem] font-semibold text-muted">
                      {service.number}
                    </span>
                    <LandGlyph
                      glyph={service.glyph}
                      className="mt-[-0.15rem] h-7 w-7 shrink-0 text-navy-800"
                    />
                    <div>
                      <h3 className="display-3">{service.title}</h3>
                      <p className="mt-3 max-w-[38ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                        {service.promise}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 md:col-start-7">
                    <p className="eyebrow mb-3">{t("capabilitiesLabel")}</p>
                    <ul className="flex flex-wrap gap-x-2 gap-y-2" role="list">
                      {service.capabilities.slice(0, 4).map((capability) => (
                        <li
                          key={capability}
                          className="rounded-full border border-ink-950/12 px-3 py-1 text-[0.8125rem] text-steel-600"
                        >
                          {capability}
                        </li>
                      ))}
                      {service.capabilities.length > 4 ? (
                        <li className="num px-3 py-1 text-[0.8125rem] text-muted">
                          +{service.capabilities.length - 4}
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="flex items-center md:col-span-2 md:col-start-11 md:justify-end">
                    <span className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-navy-800">
                      <span>{tCta("openLand")}</span>
                      <ArrowRight />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-[0.8125rem] text-muted">{services[0]?.scopeNote}</p>
      </Section>

      {/* WHY NOT DISCONNECTED SERVICES */}
      <Section tone="light" aria-labelledby="cross-heading">
        <SectionHeading
          id="cross-heading"
          eyebrow={locale === "ar" ? "الترابط" : "Connection"}
          title={t("crossHeading")}
          lede={t("crossBody")}
          actions={
            <ButtonLink href="/start-a-project" size="lg">
              <span>{tCta("start")}</span>
              <ArrowRight />
            </ButtonLink>
          }
        />
      </Section>

      <FinalCta />
    </>
  );
}
