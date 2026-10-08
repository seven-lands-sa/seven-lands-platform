import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";

export type LegalSectionViewModel = { title: string; body: ReactNode };

/** The page-specific parts of a legal page, as a page block supplies them (§5). */
export type LegalPageContent = {
  title: string;
  intro: ReactNode;
  draftNotice: string;
  lastUpdatedLabel: string;
  sections: LegalSectionViewModel[];
};

/**
 * The shipped legal layout. Same markup, same classes — the only difference between the static call
 * sites and the CMS one is where the values come from: literals here, a typed view model there.
 * `updatedAt` deliberately stays a caller-supplied constant: the legal review date is a legal
 * statement, not a per-edit timestamp, so no editor action can move it.
 */
export async function LegalPage({
  content,
  title,
  intro,
  sections,
  updatedAt,
  draftNotice,
  lastUpdatedLabel,
}: {
  content?: LegalPageContent;
  title?: string;
  intro?: ReactNode;
  sections?: LegalSectionViewModel[];
  updatedAt: string;
  draftNotice?: string;
  lastUpdatedLabel?: string;
}) {
  const view: LegalPageContent = content ?? {
    title: title ?? "",
    intro: intro ?? null,
    draftNotice: draftNotice ?? "",
    lastUpdatedLabel: lastUpdatedLabel ?? "",
    sections: sections ?? [],
  };
  const t = await getTranslations();
  const tCta = await getTranslations("cta");

  return (
    <div className="bg-offwhite">
      <div className="container-x grid gap-12 pt-12 pb-20 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className="text-[0.8125rem] text-muted transition-colors duration-200 hover:text-ink-950"
            >
              {tCta("backHome")}
            </Link>
          </nav>

          <h1 className="display-2 max-w-[24ch]">{view.title}</h1>
          <p className="lede measure mt-6 text-[1rem]">{view.intro}</p>

          {/* Honest draft marker: these pages are not final legal copy. */}
          <p className="mt-6 rounded-[12px] border border-ice-400/50 bg-white px-4 py-3 text-[0.8125rem] leading-relaxed text-steel-600">
            {view.draftNotice}
          </p>

          <div className="mt-12 flex flex-col gap-10">
            {view.sections.map((section) => (
              <section key={section.title}>
                <h2 className="display-3">{section.title}</h2>
                <p className="mt-4 max-w-[70ch] text-[0.9375rem] leading-[1.95] text-steel-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <p className="num mt-12 text-[0.75rem] text-muted">
            {view.lastUpdatedLabel}: {updatedAt}
          </p>
        </div>

        <aside className="lg:col-span-3 lg:col-start-10">
          <div className="sticky top-28 flex flex-col gap-3">
            <Link
              href="/privacy"
              className="flex items-center justify-between border-b border-ink-950/12 py-3 text-[0.9375rem] text-steel-600 transition-colors duration-200 hover:text-ink-950"
            >
              <span>{t("meta.privacy.title")}</span>
              <ArrowRight />
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between border-b border-ink-950/12 py-3 text-[0.9375rem] text-steel-600 transition-colors duration-200 hover:text-ink-950"
            >
              <span>{t("meta.terms.title")}</span>
              <ArrowRight />
            </Link>
            <ButtonLink href="/contact" variant="secondary" className="mt-4">
              <span>{t("nav.contact")}</span>
              <ArrowRight />
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
