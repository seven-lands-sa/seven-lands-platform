import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { ButtonAnchor, ButtonLink, ArrowRight, PhoneIcon, WhatsAppIcon } from "@/components/ui/Button";
import { PathRail } from "@/components/brand/PathArt";

export type FinalCtaCta = { href: string; label: string; external?: boolean; newTab?: boolean };

export type FinalCtaContent = {
  eyebrow?: string; heading1?: string; heading2?: string; body?: string;
  primaryLabel?: string; secondaryLabel?: string;
  primary?: FinalCtaCta;
};

export async function FinalCta({ content }: { content?: FinalCtaContent } = {}) {
  const locale = (await getLocale()) as AppLocale;
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations("home.finalCta");
  const tw = await getTranslations("wa");
  const c = {
    eyebrow: content?.eyebrow ?? t("eyebrow"),
    heading1: content?.heading1 ?? t("heading1"),
    heading2: content?.heading2 ?? t("heading2"),
    body: content?.body ?? t("body"),
    primaryLabel: content?.primaryLabel ?? t("primary"),
    secondaryLabel: content?.secondaryLabel ?? t("secondary"),
  };
  const primary = content?.primary ?? { href: "/start-a-project", label: c.primaryLabel };

  return (
    <section className="on-dark surface-dark relative overflow-hidden" aria-labelledby="final-cta-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(245,247,248,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,247,248,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="container-x relative section-y">
        <PathRail tone="dark" nodes={7} className="mb-12 opacity-60" />

        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <p className="eyebrow text-ice-400">{c.eyebrow}</p>
            <h2 id="final-cta-heading" className="display-2 mt-5 text-offwhite">
              <span className="block">{c.heading1}</span>
              <span className="mt-3 block text-ice-400">{c.heading2}</span>
            </h2>
            <p className="lede measure mt-6 text-[1rem] text-offwhite/75">{c.body}</p>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <div className="flex flex-col gap-3">
              {primary.external ? (
                <ButtonAnchor
                  href={primary.href}
                  target={primary.newTab === false ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  size="lg"
                  className="w-full !bg-offwhite !text-ink-950 hover:!bg-white"
                  data-analytics="service_cta_click"
                  data-analytics-location="final_cta"
                >
                  <span>{primary.label}</span>
                  <ArrowRight />
                </ButtonAnchor>
              ) : (
                <ButtonLink
                  href={primary.href}
                  size="lg"
                  className="w-full !bg-offwhite !text-ink-950 hover:!bg-white"
                  data-analytics="service_cta_click"
                  data-analytics-location="final_cta"
                >
                  <span>{primary.label}</span>
                  <ArrowRight />
                </ButtonLink>
              )}
              <ButtonAnchor
                href={withWhatsAppMessage(identity.whatsapp.href, tw("hero"))}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="whatsapp"
                className="w-full !border-white/25 !text-offwhite hover:!border-white/60 hover:!bg-white/[0.06]"
                data-analytics="whatsapp_click"
                data-analytics-location="final_cta"
              >
                <WhatsAppIcon />
                <span>{c.secondaryLabel}</span>
              </ButtonAnchor>
              <a
                href={identity.phone.href}
                data-analytics="phone_click"
                data-analytics-location="final_cta"
                className="mt-2 inline-flex items-center gap-2.5 text-[0.9375rem] text-offwhite/75 transition-colors duration-200 hover:text-white"
              >
                <PhoneIcon />
                <span className="num" dir="ltr">
                  {identity.phone.display}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
