import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { problems } from "@/content/home";
import { landBySlug } from "@/content/services";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { AppLocale } from "@/i18n/routing";

export type ProblemsContent = {
  eyebrow?: string; heading?: string; lede?: string; explore?: string;
  items?: { question: string; answer: string; land?: string }[];
};

export async function Problems({ locale, content }: { locale: AppLocale; content?: ProblemsContent }) {
  const t = await getTranslations("home.problems");
  const source = problems[locale];
  const data = {
    heading: content?.heading ?? source.heading,
    lede: content?.lede ?? source.lede,
    items: content?.items?.length
      ? content.items.map((item, index) => ({
          question: item.question,
          answer: item.answer,
          land: (item.land ?? source.items[index]?.land ?? "") as (typeof source.items)[number]["land"],
        }))
      : source.items,
  };

  return (
    <Section tone="light" aria-labelledby="problems-heading">
      <SectionHeading
        id="problems-heading"
        eyebrow={content?.eyebrow ?? t("eyebrow")}
        title={data.heading}
        lede={data.lede}
      />

      <ol className="mt-14 grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 md:grid-cols-2" role="list">
        {data.items.map((item, index) => {
          const land = landBySlug.get(item.land);
          return (
            <li key={item.question} className="flex flex-col bg-white p-7 md:p-9">
              <span className="num text-[0.75rem] font-semibold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="display-3 mt-5 max-w-[26ch]">{item.question}</h3>
              <p className="mt-4 flex-1 text-[0.9375rem] leading-[1.9] text-steel-600">{item.answer}</p>
              {land ? (
                <p className="mt-6 border-t border-ink-950/10 pt-4">
                  <Link
                    href={`/services/${land.slug}`}
                    className="group inline-flex items-center gap-2 text-[0.875rem] font-semibold text-navy-800 underline-offset-[6px] hover:underline"
                    data-analytics="service_cta_click"
                    data-analytics-location="problems"
                  >
                    <span>
                      {t("relatedLand", { land: land.copy[locale].title })}
                    </span>
                    <ArrowRight />
                  </Link>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-12">
        <ButtonLink href="/services" variant="secondary" size="lg">
          <span>{content?.explore ?? t("explore")}</span>
          <ArrowRight />
        </ButtonLink>
      </div>
    </Section>
  );
}
