import { Section } from "@/components/ui/Section";

/**
 * NOTE SECTION — heading beside a short honest note, in the compact band (used by /about's team
 * note, which states plainly that no names or photos are shown until they are approved).
 */
export type NoteSectionContent = { heading?: string; note?: string };

export function NoteSection({ content, headingId }: { content?: NoteSectionContent; headingId?: string }) {
  return (
    <Section tone="white" size="compact" aria-labelledby={headingId}>
      <div className="grid gap-6 border-t border-ink-950/15 pt-8 lg:grid-cols-12">
        <h2 id={headingId} className="display-3 lg:col-span-4">
          {content?.heading}
        </h2>
        <p className="text-[0.9375rem] leading-[1.9] text-steel-600 lg:col-span-7 lg:col-start-6">{content?.note}</p>
      </div>
    </Section>
  );
}
