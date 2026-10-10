import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { publishedCaseStudies, workEmptyState } from "@/content/work";
import { getServiceLabels } from "@/lib/services/public";
import { CRAFT_MEDIA } from "@/lib/services/images";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PathRail } from "@/components/brand/PathArt";

/**
 * SELECTED WORK — rendered only when real, publishable case studies exist.
 * When real case studies are pending written sign-off, this section showcases
 * Seven Lands' multidisciplinary execution craft with authentic photography.
 */
export type WorkTeaserContent = {
  eyebrow?: string; selected?: string; allWork?: string; workPage?: string;
  emptyTitle?: string; emptyBody?: string; emptyPoints?: string[];
};

export async function WorkTeaser({ locale, content }: { locale: AppLocale; content?: WorkTeaserContent }) {
  const t = await getTranslations("home.work");
  const empty = workEmptyState[locale];
  /* Capability names on a work card come from the resolved capability list, never a second table. */
  const landLabels = await getServiceLabels(locale);
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
        title={hasWork ? c.selected : (locale === "ar" ? "أبرز مجالاتنا وحلولنا المتكاملة" : "Featured Disciplines & Integrated Solutions")}
        lede={hasWork ? undefined : c.emptyBody}
        actions={
          <ButtonLink href="/work" variant="secondary" size="lg">
            <span>{hasWork ? c.allWork : c.workPage}</span>
            <ArrowRight />
          </ButtonLink>
        }
      />

      {hasWork ? (
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
          {publishedCaseStudies.slice(0, 3).map((item) => {
            const scopeLabels = item.landSlugs
              .map((slug) => landLabels.get(slug)?.short)
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
        <div className="mt-12 space-y-10">
          {/* Mobile swipeable reel / Desktop 4-col grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(CRAFT_MEDIA).map(([key, item], idx) => (
              <Link
                key={key}
                href={`/services/${item.serviceSlug}`}
                className="group relative flex flex-col shrink-0 w-[280px] sm:w-auto snap-start overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-offwhite transition-all duration-300 hover:border-ink-950/30 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-950/10">
                  <Image
                    src={item.src}
                    alt={locale === "ar" ? item.titleAr : item.titleEn}
                    fill
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-3 start-3 text-[0.6875rem] font-bold bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                    0{idx + 1}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-[1.0625rem] font-bold text-ink-950 group-hover:text-emerald-700 transition-colors">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.8] text-steel-600 flex-1">
                    {locale === "ar" ? item.descAr : item.descEn}
                  </p>
                  <div className="mt-4 pt-3 border-t border-ink-950/10 flex items-center justify-between text-[0.8125rem] font-semibold text-navy-800 group-hover:text-emerald-700 transition-colors">
                    <span>{locale === "ar" ? "استكشف الخدمة" : "Explore Service"}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Transparent Editorial Grounding */}
          <div className="rounded-[1.25rem] border border-ink-950/10 bg-offwhite/60 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-12 items-center">
              <div className="md:col-span-5">
                <PathRail nodes={4} className="opacity-60 mb-3" />
                <h4 className="text-[1.0625rem] font-bold text-ink-950">
                  {locale === "ar" ? "التزام الشفافية وتوثيق النتائج" : "Transparency & Verification Standards"}
                </h4>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-steel-600">
                  {empty.note}
                </p>
              </div>
              <div className="md:col-span-7">
                <ul className="grid gap-3 sm:grid-cols-3" role="list">
                  {c.emptyPoints.map((line, index) => (
                    <li key={line} className="rounded-xl bg-white p-3.5 border border-ink-950/8 shadow-2xs">
                      <span className="num text-[0.6875rem] font-bold text-ice-400 block mb-1">
                        0{index + 1}
                      </span>
                      <span className="text-[0.8125rem] leading-snug text-steel-600 block">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
