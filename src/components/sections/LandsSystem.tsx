"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { smoothPath } from "@/lib/path";
import type { ServiceView } from "@/lib/services/public";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { ArrowRight } from "@/components/ui/Button";

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
            className="on-dark relative h-full overflow-hidden rounded-[1.25rem] bg-ink-950 p-8 xl:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full border border-white/[0.06]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-6 -top-4 h-40 w-40 rounded-full border border-white/[0.05]"
            />

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow text-ice-400">{t("nodeCount", { number: activeLand.number })}</p>
                <h3 className="display-3 mt-4 text-offwhite">{activeLand.title}</h3>
              </div>
              <LandGlyph glyph={activeLand.glyph} className="h-9 w-9 text-ice-400" />
            </div>

            <p className="mt-5 text-[1.0625rem] leading-[1.85] text-offwhite/80">
              {activeLand.promise}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {activeLand.capabilities.slice(0, 5).map((capability) => (
                <li
                  key={capability}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[0.8125rem] text-offwhite/75"
                >
                  {capability}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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

      {/* ---------------- Mobile / tablet: readable stacked index ---------------- */}
      <ul className="flex flex-col gap-4 lg:hidden" role="list">
        {lands.map((land) => {
          return (
            <li key={land.slug}>
              <Link
                href={`/services/${land.slug}`}
                className="group flex flex-col gap-3 rounded-[1rem] border border-ink-950/12 bg-white p-5 transition-colors duration-200 hover:border-ink-950/30"
                data-analytics="service_cta_click"
                data-analytics-location="lands_mobile"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="num text-[0.8125rem] font-semibold text-muted">
                      {land.number}
                    </span>
                    <LandGlyph glyph={land.glyph} className="h-5 w-5 text-navy-800" />
                  </span>
                  <ArrowRight className="text-steel-600" />
                </span>
                <span className="display-3 !text-[1.1875rem]">{land.title}</span>
                <span className="text-[0.9375rem] leading-relaxed text-steel-600">
                  {land.promise}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
