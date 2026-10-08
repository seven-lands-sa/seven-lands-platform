import { Fragment, type ReactNode } from "react";

/**
 * LEXICAL → PARAGRAPHS.
 *
 * `LexicalBody` renders the inline flow used inside legal sections (one block, no wrapper). Story
 * and article copy needs real block-level paragraphs instead, so this helper walks the same lexical
 * document and emits one element per paragraph. Both read the exact same stored JSON — no copy is
 * retyped and no HTML is trusted from the database.
 *
 * Only the node types the Payload editor can produce for body copy are handled: paragraphs, text,
 * line breaks, links, and bold/italic emphasis. An unknown node is rendered as its children rather
 * than dropped, so an editor's words can never silently disappear.
 */
type LexicalNode = {
  type?: string;
  text?: string;
  format?: number;
  url?: string;
  tag?: string;
  listType?: string;
  children?: LexicalNode[];
};

const safeHref = (url: unknown): string | null => {
  if (typeof url !== "string") return null;
  const value = url.trim();
  if (value.startsWith("/") || value.startsWith("#")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
};

function inline(nodes: LexicalNode[] | undefined, keyPrefix: string): ReactNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "text") {
      let element: ReactNode = node.text ?? "";
      const format = node.format ?? 0;
      if (format & 1) element = <strong key={`${key}-b`}>{element}</strong>;
      if (format & 2) element = <em key={`${key}-i`}>{element}</em>;
      return <Fragment key={key}>{element}</Fragment>;
    }
    if (node.type === "link") {
      const href = safeHref(node.url);
      const children = inline(node.children, key);
      if (!href) return <Fragment key={key}>{children}</Fragment>;
      const external = !href.startsWith("/") && !href.startsWith("#");
      return (
        <a
          key={key}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-navy-800 underline underline-offset-[6px]"
        >
          {children}
        </a>
      );
    }
    if (node.type === "linebreak") return <br key={key} />;
    return <Fragment key={key}>{inline(node.children, key)}</Fragment>;
  });
}

/** One `<p>` per paragraph, with the caller's own typography class. */
export function LexicalParagraphs({ data, className }: { data: unknown; className?: string }) {
  const root = (data as { root?: { children?: LexicalNode[] } } | null | undefined)?.root;
  const paragraphs = (root?.children ?? []).filter((node) => node.type === "paragraph");
  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={className}>
          {inline(paragraph.children, `p${index}`)}
        </p>
      ))}
    </>
  );
}
