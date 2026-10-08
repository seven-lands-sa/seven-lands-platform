import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedSystemPage } from "@/lib/pages/adapter";
import { resolvePublicMedia } from "@/lib/content/media";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { ButtonAnchor, PhoneIcon, WhatsAppIcon } from "@/components/ui/Button";
import { ProjectBriefForm } from "@/components/forms/ProjectBriefForm";
import { PathRail } from "@/components/brand/PathArt";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.start" });
  const identity = await getSiteIdentity(locale);
  /* §37 — when this locale is published in the CMS its SEO contract wins; the shipped metadata is
     the fallback, and the canonical URL always stays derived from the real route. */
  const page = await getPublishedSystemPage("start-a-project", locale);
  const shareImage = page ? resolvePublicMedia(page.seo.ogImage as never, { locale }) : null;
  return buildMetadata({
    identity,
    locale,
    title: page?.seo.title ?? t("title"),
    description: page?.seo.description ?? t("description"),
    path: "/start-a-project",
    noIndex: page?.seo.noindex ?? false,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function StartAProjectPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  /* §44 — the CMS document serves this locale only once it is published for it; until then the
     shipped composition below is the page, unchanged. */
  const cms = await getPublishedSystemPage("start-a-project", locale);

  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "start" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tw = await getTranslations({ locale, namespace: "wa" });
  const points = t.raw("aside.points") as string[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(locale, [{ name: t("hero.eyebrow"), path: "/start-a-project" }], identity),
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
              <h1 className="display-1 mt-6 max-w-[22ch]">{t("hero.title")}</h1>
              <p className="lede measure mt-6 text-[1.0625rem]">{t("hero.lede")}</p>

              <div className="mt-10">
                <ProjectBriefForm
                  mode="brief"
                  whatsappBase={identity.whatsapp.href}
                  phoneDisplay={identity.phone.display}
                />
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="sticky top-28 flex flex-col gap-6">
                <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                  <h2 className="display-3">{t("aside.heading")}</h2>
                  <ol className="mt-5 flex flex-col divide-y divide-ink-950/10" role="list">
                    {points.map((point, index) => (
                      <li key={point} className="flex gap-4 py-4">
                        <span className="num text-[0.75rem] font-semibold text-muted">
                          0{index + 1}
                        </span>
                        <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{point}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 text-[0.75rem] text-muted">{t("aside.note")}</p>
                </div>

                <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                  <PathRail nodes={4} className="opacity-50" />
                  <h2 className="eyebrow mt-4">{tCta("whatsapp")}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    <ButtonAnchor
                      href={withWhatsAppMessage(identity.whatsapp.href, tw("start"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="lg"
                      variant="whatsapp"
                      className="w-full"
                      data-analytics="whatsapp_click"
                      data-analytics-location="start_page"
                    >
                      <WhatsAppIcon />
                      <span>{tCta("whatsappShort")}</span>
                    </ButtonAnchor>
                    <a
                      href={identity.phone.href}
                      data-analytics="phone_click"
                      data-analytics-location="start_page"
                      className="inline-flex items-center gap-2.5 text-[0.9375rem] text-steel-600 transition-colors duration-200 hover:text-ink-950"
                    >
                      <PhoneIcon />
                      <span className="num" dir="ltr">
                        {identity.phone.display}
                      </span>
                    </a>
                  </div>
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
