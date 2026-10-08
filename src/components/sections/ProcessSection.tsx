import { getTranslations } from "next-intl/server";
import { process } from "@/content/home";
import type { AppLocale } from "@/i18n/routing";
import { Section, SectionHeading } from "@/components/ui/Section";
import { quadPoints } from "@/lib/path";

/** Four stages, connected by the same path language used in the hero. */
export type ProcessContent = {
  eyebrow?: string; heading?: string; lede?: string;
  steps?: { label: string; body: string }[];
};

export async function ProcessSection({ locale, content }: { locale: AppLocale; content?: ProcessContent }) {
  const t = await getTranslations("home.process");
  const source = process[locale];
  const data = {
    heading: content?.heading ?? source.heading,
    lede: content?.lede ?? source.lede,
    steps: content?.steps?.length ? content.steps : source.steps,
  };

  const points = quadPoints({ x: 8, y: 14 }, { x: 500, y: 4 }, { x: 992, y: 16 }, data.steps.length);
  const pathD = `M 8 14 Q 500 4 992 16`;

  return (
    <Section tone="light" aria-labelledby="process-heading">
      <SectionHeading id="process-heading" eyebrow={content?.eyebrow ?? t("eyebrow")} title={data.heading} lede={data.lede} />

      <div className="mt-16">
        <svg
          viewBox="0 0 1000 30"
          preserveAspectRatio="none"
          className="hidden h-8 w-full md:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={pathD}
            stroke="var(--color-ink-950)"
            strokeOpacity="0.18"
            strokeWidth="1.4"
            className="draw-path"
            style={{ ["--path-len" as string]: "1000" }}
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--color-ice-400)"
              stroke="var(--color-ink-950)"
              strokeWidth="1.4"
            />
          ))}
        </svg>

        <ol className="grid gap-8 border-t border-ink-950/15 pt-8 md:grid-cols-4 md:gap-6" role="list">
          {data.steps.map((step, index) => (
            <li key={step.label} className="relative">
              <span className="num text-[0.75rem] font-semibold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="display-3 mt-4">{step.label}</h3>
              <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-[1.9] text-steel-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
