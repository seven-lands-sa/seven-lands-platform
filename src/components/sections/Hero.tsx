import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { ButtonLink, ButtonAnchor, ArrowRight, WhatsAppIcon } from "@/components/ui/Button";
import { PathArt } from "@/components/brand/PathArt";

export type HeroCta = { href: string; label: string; external?: boolean; newTab?: boolean };

export type HeroContent = {
  eyebrow?: string; title1?: string; title2?: string; titleAccent?: string;
  support?: string; primaryLabel?: string; secondaryLabel?: string;
  whatsappLine?: string; pathCaption?: string;
  /** CMS-driven destinations. Absent → the design's original links. */
  primary?: HeroCta; secondary?: HeroCta;
};

/** One button, two link flavours — the static hero's exact DOM for internal targets. */
function HeroButton({
  cta, location, variant, className, arrow,
}: {
  cta: HeroCta; location: string; variant?: "primary" | "secondary"; className: string; arrow?: boolean;
}) {
  const body = (
    <>
      <span>{cta.label}</span>
      {arrow ? <ArrowRight /> : null}
    </>
  );
  if (cta.external) {
    return (
      <ButtonAnchor
        href={cta.href}
        target={cta.newTab === false ? undefined : "_blank"}
        rel="noopener noreferrer"
        size="lg"
        variant={variant}
        className={className}
        data-analytics="service_cta_click"
        data-analytics-location={location}
      >
        {body}
      </ButtonAnchor>
    );
  }
  return (
    <ButtonLink
      href={cta.href}
      size="lg"
      variant={variant}
      className={className}
      data-analytics="service_cta_click"
      data-analytics-location={location}
    >
      {body}
    </ButtonLink>
  );
}

export async function Hero({ content }: { content?: HeroContent } = {}) {
  const locale = (await getLocale()) as AppLocale;
  const identity = await getSiteIdentity(locale);
  const t = await getTranslations("home.hero");
  const tw = await getTranslations("wa");
  const c = {
    eyebrow: content?.eyebrow ?? t("eyebrow"),
    title1: content?.title1 ?? t("title1"),
    title2: content?.title2 ?? t("title2"),
    titleAccent: content?.titleAccent ?? t("titleAccent"),
    support: content?.support ?? t("support"),
    primaryLabel: content?.primaryLabel ?? t("primary"),
    secondaryLabel: content?.secondaryLabel ?? t("secondary"),
    whatsappLine: content?.whatsappLine ?? t("whatsappLine"),
    pathCaption: content?.pathCaption ?? t("pathCaption"),
  };
  const primary: HeroCta = content?.primary ?? { href: "/start-a-project", label: c.primaryLabel };
  const secondary: HeroCta = content?.secondary ?? { href: "/work", label: c.secondaryLabel };

  return (
    <section className="relative overflow-hidden bg-offwhite pt-12 pb-16 md:pt-16 lg:pt-20 lg:pb-24">
      {/* Editorial grid hairlines — structure, not decoration. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="container-x h-full">
          <div className="grid h-full grid-cols-12 border-x border-ink-950/[0.06]">
            {Array.from({ length: 11 }).map((_, index) => (
              <div key={index} className="border-e border-ink-950/[0.04] last:border-e-0" />
            ))}
          </div>
        </div>
      </div>

      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8 xl:col-span-7">
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ink-950/30" aria-hidden="true" />
              {c.eyebrow}
            </p>

            <h1 className="display-1 mt-7 text-balance">
              <span className="block">{c.title1}</span>
              <span className="mt-2 block text-steel-600">
                {c.title2}{" "}
                <span className="relative inline-block text-ink-950">
                  {c.titleAccent}
                  {/* Directional underline: the logo's arrow, reduced to a stroke. */}
                  <svg
                    viewBox="0 0 260 18"
                    className="absolute -bottom-2 start-0 h-[0.35em] w-full text-ice-400"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 13 C 70 4, 170 4, 236 11"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="draw-path"
                      style={{ ["--path-len" as string]: "260" }}
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="lede measure mt-8 text-[1.0625rem] md:text-[1.125rem]">{c.support}</p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <HeroButton cta={primary} location="hero" className="justify-center sm:w-auto" arrow />
              <HeroButton cta={secondary} location="hero_work" variant="secondary" className="justify-center sm:w-auto" />
            </div>

            <p className="mt-6">
              <a
                href={withWhatsAppMessage(identity.whatsapp.href, tw("hero"))}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp_click"
                data-analytics-location="hero"
                className="inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-steel-600 underline-offset-[6px] transition-colors duration-200 hover:text-ink-950 hover:underline"
              >
                <WhatsAppIcon className="text-ice-400" />
                <span>{c.whatsappLine}</span>
              </a>
            </p>
          </div>

          {/* Brand composition panel. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <figure className="relative">
              <div className="on-dark relative overflow-hidden rounded-[1.25rem] bg-ink-950 px-6 pt-8 pb-2 sm:px-10 sm:pt-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.55]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(245,247,248,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,247,248,0.06) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                  }}
                />
                <PathArt variant="dark" className="relative mx-auto max-h-[24rem] w-full max-w-[20rem]" />
              </div>
              <figcaption className="mt-4 flex items-center gap-3 text-[0.8125rem] text-muted">
                <span className="num">07</span>
                <span className="h-px flex-1 bg-ink-950/15" aria-hidden="true" />
                <span>{c.pathCaption}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Capability rail — a first, quiet index of the seven Lands. */}
        <div className="mt-14 border-t border-ink-950/10 pt-6 lg:mt-20">
          <Link
            href="/services"
            className="group flex items-center justify-between gap-4 text-[0.8125rem] font-semibold text-steel-600 transition-colors duration-200 hover:text-ink-950"
          >
            <span>{t("pathCaption")}</span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
