import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedSystemPage } from "@/lib/pages/adapter";
import { resolvePublicMedia } from "@/lib/content/media";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { ArrowRight, ButtonAnchor, ButtonLink, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/Button";
import { ProjectBriefForm } from "@/components/forms/ProjectBriefForm";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  const identity = await getSiteIdentity(locale);
  /* §37 — when this locale is published in the CMS its SEO contract wins; the shipped metadata is
     the fallback, and the canonical URL always stays derived from the real route. */
  const page = await getPublishedSystemPage("contact", locale);
  const shareImage = page ? resolvePublicMedia(page.seo.ogImage as never, { locale }) : null;
  return buildMetadata({
    identity,
    locale,
    title: page?.seo.title ?? t("title"),
    description: page?.seo.description ?? t("description"),
    path: "/contact",
    noIndex: page?.seo.noindex ?? false,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  /* §44 — the CMS document serves this locale only once it is published for it; until then the
     shipped composition below is the page, unchanged. */
  const cms = await getPublishedSystemPage("contact", locale);

  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tw = await getTranslations({ locale, namespace: "wa" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema(locale, identity),
            breadcrumbSchema(locale, [{ name: t("hero.eyebrow"), path: "/contact" }], identity),
          ]),
        }}
      />

      {cms ? (
        <PageBlocks page={cms} locale={locale} />
      ) : (
        <>
      <section className="bg-offwhite pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className="text-[0.8125rem] text-muted transition-colors duration-200 hover:text-ink-950"
            >
              {tCta("backHome")}
            </Link>
          </nav>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="display-1 mt-6 max-w-[18ch]">{t("hero.title")}</h1>
              <p className="lede measure mt-6 text-[1.0625rem]">{t("hero.lede")}</p>

              <h2 className="eyebrow mt-14 mb-5">{t("channelsHeading")}</h2>

              <ul className="flex flex-col border-t border-ink-950/12" role="list">
                <li className="border-b border-ink-950/12">
                  <a
                    href={withWhatsAppMessage(identity.whatsapp.href, tw("contact"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="whatsapp_click"
                    data-analytics-location="contact_page"
                    className="group flex items-center gap-5 py-5 transition-colors duration-200 hover:text-navy-800"
                  >
                    <WhatsAppIcon className="h-6 w-6 text-navy-800" />
                    <span className="flex-1">
                      <span className="block text-[0.75rem] font-semibold text-muted">
                        {t("phoneLabel")}
                      </span>
                      <span className="num mt-1 block text-[1.125rem] font-bold" dir="ltr">
                        {identity.phone.display}
                      </span>
                    </span>
                    <ArrowRight className="text-steel-600" />
                  </a>
                </li>

                <li className="border-b border-ink-950/12">
                  <a
                    href={identity.phone.href}
                    data-analytics="phone_click"
                    data-analytics-location="contact_page"
                    className="group flex items-center gap-5 py-5 transition-colors duration-200 hover:text-navy-800"
                  >
                    <PhoneIcon className="h-6 w-6 text-navy-800" />
                    <span className="flex-1">
                      <span className="block text-[0.75rem] font-semibold text-muted">
                        {tCta("call")}
                      </span>
                      <span className="mt-1 block text-[1.125rem] font-bold">
                        {locale === "ar" ? "اتصال مباشر" : "Direct call"}
                      </span>
                    </span>
                    <ArrowRight className="text-steel-600" />
                  </a>
                </li>

                <li className="border-b border-ink-950/12">
                  <a
                    href={identity.location.mapsUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="maps_click"
                    data-analytics-location="contact_page"
                    className="group flex items-center gap-5 py-5 transition-colors duration-200 hover:text-navy-800"
                  >
                    <PinIcon className="h-6 w-6 text-navy-800" />
                    <span className="flex-1">
                      <span className="block text-[0.75rem] font-semibold text-muted">
                        {t("locationLabel")}
                      </span>
                      <span className="mt-1 block text-[1.125rem] font-bold">
                        {identity.location.display}
                      </span>
                    </span>
                    <ArrowRight className="text-steel-600" />
                  </a>
                </li>

                <li className="flex items-center gap-5 py-5 text-muted">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 1.8" />
                  </svg>
                  <span className="flex-1">
                    <span className="block text-[0.75rem] font-semibold">{t("hoursLabel")}</span>
                    <span className="mt-1 block text-[0.9375rem]">{t("pendingValue")}</span>
                  </span>
                </li>
              </ul>

              <div className="mt-10">
                <h2 className="display-3">{t("formHeading")}</h2>
                <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                  {t("formHelp")}
                </p>
                <div className="mt-6">
                  <ProjectBriefForm
                    mode="quick"
                    whatsappBase={identity.whatsapp.href}
                    phoneDisplay={identity.phone.display}
                  />
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="sticky top-28 flex flex-col gap-6">
                <div className="overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-white p-3 shadow-sm">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.875rem]">
                    <Image
                      src="/media/editorial/riyadh-consultation-space.webp"
                      alt={locale === "ar" ? "مقر سفن لاند في الرياض — صالة الاستشارات" : "Seven Lands Riyadh HQ — Consultation Lounge"}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                  <h2 className="display-3">{locale === "ar" ? "مشروع جديد؟" : "New project?"}</h2>
                  <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">
                    {locale === "ar"
                      ? "نموذج بدء المشروع يعطينا الهدف والنطاق والتوقيت، فيكون ردنا أدق من أول رسالة."
                      : "The project brief gives us the goal, scope and timing, so our first reply is more useful."}
                  </p>
                  <ButtonLink href="/start-a-project" size="lg" className="mt-6 w-full">
                    <span>{t("startInstead")}</span>
                    <ArrowRight />
                  </ButtonLink>
                </div>

                <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                  <h2 className="eyebrow">{tCta("directions")}</h2>
                  <p className="mt-3 text-[0.9375rem] leading-[1.9] text-steel-600">
                    {locale === "ar"
                      ? "نستقبل المشاريع من كل مناطق المملكة، والزيارات الميدانية تُحدد حسب المشروع."
                      : "We deliver across Saudi Arabia; on-site visits are arranged per project."}
                  </p>
                  <ButtonAnchor
                    href={identity.location.mapsUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="md"
                    variant="secondary"
                    className="mt-5"
                    data-analytics="maps_click"
                    data-analytics-location="contact_aside"
                  >
                    <PinIcon />
                    <span>{tCta("directions")}</span>
                  </ButtonAnchor>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
        </>
      )}
    </>
  );
}
