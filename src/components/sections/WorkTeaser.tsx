import { getTranslations } from "next-intl/server";
import { publishedCaseStudies, workEmptyState } from "@/content/work";
import { landBySlug } from "@/content/services";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PathRail } from "@/components/brand/PathArt";

/**
 * SELECTED WORK — rendered only when real, publishable case studies exist.
 * Until then this is an honest, designed statement instead of fabricated
 * clients or results.
 */
export type WorkTeaserContent = {
  eyebrow?: string; selected?: string; allWork?: string; workPage?: string;
  emptyTitle?: string; emptyBody?: string; emptyPoints?: string[];
};

export async function WorkTeaser({ locale, content }: { locale: AppLocale; content?: WorkTeaserContent }) {
  const t = await getTranslations("home.work");
  const empty = workEmptyState[locale];
  const c = {
    eyebrow: content?.eyebrow ?? t("eyebrow"),
    selected: content?.selected ?? t("selected"),
    allWork: content?.allWork ?? t("allWork"),
    workPage: content?.workPage ?? t("workPage"),
    emptyTitle: content?.emptyTitle ?? empty.title,
    emptyBody: content?.emptyBody ?? empty.body,
    emptyPoints: content?.emptyPoints?.length ? content.emptyPoints : (t.raw("emptyPoints") as string[]),
  };
  const hasWork = publishedCaseStudies.length > 0;

  return (
    <Section tone="white" aria-labelledby="work-heading">
      <SectionHeading
        id="work-heading"
        eyebrow={c.eyebrow}
        title={hasWork ? c.selected : c.emptyTitle}
        lede={hasWork ? undefined : c.emptyBody}
        actions={
          hasWork ? (
            <ButtonLink href="/work" variant="secondary" size="lg">
              <span>{c.allWork}</span>
              <ArrowRight />
            </ButtonLink>
          ) : (
            <ButtonLink href="/work" variant="secondary" size="lg">
              <span>{c.workPage}</span>
              <ArrowRight />
            </ButtonLink>
          )
        }
      />

      {hasWork ? (
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
          {publishedCaseStudies.slice(0, 3).map((item) => {
            const scopeLabels = item.landSlugs
              .map((slug) => landBySlug.get(slug as never)?.copy[locale].short)
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={item.slug}>
                <Link
                  href={`/work/${item.slug}`}
                  className="group block overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-offwhite transition-colors duration-200 hover:border-ink-950/30"
                >
                  <span className="block aspect-[4/3] bg-ink-950/5" />
                  <span className="block p-6">
                    <span className="flex items-center gap-3 text-[0.75rem] text-muted">
                      <span className="num">{item.year}</span>
                      <span className="h-px flex-1 bg-ink-950/10" />
                      <span>{item.sector}</span>
                    </span>
                    <span className="display-3 mt-4 block">{item.client}</span>
                    {scopeLabels ? (
                      <span className="mt-3 block text-[0.875rem] text-steel-600">{scopeLabels}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-14 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-dashed border-ink-950/25 bg-offwhite p-8 md:p-10">
              <PathRail nodes={5} className="opacity-70" />
              <p className="mt-3 max-w-[42ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                {locale === "ar"
                  ? "المشاريع الجاهزة للنشر تُضاف إلى صفحة الأعمال."
                  : "Publishable projects are added to the work page."}
              </p>
            </div>
          </div>
          <div className="md:col-span-5">
            <ul className="flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10" role="list">
              {c.emptyPoints.map((line, index) => (
                <li key={line} className="flex gap-4 py-4">
                  <span className="num text-[0.75rem] font-semibold text-muted">0{index + 1}</span>
                  <span className="text-[0.9375rem] leading-[1.85] text-steel-600">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
}
