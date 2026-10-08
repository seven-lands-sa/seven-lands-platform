import { getTranslations } from "next-intl/server";
import { positioning } from "@/content/home";
import type { AppLocale } from "@/i18n/routing";

/**
 * TRUST AREA — honest substitute.
 * No client logos, counters, certifications or partnerships have been confirmed,
 * so instead of inventing proof this section states the working model plainly and
 * explains why unverified proof is not shown.
 */
export type TrustStatementContent = {
  heading?: string; body?: string; note?: string;
  facts?: { label: string; value: string }[];
};

export async function TrustStatement({ locale, content }: { locale: AppLocale; content?: TrustStatementContent }) {
  const t = await getTranslations("home.trust");
  const source = positioning[locale];
  const data = {
    heading: content?.heading ?? source.heading,
    body: content?.body ?? source.body,
    facts: content?.facts?.length ? content.facts : source.facts,
  };
  const note = content?.note ?? t("note");

  return (
    <section className="border-y border-ink-950/10 bg-white py-12 lg:py-16" aria-label={content?.heading ?? t("heading")}>
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <h2 className="display-3">{data.heading}</h2>
            <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{data.body}</p>
            <p className="mt-5 border-s-2 border-ice-400 ps-4 text-[0.8125rem] leading-relaxed text-muted">
              {note}
            </p>
          </div>

          <dl className="grid gap-6 md:col-span-8 md:grid-cols-3 md:gap-8">
            {data.facts.map((fact, index) => (
              <div key={fact.label} className="border-t border-ink-950/12 pt-4">
                <dt className="flex items-center gap-2 text-[0.75rem] font-semibold text-muted">
                  <span className="num">0{index + 1}</span>
                  <span>{fact.label}</span>
                </dt>
                <dd className="mt-3 text-[1.0625rem] font-semibold leading-snug text-ink-950">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
