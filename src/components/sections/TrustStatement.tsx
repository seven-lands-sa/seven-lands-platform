import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { positioning } from "@/content/home";
import type { AppLocale } from "@/i18n/routing";

/**
 * TRUST AREA — honest, premium substitute.
 * Demonstrates the verified operating model with authentic executive photography
 * from Seven Lands' Riyadh presence.
 */
export type TrustStatementContent = {
  heading?: string; body?: string; note?: string;
  facts?: { label: string; value: string }[];
};

export async function TrustStatement({ locale, content }: { locale: AppLocale; content?: TrustStatementContent }) {
  const t = await getTranslations("home.trust");
  const source = positioning[locale];
  const isAr = locale === "ar";
  const data = {
    heading: content?.heading ?? source.heading,
    body: content?.body ?? source.body,
    facts: content?.facts?.length ? content.facts : source.facts,
  };
  const note = content?.note ?? t("note");

  return (
    <section className="border-y border-ink-950/10 bg-white py-12 lg:py-16" aria-label={content?.heading ?? t("heading")}>
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="display-3">{data.heading}</h2>
            <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{data.body}</p>
            <p className="mt-5 border-s-2 border-ice-400 ps-4 text-[0.8125rem] leading-relaxed text-muted">
              {note}
            </p>

            <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-ink-950/12 bg-offwhite shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="/media/editorial/riyadh-consultation-space.webp"
                  alt={isAr ? "مساحة الاستشارات التنفيذية والنمو — سفن لاند الرياض" : "Executive Consultation & Advisory Space — Seven Lands Riyadh"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between text-white">
                  <span className="text-[0.75rem] font-bold">
                    {isAr ? "جلسات التخطيط والاستشارات التنفيذية" : "Executive Strategic Advisory"}
                  </span>
                  <span className="text-[0.6875rem] font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                    {isAr ? "الرياض" : "Riyadh"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <dl className="grid gap-4 sm:grid-cols-3">
              {data.facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className="rounded-[1.25rem] border border-ink-950/10 bg-offwhite/70 p-5 transition-all duration-200 hover:border-ink-950/25 hover:bg-offwhite"
                >
                  <dt className="flex items-center justify-between text-[0.75rem] font-semibold text-muted">
                    <span>{fact.label}</span>
                    <span className="num font-bold text-ice-400">0{index + 1}</span>
                  </dt>
                  <dd className="mt-4 text-[1.125rem] font-bold leading-snug text-ink-950">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-[1.25rem] border border-ink-950/8 bg-offwhite/40 p-5 text-[0.8125rem] text-steel-600 leading-relaxed">
              <span className="font-bold text-ink-950 block mb-1">
                {isAr ? "المعايير المعتمدة في سفن لاند:" : "Seven Lands Core Standards:"}
              </span>
              {isAr
                ? "فريق عمل استشاري وتقني مقيم في الرياض، إدارة مباشرة للمشاريع بدون وسطاء، وشفافية مطلقة في مؤشرات الأداء وعوائد الاستثمار."
                : "Resident advisory and engineering teams in Riyadh, direct mandate management without middlemen, and absolute transparency in KPIs and ROI."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
