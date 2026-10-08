import { getTranslations } from "next-intl/server";
import { principles } from "@/content/home";
import type { AppLocale } from "@/i18n/routing";
import { Section, SectionHeading } from "@/components/ui/Section";

export type WhyContent = {
  eyebrow?: string; heading?: string; lede?: string;
  items?: { title: string; body: string }[];
};

export async function WhySection({ locale, content }: { locale: AppLocale; content?: WhyContent }) {
  const t = await getTranslations("home.why");
  const source = principles[locale];
  const data = {
    heading: content?.heading ?? source.heading,
    lede: content?.lede ?? source.lede,
    items: content?.items?.length ? content.items : source.items,
  };

  return (
    <Section tone="white" aria-labelledby="why-heading">
      <SectionHeading id="why-heading" eyebrow={content?.eyebrow ?? t("eyebrow")} title={data.heading} lede={data.lede} />

      <ul className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2" role="list">
        {data.items.map((item, index) => (
          <li key={item.title} className="grid gap-4 border-t border-ink-950/15 pt-6 sm:grid-cols-[auto_1fr] sm:gap-6">
            <span className="num text-[0.75rem] font-semibold text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-[1.125rem] font-bold">{item.title}</h3>
              <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
