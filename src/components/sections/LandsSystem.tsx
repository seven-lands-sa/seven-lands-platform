"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { smoothPath } from "@/lib/path";
import type { ServiceView } from "@/lib/services/public";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { ArrowRight } from "@/components/ui/Button";

const SERVICE_IMAGES: Record<string, { src: string; altAr: string; altEn: string }> = {
  "strategy-business-growth": {
    src: "/media/services/01-strategy-growth.webp",
    altAr: "استراتيجية ونمو الأعمال — مقر سفن لاند في الرياض",
    altEn: "Strategy & Business Growth — Seven Lands Riyadh",
  },
  "branding-creative": {
    src: "/media/services/02-branding-creative.webp",
    altAr: "الهوية والعلامة التجارية — حرفية التصميم والخط العربي",
    altEn: "Branding & Creative Identity — Typography & Design Craft",
  },
  "content-production": {
    src: "/media/services/03-content-production.webp",
    altAr: "الإنتاج الإبداعي وصناعة المحتوى — كاميرات سينمائية واستوديو متكامل",
    altEn: "Creative Content Production — Cinema Optics & Studio Production",
  },
  "social-digital-presence": {
    src: "/media/services/04-social-presence.webp",
    altAr: "التواجد الرقمي والشبكات — إدارة الحملات وصناعة التأثير",
    altEn: "Social & Digital Presence — Content Command Center",
  },
  "performance-acquisition": {
    src: "/media/services/05-performance-acquisition.webp",
    altAr: "الأداء واكتساب العملاء — تحليلات وبيانات دقيقة لنمو المبيعات",
    altEn: "Performance & Acquisition — Growth Marketing Telemetry",
  },
  "web-commerce-experiences": {
    src: "/media/services/06-web-experiences.webp",
    altAr: "التجارب الرقمية والتجارة — مواقع وتطبيقات تفاعلية متقدمة",
    altEn: "Web & Commerce Experiences — Flagship Digital Platforms",
  },
  "software-automation-technology": {
    src: "/media/services/07-technology-automation.webp",
    altAr: "البرمجيات والأتمتة والتقنية — حلول سحابية وأنظمة رقمية متطورة",
    altEn: "Software, Automation & Technology — Cloud & Backend Systems",
  },
};

/**
 * THE SEVEN LANDS PATH — the signature interaction.
 *
 * Desktop: seven nodes connected by one continuous path; the active node reveals
 * its capability. Keyboard accessible (real buttons, focus changes the active
 * node), no scroll hijacking, no hover-only information.
 * Mobile: the same system rendered as a readable stacked index — no path
 * gymnastics, nothing hidden behind interaction.
 */

const ROW_HEIGHT = 76;

/**
 * The seven capabilities as the SECTION receives them: resolved for this locale by the caller
 * (the service adapter — CMS when published, shipped content otherwise). The component itself never
 * reads a second source, so the home page can never disagree with the capability pages.
 */
export type LandsSystemItem = Pick<ServiceView, "slug" | "number" | "glyph" | "title" | "short" | "promise" | "capabilities">;

export function LandsSystem({ lands }: { lands: LandsSystemItem[] }) {
  const t = useTranslations("home.lands");
  const [active, setActive] = useState(0);

  const nodePoints = useMemo(
    () => lands.map((_, index) => ({ x: 12, y: ROW_HEIGHT * index + ROW_HEIGHT / 2 })),
    [lands],
  );
  const pathD = useMemo(() => {
    const bowed = nodePoints.map((point, index) => ({
      x: point.x + Math.sin(index * 1.1) * 6,
      y: point.y,
    }));
    return smoothPath(bowed, 0.6);
  }, [nodePoints]);

  const activeLand = lands[active];

  const locale = useLocale();
  const isAr = locale === "ar";
  const activeImage = SERVICE_IMAGES[activeLand.slug];

  return (
    <div>
      {/* ---------------- Desktop: path + detail panel ---------------- */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-5">
          {/* Connector path drawn from the same coordinates as the nodes. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-3 h-full w-6 overflow-visible"
            viewBox={`0 0 24 ${ROW_HEIGHT * lands.length}`}
            preserveAspectRatio="none"
            fill="none"
          >
            <path d={pathD} stroke="var(--color-ink-950)" strokeOpacity="0.18" strokeWidth="1.4" />
            <path
              d={pathD}
              stroke="var(--color-navy-800)"
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="4 8"
              className="draw-path"
              style={{ ["--path-len" as string]: "600" }}
            />
          </svg>

          <ul className="relative" role="list">
            {lands.map((land, index) => {
              const isActive = index === active;
              return (
                <li key={land.slug} style={{ height: ROW_HEIGHT }} className="flex items-center">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    aria-pressed={isActive}
                    aria-controls="land-detail"
                    className="group flex w-full items-center gap-5 rounded-lg py-2 pe-4 ps-12 text-start transition-colors duration-200"
                  >
                    {/* Node sits exactly on the path. */}
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "absolute start-[0.6875rem] block rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                        isActive
                          ? "h-[0.85rem] w-[0.85rem] border-ink-950 bg-ice-400"
                          : "h-[0.6rem] w-[0.6rem] border-ink-950/35 bg-offwhite group-hover:border-ink-950/70",
                      )}
                    />
                    <span className="num w-7 shrink-0 text-[0.75rem] font-semibold text-muted">
                      {land.number}
                    </span>
                    <span
                      className={clsx(
                        "text-[1.0625rem] font-semibold transition-colors duration-200",
                        isActive ? "text-ink-950" : "text-steel-600 group-hover:text-ink-950",
                      )}
                    >
                      {land.short}
                    </span>
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "ms-auto h-px flex-1 max-w-[5rem] transition-colors duration-300",
                        isActive ? "bg-ink-950/40" : "bg-ink-950/10",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div
            id="land-detail"
            aria-live="polite"
            className="on-dark relative h-full overflow-hidden rounded-[1.25rem] bg-ink-950 p-8 xl:p-10 shadow-xl"
          >
            {activeImage && (
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <Image
                  src={activeImage.src}
                  alt={isAr ? activeImage.altAr : activeImage.altEn}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover opacity-30 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-ink-950/50" />
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full border border-white/[0.06] z-10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-6 -top-4 h-40 w-40 rounded-full border border-white/[0.05] z-10"
            />

            <div className="relative z-10 flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow text-ice-400">{t("nodeCount", { number: activeLand.number })}</p>
                <h3 className="display-3 mt-4 text-offwhite">{activeLand.title}</h3>
              </div>
              <LandGlyph glyph={activeLand.glyph} className="h-9 w-9 text-ice-400" />
            </div>

            <p className="relative z-10 mt-5 text-[1.0625rem] leading-[1.85] text-offwhite/90">
              {activeLand.promise}
            </p>

            <ul className="relative z-10 mt-7 flex flex-wrap gap-2">
              {activeLand.capabilities.slice(0, 5).map((capability) => (
                <li
                  key={capability}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[0.8125rem] text-offwhite/85 backdrop-blur-xs"
                >
                  {capability}
                </li>
              ))}
            </ul>

            <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`/services/${activeLand.slug}`}
                className="group/btn inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-offwhite underline-offset-[6px] hover:underline"
                data-analytics="service_cta_click"
                data-analytics-location="lands_system"
              >
                <span>{t("viewLand")}</span>
                <ArrowRight />
              </Link>
              <span className="text-[0.8125rem] text-offwhite/65">{t("selectHint")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Mobile / tablet: readable stacked index with visual previews ---------------- */}
      <ul className="flex flex-col gap-6 lg:hidden" role="list">
        {lands.map((land) => {
          const img = SERVICE_IMAGES[land.slug];
          return (
            <li key={land.slug}>
              <Link
                href={`/services/${land.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-white transition-all duration-300 hover:border-ink-950/30 hover:shadow-lg active:scale-[0.98] shadow-xs"
                data-analytics="service_cta_click"
                data-analytics-location="lands_mobile"
              >
                {img && (
                  <div className="relative h-48 w-full overflow-hidden bg-ink-950/5">
                    <Image
                      src={img.src}
                      alt={isAr ? img.altAr : img.altEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent" />
                    <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between text-white">
                      <span className="num text-[0.75rem] font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        0{land.number} LAND
                      </span>
                      <span className="text-[0.6875rem] text-white/80 font-medium">
                        {isAr ? "معتمد في الرياض" : "Active Riyadh"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3 p-5">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <LandGlyph glyph={land.glyph} className="h-5 w-5 text-navy-800" />
                      <span className="display-3 !text-[1.1875rem]">{land.title}</span>
                    </span>
                    <ArrowRight className="text-steel-600 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-steel-600">
                    {land.promise}
                  </span>

                  {/* Capability tags */}
                  {land.capabilities?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-ink-950/8">
                      {land.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="rounded-full bg-offwhite px-2.5 py-1 text-[0.75rem] font-medium text-steel-600 border border-ink-950/8"
                        >
                          {cap}
                        </span>
                      ))}
                      {land.capabilities.length > 3 && (
                        <span className="num px-2 py-1 text-[0.75rem] text-muted font-semibold">
                          +{land.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
