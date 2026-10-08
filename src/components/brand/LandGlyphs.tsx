import { clsx } from "clsx";

/**
 * Seven art-directed glyphs for the seven capabilities.
 * Built on one shared grammar so the set reads as a system, not as seven pulled
 * icons: a 24×24 grid, 1.5px strokes, one open path + one node, a consistent
 * direction of travel (up and to the end-side), and no filled decoration.
 */

type GlyphProps = { className?: string; title?: string };

const frame = "h-6 w-6 shrink-0";

function Frame({
  children,
  className,
  title,
}: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx(frame, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** 01 Strategy — a plotted path turning a corner toward a marked target. */
function Strategy(props: GlyphProps) {
  return (
    <Frame {...props}>
      <path d="M3.5 19.5h17" strokeOpacity="0.45" />
      <path d="M3.5 19.5V4.5" strokeOpacity="0.45" />
      <path d="M5 16.5c2.6-.4 4.6-1.6 6-3.6 1.4-2 3.3-3.2 5.8-3.6" />
      <circle cx="18.4" cy="8" r="1.9" />
      <path d="M21 6.4 23 8l-2 1.6" strokeOpacity="0.55" />
    </Frame>
  );
}

/** 02 Branding — a mark inside a defined frame, with an orbit of recognition. */
function Branding(props: GlyphProps) {
  return (
    <Frame {...props}>
      <rect x="4" y="4" width="12" height="12" rx="2.4" />
      <path d="M8 8.5c2.2 1.1 3.9 2.9 5 5" />
      <path d="M12.6 15.4a6.6 6.6 0 0 0 7 1.1" strokeOpacity="0.55" />
      <circle cx="19.6" cy="15.6" r="1.3" />
    </Frame>
  );
}

/** 03 Content — frames of production feeding one signal outward. */
function Content(props: GlyphProps) {
  return (
    <Frame {...props}>
      <rect x="3.5" y="6.5" width="12" height="11" rx="2" />
      <path d="M6.5 10h6M6.5 13h4" strokeOpacity="0.6" />
      <path d="M15.5 12h3.2" />
      <path d="M17.4 9.6 20.5 12l-3.1 2.4" />
    </Frame>
  );
}

/** 04 Social — two voices in an exchange, one answering the other. */
function Social(props: GlyphProps) {
  return (
    <Frame {...props}>
      <path d="M4 6.5h9.5a2 2 0 0 1 2 2v3.2a2 2 0 0 1-2 2H8.4l-3.4 2.6V8.5a2 2 0 0 1 2-2Z" />
      <path d="M17.5 10.2h1a2 2 0 0 1 2 2v3.2a2 2 0 0 1-2 2h-.8v2.4l-3-2.4" strokeOpacity="0.55" />
    </Frame>
  );
}

/** 05 Performance — a rising set of steps with the measured point marked. */
function Performance(props: GlyphProps) {
  return (
    <Frame {...props}>
      <path d="M3.5 19.5h17" strokeOpacity="0.45" />
      <path d="M6 19.5v-4.2M10 19.5v-7M14 19.5v-9.6" strokeOpacity="0.7" />
      <path d="M16.6 12.4c1.2-1.6 2.4-3 3.9-4.2" />
      <path d="M17.4 8.3h3.4V11" />
      <circle cx="14" cy="9.9" r="1.2" strokeOpacity="0.6" />
    </Frame>
  );
}

/** 06 Web — a page frame with a structured layout and a conversion node. */
function Web(props: GlyphProps) {
  return (
    <Frame {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
      <path d="M3 8.5h18" strokeOpacity="0.5" />
      <circle cx="5.6" cy="6.5" r="0.5" fill="currentColor" />
      <path d="M6 12.5h6.5M6 15.8h4" strokeOpacity="0.65" />
      <path d="M15.4 15.9h3.8" />
      <circle cx="17.3" cy="12.4" r="1.4" />
    </Frame>
  );
}

/** 07 Technology — connected systems: two nodes, one integration line. */
function Technology(props: GlyphProps) {
  return (
    <Frame {...props}>
      <rect x="3.5" y="4.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="12.5" width="7" height="7" rx="1.8" />
      <path d="M10.5 8h2.6a2 2 0 0 1 2 2v2.5" />
      <path d="M14.2 11.6 15.1 13l1.5-.6" strokeOpacity="0.7" />
      <path d="M6.8 11.5v3.2a2 2 0 0 0 2 2h2.4" strokeOpacity="0.5" />
    </Frame>
  );
}

const glyphs: Record<string, (props: GlyphProps) => React.ReactElement> = {
  strategy: Strategy,
  branding: Branding,
  content: Content,
  social: Social,
  performance: Performance,
  web: Web,
  technology: Technology,
};

export function LandGlyph({
  glyph,
  className,
  title,
}: {
  glyph: string;
  className?: string;
  title?: string;
}) {
  const Component = glyphs[glyph] ?? Strategy;
  return <Component className={className} title={title} />;
}
