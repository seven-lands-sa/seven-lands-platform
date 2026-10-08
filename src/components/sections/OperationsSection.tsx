import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { PinIcon } from "@/components/ui/Button";

/**
 * OPERATIONS — "how we work" beside the working facts and the location card (§5, §83).
 *
 * This is the /about layout exactly: a vertical numbered method on the left, the three working facts
 * and the location card on the right. The location line is NOT editorial content — it renders the
 * address and Maps link from the site settings (Phase C authority), so an editor can never introduce
 * a second, conflicting address.
 */
export type OperationsContent = {
  heading?: string;
  steps?: { label: string; body: string }[];
  facts?: { label: string; value: string }[];
  locationHeading?: string;
  locationBody?: string;
};

export async function OperationsSection({
  locale,
  content,
  headingId,
}: {
  locale: AppLocale;
  content?: OperationsContent;
  headingId?: string;
}) {
  const identity = await getSiteIdentity(locale);
  const steps = content?.steps ?? [];
  const facts = content?.facts ?? [];

  return (
    <Section tone="light" aria-labelledby={headingId}>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 id={headingId} className="display-2 max-w-[22ch]">
            {content?.heading}
          </h2>
          <ol className="mt-8 flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10" role="list">
            {steps.map((step, index) => (
              <li key={step.label} className="flex gap-5 py-5">
                <span className="num text-[0.75rem] font-semibold text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[1.0625rem] font-bold">{step.label}</h3>
                  <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-[1.9] text-steel-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <dl className="flex flex-col divide-y divide-ink-950/10 border-y border-ink-950/10">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-2 py-5">
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="text-[0.9375rem] leading-[1.9] text-steel-600">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-[1.25rem] border border-ink-950/12 bg-white p-6">
            <h3 className="display-3">{content?.locationHeading}</h3>
            <p className="mt-4 text-[0.9375rem] leading-[1.9] text-steel-600">{content?.locationBody}</p>
            {identity.location.mapsUrl && identity.location.display ? (
              <a
                href={identity.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="maps_click"
                data-analytics-location="about"
                className="mt-5 inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-navy-800 underline-offset-[6px] hover:underline"
              >
                <PinIcon />
                <span>{identity.location.display}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
