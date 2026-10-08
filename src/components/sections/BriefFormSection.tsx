import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { ButtonAnchor, PhoneIcon, WhatsAppIcon } from "@/components/ui/Button";
import { PathRail } from "@/components/brand/PathArt";
import { ProjectBriefForm } from "@/components/forms/ProjectBriefForm";

/**
 * BRIEF FORM — the /start-a-project composition (§5, §30, §83).
 *
 * The brief form itself stays a code-backed component: its steps, validation, honeypot, rate limit,
 * UTM capture and WhatsApp handoff are product behaviour, not content. The block owns the page
 * heading, the "what happens next" list and the note; the WhatsApp card reads the number from the
 * site settings. A "brief" block always renders the full brief; a "quick" block always renders the
 * short version — the mode is a property of the block, never a free choice inside the form.
 */
export type BriefFormContent = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  asideHeading?: string;
  asidePoints?: string[];
  asideNote?: string;
};

export async function BriefFormSection({
  locale,
  content,
  headingId,
}: {
  locale: AppLocale;
  content?: BriefFormContent;
  headingId?: string;
}) {
  const identity = await getSiteIdentity(locale);
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tw = await getTranslations({ locale, namespace: "wa" });
  const points = content?.asidePoints ?? [];

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
            <h1 id={headingId} className="display-1 mt-6 max-w-[22ch]">
              {content?.title}
            </h1>
            <p className="lede measure mt-6 text-[1.0625rem]">{content?.lede}</p>

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
                <h2 className="display-3">{content?.asideHeading}</h2>
                <ol className="mt-5 flex flex-col divide-y divide-ink-950/10" role="list">
                  {points.map((point, index) => (
                    <li key={point} className="flex gap-4 py-4">
                      <span className="num text-[0.75rem] font-semibold text-muted">0{index + 1}</span>
                      <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{point}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-[0.75rem] text-muted">{content?.asideNote}</p>
              </div>

              <div className="rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
                <PathRail nodes={4} className="opacity-50" />
                <h2 className="eyebrow mt-4">{tCta("whatsapp")}</h2>
                <div className="mt-4 flex flex-col gap-3">
                  <ButtonAnchor
                    href={identity.whatsapp.href ? withWhatsAppMessage(identity.whatsapp.href, tw("start")) : undefined}
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
  );
}
