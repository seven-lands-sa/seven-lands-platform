import { Fragment, type ReactNode } from "react";

/**
 * Minimal Lexical renderer for inline prose (§12).
 *
 * Why not the stock converter: our legal copy renders inside a paragraph that the shipped design
 * already styles (`<p className="mt-4 max-w-[70ch] …">`), so a renderer that emitted its own
 * wrapper element would change the markup and the visual result. This one emits inline content
 * only — the surrounding element stays exactly the one from the design.
 *
 * Marks/links are rendered, not dropped: bold, italic, underline and internal/external links keep
 * their meaning (unknown node types fall back to their text, never to an empty string, so nothing
 * the editor typed can silently disappear).
 *
 * Paragraphs after the first are separated by a line break inside the same paragraph — matching how
 * the multi-paragraph legal copy looked before the CMS. Richer block-level content within a legal
 * body is out of the current variant set on purpose (§2: the frontend owns layout).
 */

type LexicalNode = {
  type?: string;
  text?: string;
  format?: number | string;
  url?: string;
  newTab?: boolean;
  fields?: { url?: string; newTab?: boolean } | null;
  children?: LexicalNode[];
};

const FORMAT = { bold: 1, italic: 2, underline: 8 } as const;

const hasBit = (format: number | string | undefined, bit: number): boolean =>
  typeof format === "number" ? (format & bit) !== 0 : false;

/** Only http(s) and same-origin paths may become links on a public page. */
const safeHref = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

function inline(nodes: LexicalNode[] | undefined, keyPrefix: string): ReactNode[] {
  if (!nodes?.length) return [];
  return nodes.flatMap((node, index): ReactNode[] => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "linebreak") return [<br key={key} />];
    if (node.type === "link") {
      const href = safeHref(node.fields?.url ?? node.url);
      const children = inline(node.children, `${key}-in`);
      if (!href) return children;
      const newTab = Boolean(node.fields?.newTab ?? node.newTab);
      return [
        <a key={key} href={href} className="underline underline-offset-4" rel={newTab ? "noreferrer" : undefined}>
          {children}
        </a>,
      ];
    }

    const children = node.children?.length ? inline(node.children, `${key}-in`) : node.text ?? null;
    if (node.type === "text") {
      let content: ReactNode = node.text ?? "";
      if (hasBit(node.format, FORMAT.bold)) content = <strong key={`${key}-b`}>{content}</strong>;
      if (hasBit(node.format, FORMAT.italic)) content = <em key={`${key}-i`}>{content}</em>;
      if (hasBit(node.format, FORMAT.underline)) content = <u key={`${key}-u`}>{content}</u>;
      return [<Fragment key={key}>{content}</Fragment>];
    }
    return [<Fragment key={key}>{children}</Fragment>];
  });
}

export function LexicalBody({ data }: { data: unknown }) {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root;
  const paragraphs = (root?.children ?? []).filter((node) => node.type === "paragraph" || node.type === "heading");

  if (paragraphs.length === 0) {
    /* An empty rich-text body renders nothing rather than an empty element — the publish validator
       is what refuses an incomplete legal section, not the renderer. */
    return null;
  }

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <Fragment key={paragraph.type === "heading" ? "h" : "p"}>
          {index > 0 ? <br /> : null}
          {inline(paragraph.children, `p${index}`)}
        </Fragment>
      ))}
    </>
  );
}
