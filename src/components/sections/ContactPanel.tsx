import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { ArrowRight, ButtonAnchor, ButtonLink, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/Button";
import { ProjectBriefForm } from "@/components/forms/ProjectBriefForm";

/**
 * CONTACT PANEL — the /contact composition (§5, §30, §83).
 *
 * Every channel line is resolved from the site settings (Phase C authority): phone, WhatsApp, the
 * Maps link and the location label are READ, never stored here. That is the whole point of the
 * block — an editor owns the headings, the explanatory copy and where the buttons point; the
 * business data itself has exactly one home.
 *
 * Business hours remain an explicit pending state until the owner supplies them (§86): the panel
 * shows the same "to be confirmed" wording the shipped page uses rather than inventing hours.
 */
export type ContactPanelContent = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  channelsHeading?: string;
  formHeading?: string;
  formHelp?: string;
  asideProjectHeading?: string;
  asideProjectBody?: string;
  asideProjectCta?: { href: string; label: string; external?: boolean; newTab?: boolean };
  asideDirectionsHeading?: string;
  asideDirectionsBody?: string;
  asideDirectionsCta?: { href: string; label: string; external?: boolean; newTab?: boolean };
};

export async function ContactPanel({
  locale,
  content,
  headingId,
}: {
  locale: AppLocale;
  content?: ContactPanelContent;
  headingId?: string;
}) {
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tw = await getTranslations({ locale, namespace: "wa" });

  return (
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
            <p className="eyebrow">{content?.eyebrow}</p>
            <h1 id={headingId} className="display-1 mt-6 max-w-[18ch]">
              {content?.title}
            </h1>
            <p className="lede measure mt-6 text-[1.0625rem]">{content?.lede}</p>

            <h2 className="eyebrow mt-14 mb-5">{content?.channelsHeading}</h2>

            <ul className="flex flex-col border-t border-ink-950/12" role="list">
              <li className="border-b border-ink-950/12">
                <a
                  href={identity.whatsapp.href ? withWhatsAppMessage(identity.whatsapp.href, tw("contact")) : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp_click"
                  data-analytics-location="contact_page"
                  className="group flex items-center gap-5 py-5 transition-colors duration-200 hover:text-navy-800"
                >
                  <WhatsAppIcon className="h-6 w-6 text-navy-800" />
                  <span className="flex-1">
                    <span className="block text-[0.75rem] font-semibold text-muted">{t("phoneLabel")}</span>
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
                    <span className="block text-[0.75rem] font-semibold text-muted">{tCta("call")}</span>
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
                    <span className="block text-[0.75rem] font-semibold text-muted">{t("locationLabel")}</span>
                    <span className="mt-1 block text-[1.125rem] font-bold">{identity.location.display}</span>
                  </span>
                  <ArrowRight className="text-steel-600" />
                </a>
              </li>

              <li className="flex items-center gap-5 py-5 text-muted">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
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
              <h2 className="display-3">{content?.formHeading}</h2>
              <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-[1.9] text-steel-600">{content?.formHelp}</p>
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
              <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                <h2 className="display-3">{content?.asideProjectHeading}</h2>
                <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{content?.asideProjectBody}</p>
                {content?.asideProjectCta ? (
                  <ButtonLink
                    href={content.asideProjectCta.href}
                    size="lg"
                    className="mt-6 w-full"
                  >
                    <span>{content.asideProjectCta.label}</span>
                    <ArrowRight />
                  </ButtonLink>
                ) : null}
              </div>

              <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                <h2 className="eyebrow">{content?.asideDirectionsHeading}</h2>
                <p className="mt-3 text-[0.9375rem] leading-[1.9] text-steel-600">{content?.asideDirectionsBody}</p>
                {identity.location.mapsUrl ? (
                  <ButtonAnchor
                    href={identity.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="md"
                    variant="secondary"
                    className="mt-5"
                    data-analytics="maps_click"
                    data-analytics-location="contact_aside"
                  >
                    <PinIcon />
                    <span>{content?.asideDirectionsCta?.label ?? tCta("directions")}</span>
                  </ButtonAnchor>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
