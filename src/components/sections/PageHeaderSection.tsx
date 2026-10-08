import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PathArt } from "@/components/brand/PathArt";

/**
 * PAGE HEADER — the shared top-of-page block (§5, §83).
 *
 * The three presentations below are the three that already ship, taken from the real pages rather
 * than invented: /contact (`default`), /start-a-project (`wide`) and /about (`withArt`). They differ
 * in the one thing that genuinely differs in the design — how wide the headline column may run, and
 * whether the dark brand-path card sits beside it. Nothing here is a style knob an editor can set.
 *
 * The breadcrumb link is navigation chrome (label from the translation catalogue), not editorial
 * content: it always works and can never be broken by an edit.
 */
export type PageHeaderContent = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  support?: string;
};

export type PageHeaderVariant = "default" | "wide" | "withArt";

const VARIANT: Record<PageHeaderVariant, { title: string; lede: string; section: string; wrap: string; art: boolean }> = {
  default: {
    title: "display-1 mt-6 max-w-[18ch]",
    lede: "lede measure mt-6 text-[1.0625rem]",
    section: "bg-offwhite pt-12 pb-16 lg:pt-16 lg:pb-24",
    wrap: "grid gap-12 lg:grid-cols-12 lg:gap-10",
    art: false,
  },
  wide: {
    title: "display-1 mt-6 max-w-[22ch]",
    lede: "lede measure mt-6 text-[1.0625rem]",
    section: "bg-offwhite pt-12 pb-16 lg:pt-16 lg:pb-24",
    wrap: "grid gap-12 lg:grid-cols-12 lg:gap-10",
    art: false,
  },
  withArt: {
    title: "display-1 mt-6 max-w-[28ch]",
    lede: "lede measure mt-7 text-[1.0625rem]",
    section: "border-b border-ink-950/10 bg-offwhite pt-12 pb-14 lg:pt-16 lg:pb-20",
    wrap: "grid items-center gap-12 lg:grid-cols-12",
    art: true,
  },
};

export async function PageHeaderSection({
  content,
  variant = "default",
  headingId,
}: {
  content?: PageHeaderContent;
  variant?: PageHeaderVariant;
  headingId?: string;
}) {
  const tCta = await getTranslations("cta");
  const view = VARIANT[variant];

  return (
    <section className={view.section}>
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/"
            className="text-[0.8125rem] text-muted transition-colors duration-200 hover:text-ink-950"
          >
            {tCta("backHome")}
          </Link>
        </nav>

        <div className={view.wrap}>
          <div className="lg:col-span-7">
            <p className="eyebrow">{content?.eyebrow}</p>
            <h1 id={headingId} className={view.title}>
              {content?.title}
            </h1>
            {content?.lede ? <p className={view.lede}>{content.lede}</p> : null}
            {content?.support ? (
              <p className="mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.9] text-steel-600">{content.support}</p>
            ) : null}
          </div>

          {view.art ? (
            <div className="lg:col-span-4 lg:col-start-9">
              <div className="on-dark rounded-[1.25rem] bg-ink-950 p-6">
                <PathArt variant="dark" animate={false} className="max-h-64" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
