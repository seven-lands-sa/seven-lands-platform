import Image from "next/image";
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

          {/* Brand composition & Riyadh HQ visual panel */}
          <div className="lg:col-span-4 lg:col-start-9">
            <figure className="relative">
              <div className="on-dark relative overflow-hidden rounded-[1.5rem] bg-ink-950 p-5 sm:p-6 shadow-2xl border border-ink-950/20">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1rem] bg-ink-950/40">
                  <Image
                    src="/brand/seven-lands-skyline-og.webp"
                    alt={locale === "ar" ? "سفن لاند — وكالة التسويق والنمو الرقمي بالرياض" : "Seven Lands — Digital Marketing Agency Riyadh"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 35vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 start-3.5 end-3.5 flex items-center justify-between text-white/95">
                    <span className="text-[0.8125rem] font-bold tracking-tight">
                      {locale === "ar" ? "سفن لاند · الرياض · المملكة العربية السعودية" : "Seven Lands · Riyadh · Saudi Arabia"}
                    </span>
                    <span className="num text-[0.6875rem] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs font-semibold">
                      HQ
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ice-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-ice-400" />
                    </span>
                    <span className="text-[0.75rem] font-medium text-white/70">
                      {locale === "ar" ? "المقر الرئيسي وعمليات النمو" : "HQ & Growth Operations"}
                    </span>
                  </div>
                  <span className="num text-[0.75rem] font-bold text-ice-400">07 LANDS</span>
                </div>
              </div>
              <figcaption className="mt-4 flex items-center gap-3 text-[0.8125rem] text-muted">
                <span className="num">07</span>
                <span className="h-px flex-1 bg-ink-950/15" aria-hidden="true" />
                <span>{c.pathCaption}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Capability rail — interactive index of the seven Lands */}
        <div className="mt-12 border-t border-ink-950/10 pt-6 lg:mt-16">
          <div className="flex items-center justify-between gap-4 text-[0.8125rem] font-semibold text-steel-600 mb-3.5">
            <span>{t("pathCaption")}</span>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-navy-800 hover:text-ink-950 font-bold"
            >
              <span>{locale === "ar" ? "استكشف المجالات الـ 7" : "Explore All Lands"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none sm:flex-wrap">
            {(
              locale === "ar"
                ? [
                    { slug: "strategy-business-growth", num: "01", name: "استراتيجية ونمو الأعمال" },
                    { slug: "branding-creative", num: "02", name: "الهوية والعلامة التجارية" },
                    { slug: "content-production", num: "03", name: "الإنتاج وصناعة المحتوى" },
                    { slug: "social-digital-presence", num: "04", name: "التواجد الرقمي والشبكات" },
                    { slug: "performance-acquisition", num: "05", name: "الأداء واكتساب العملاء" },
                    { slug: "web-commerce-experiences", num: "06", name: "المواقع والتجارة الرقمية" },
                    { slug: "software-automation-technology", num: "07", name: "البرمجيات والأنظمة" },
                  ]
                : [
                    { slug: "strategy-business-growth", num: "01", name: "Strategy & Growth" },
                    { slug: "branding-creative", num: "02", name: "Brand & Identity" },
                    { slug: "content-production", num: "03", name: "Content Production" },
                    { slug: "social-digital-presence", num: "04", name: "Social Presence" },
                    { slug: "performance-acquisition", num: "05", name: "Performance & Growth" },
                    { slug: "web-commerce-experiences", num: "06", name: "Digital Platforms" },
                    { slug: "software-automation-technology", num: "07", name: "Software & Tech" },
                  ]
            ).map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="inline-flex shrink-0 snap-start items-center gap-2 rounded-full border border-ink-950/10 bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-steel-600 transition-all duration-200 hover:border-ink-950/30 hover:text-ink-950 hover:bg-offwhite active:scale-95 shadow-2xs"
              >
                <span className="num font-bold text-ice-400 text-[0.6875rem]">{item.num}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
