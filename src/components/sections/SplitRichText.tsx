import { Section } from "@/components/ui/Section";
import { LexicalParagraphs } from "@/components/blocks/LexicalParagraphs";

/**
 * SPLIT RICH TEXT — the heading-beside-copy layout the /about story ships (§5, §83).
 * Left: the section heading in the display face. Right: the paragraphs, one element each.
 */
export type SplitRichTextContent = { heading?: string; body?: unknown };

export function SplitRichText({
  content,
  headingId,
}: {
  content?: SplitRichTextContent;
  headingId?: string;
}) {
  return (
    <Section tone="white" aria-labelledby={headingId}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id={headingId} className="display-2 max-w-[20ch]">
            {content?.heading}
          </h2>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="flex flex-col gap-6">
            <LexicalParagraphs data={content?.body} className="text-[1rem] leading-[1.95] text-steel-600" />
          </div>
        </div>
      </div>
    </Section>
  );
}
