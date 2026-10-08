import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getServiceIndex } from "@/lib/services/public";
import { LandGlyph } from "@/components/brand/LandGlyphs";
import { ArrowRight } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { AppLocale } from "@/i18n/routing";

/**
 * SERVICES INDEX — the capability grid (§5, §83).
 *
 * The list itself is not editorial content in Phase E: the seven capabilities are code-owned until
 * the Services phase moves them into the CMS, and this block controls the section's own heading and
 * intro. That keeps one authority for capability names instead of two that can drift.
 */
export type ServicesIndexContent = { eyebrow?: string; heading?: string; lede?: string };

export async function ServicesIndex({
  locale,
  content,
  headingId,
}: {
  locale: AppLocale;
  content?: ServicesIndexContent;
  headingId?: string;
}) {
  const tCta = await getTranslations({ locale, namespace: "cta" });
  /* One authority for capability copy: the adapter resolves CMS-published documents first. */
  const lands = await getServiceIndex(locale);

  return (
    <Section tone="light" aria-labelledby={headingId}>
      <SectionHeading id={headingId} eyebrow={content?.eyebrow} title={content?.heading} lede={content?.lede} />

      <ul
        className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {lands.map((land) => (
          <li key={land.slug} className="bg-white">
            <Link
              href={`/services/${land.slug}`}
              className="flex h-full flex-col gap-4 p-6 transition-colors duration-200 hover:bg-offwhite"
            >
              <span className="flex items-center justify-between">
                <LandGlyph glyph={land.glyph} className="h-6 w-6 text-navy-800" />
                <span className="num text-[0.75rem] text-muted">{land.number}</span>
              </span>
              <span className="text-[0.9375rem] font-semibold">{land.title}</span>
              <span className="mt-auto inline-flex items-center gap-2 text-[0.8125rem] text-steel-600">
                {tCta("openLand")}
                <ArrowRight />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
