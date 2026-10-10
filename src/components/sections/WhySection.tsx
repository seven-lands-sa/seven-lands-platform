import Image from "next/image";
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
  const isAr = locale === "ar";
  const data = {
    heading: content?.heading ?? source.heading,
    lede: content?.lede ?? source.lede,
    items: content?.items?.length ? content.items : source.items,
  };

  return (
    <Section tone="white" aria-labelledby="why-heading">
      <SectionHeading id="why-heading" eyebrow={content?.eyebrow ?? t("eyebrow")} title={data.heading} lede={data.lede} />

      {/* Workshop Studio Visual Spotlight */}
      <div className="mt-12 overflow-hidden rounded-[1.5rem] border border-ink-950/12 bg-offwhite shadow-sm">
        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full lg:col-span-5 overflow-hidden">
            <Image
              src="/media/editorial/studio-discovery-workshop.webp"
              alt={isAr ? "ورشة الاستكشاف والتخطيط الإبداعي — استوديو سفن لاند الرياض" : "Discovery & Strategy Workshop — Seven Lands Studio Riyadh"}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-ink-950/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 start-4 text-[0.75rem] font-bold text-white bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
              {isAr ? "استوديو ورش العمل والنمو · الرياض" : "Strategy & Discovery Studio · Riyadh"}
            </span>
          </div>
          <div className="p-6 lg:p-8 lg:col-span-7 flex flex-col justify-center">
            <span className="eyebrow text-steel-600 mb-2">
              {isAr ? "فلسفة العمل المشترك" : "Collaborative Operating Model"}
            </span>
            <blockquote className="text-[1.0625rem] md:text-[1.125rem] font-semibold text-ink-950 leading-relaxed">
              {isAr
                ? "«النمو الحقيقي ليس حملات معزولة أو أفكاراً عابرة، بل منظومة واحدة متماسكة تبدأ من وضوح الاستراتيجية وتصل إلى عمق التنفيذ البرمجي.»"
                : "\"Authentic growth is never disconnected campaigns. It is a cohesive operating system from clear strategy through deep software engineering.\""}
            </blockquote>
            <p className="mt-3 text-[0.8125rem] text-muted">
              {isAr ? "— نموذج العمل المعتمد في مجالات سفن لاند الـ 7" : "— Seven Lands Operating Architecture"}
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2" role="list">
        {data.items.map((item, index) => (
          <li
            key={item.title}
            className="group rounded-[1.25rem] border border-ink-950/10 bg-offwhite/50 p-6 transition-all duration-200 hover:border-ink-950/25 hover:bg-offwhite"
          >
            <div className="flex items-center justify-between pb-3 border-b border-ink-950/8">
              <span className="num text-[0.75rem] font-bold text-ice-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-ink-950/20 group-hover:bg-ice-400 transition-colors" />
            </div>
            <h3 className="text-[1.125rem] font-bold text-ink-950 mt-4">{item.title}</h3>
            <p className="mt-3 text-[0.9375rem] leading-[1.9] text-steel-600">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
