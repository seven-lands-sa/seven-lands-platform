/**
 * THE BLOCK RENDERER — CMS data in, the existing design system out (§5, §83).
 *
 * The public components are the same ones the static pages use; the renderer only turns stored
 * block data into their typed view models. No new markup is designed here, no CSS is generated,
 * and no block can invent a layout: every branch below maps to a component that already shipped.
 *
 * A block type without a renderer is refused at publication time (see `rendered` in the registry),
 * so an editor can never publish a section that would silently disappear.
 */
import type { AppLocale } from "@/i18n/routing";
import { getSiteIdentity } from "@/lib/content";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Hero, type HeroCta } from "@/components/sections/Hero";
import { TrustStatement } from "@/components/sections/TrustStatement";
import { LandsSystem } from "@/components/sections/LandsSystem";
import { Problems } from "@/components/sections/Problems";
import { WorkTeaser } from "@/components/sections/WorkTeaser";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { WhySection } from "@/components/sections/WhySection";
import { FinalCta } from "@/components/sections/FinalCta";
import { LegalPage } from "@/components/sections/LegalPage";
import { LexicalBody } from "@/components/blocks/LexicalBody";
import { PageHeaderSection } from "@/components/sections/PageHeaderSection";
import { SplitRichText } from "@/components/sections/SplitRichText";
import { ServicesIndex } from "@/components/sections/ServicesIndex";
import { OperationsSection } from "@/components/sections/OperationsSection";
import { NoteSection } from "@/components/sections/NoteSection";
import { ButtonRow } from "@/components/sections/ButtonRow";
import { ContactPanel } from "@/components/sections/ContactPanel";
import { BriefFormSection } from "@/components/sections/BriefFormSection";
import { CONTENT_UPDATED_AT } from "@/content/site";
import type { BlockData, PublicPage } from "@/lib/pages/adapter";
import { resolveCta } from "@/lib/pages/links";

type RenderContext = {
  locale: AppLocale;
  page: PublicPage;
  hrefs: { whatsappHref: string | null; phoneHref: string | null; emailHref: string | null };
};

type SectionLike = { label?: { ar: string; en: string } | string; enabled?: boolean; localeVisibility?: string };

const str = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value;
  return undefined;
};

const rows = <T,>(value: unknown): T[] | undefined => (Array.isArray(value) ? (value as T[]) : undefined);

/** Resolves a stored CTA group into the button the design expects, or nothing at all. */
function ctaFor(
  block: BlockData,
  key: "primary" | "secondary" | "cta" | "asideProjectCta",
  ctx: RenderContext,
): HeroCta | undefined {
  const raw = block[key];
  if (!raw || typeof raw !== "object") return undefined;
  const group = raw as Record<string, unknown>;
  const resolved = resolveCta(group as never, {
    pagePaths: ctx.page.pagePaths,
    whatsappHref: ctx.hrefs.whatsappHref,
    phoneHref: ctx.hrefs.phoneHref,
    emailHref: ctx.hrefs.emailHref,
  });
  if (!resolved) return undefined;
  const label = str(group.label);
  if (!label) return undefined;
  return { href: resolved.href, label, external: resolved.external, newTab: resolved.newTab };
}

/** WhatsApp CTA labels for the whatsapp-kind links the design renders inline. */
const whatsappLabel = (block: BlockData, key: "primary" | "secondary"): string | undefined => {
  const raw = block[key];
  if (!raw || typeof raw !== "object") return undefined;
  return str((raw as Record<string, unknown>).label);
};

export async function PageBlocks({ page, locale }: { page: PublicPage; locale: AppLocale }) {
  const identity = await getSiteIdentity(locale);
  const ctx: RenderContext = {
    locale,
    page,
    hrefs: {
      whatsappHref: identity.whatsapp.href ?? null,
      phoneHref: identity.phone.href ?? null,
      emailHref: typeof identity.email === "string" ? `mailto:${identity.email}` : null,
    },
  };

  return (
    <>
      {page.blocks.map((block, index) => {
        const key = `${block.blockType}-${block.id ?? index}`;
        /* Heading ids are derived from the stored block id, so two blocks of the same type on one
           page can never publish duplicate ids (an a11y defect the static pages could not have). */
        const headingId = `sl-${block.blockType}-${String(block.id ?? index)}`;
        switch (block.blockType) {
          case "hero": {
            const primary = ctaFor(block, "primary", ctx);
            const secondary = ctaFor(block, "secondary", ctx);
            return (
              <Hero
                key={key}
                content={{
                  eyebrow: str(block.eyebrow),
                  title1: str(block.title1),
                  title2: str(block.title2),
                  titleAccent: str(block.titleAccent),
                  support: str(block.support),
                  whatsappLine: str(block.whatsappLine),
                  pathCaption: str(block.pathCaption),
                  primary,
                  secondary,
                }}
              />
            );
          }
          case "trustStatement":
            return (
              <TrustStatement
                key={key}
                locale={locale}
                content={{
                  heading: str(block.heading),
                  body: str(block.body),
                  note: str(block.note),
                  facts: rows<{ label?: string; value?: string }>(block.facts)
                    ?.filter((row) => row?.label && row?.value)
                    .map((row) => ({ label: String(row.label), value: String(row.value) })),
                }}
              />
            );
          case "landsSystem":
            return (
              <Section key={key} tone="light" aria-labelledby="lands-heading">
                <SectionHeading
                  id="lands-heading"
                  eyebrow={str(block.eyebrow)}
                  title={str(block.heading)}
                  lede={str(block.lede)}
                />
                <div className="mt-14" data-reveal>
                  <LandsSystem />
                </div>
              </Section>
            );
          case "problems":
            return (
              <Problems
                key={key}
                locale={locale}
                content={{
                  eyebrow: str(block.eyebrow),
                  heading: str(block.heading),
                  lede: str(block.lede),
                  explore: str(block.explore),
                  items: rows<{ question?: string; answer?: string; land?: string }>(block.items)
                    ?.filter((row) => row?.question && row?.answer)
                    .map((row) => ({ question: String(row.question), answer: String(row.answer), land: row.land })),
                }}
              />
            );
          case "process":
            return (
              <ProcessSection
                key={key}
                locale={locale}
                content={{
                  eyebrow: str(block.eyebrow),
                  heading: str(block.heading),
                  lede: str(block.lede),
                  steps: rows<{ label?: string; body?: string }>(block.steps)
                    ?.filter((row) => row?.label && row?.body)
                    .map((row) => ({ label: String(row.label), body: String(row.body) })),
                }}
              />
            );
          case "why":
            return (
              <WhySection
                key={key}
                locale={locale}
                content={{
                  eyebrow: str(block.eyebrow),
                  heading: str(block.heading),
                  lede: str(block.lede),
                  items: rows<{ title?: string; body?: string }>(block.items)
                    ?.filter((row) => row?.title && row?.body)
                    .map((row) => ({ title: String(row.title), body: String(row.body) })),
                }}
              />
            );
          case "workTeaser":
            return (
              <WorkTeaser
                key={key}
                locale={locale}
                content={{
                  eyebrow: str(block.eyebrow),
                  selected: str(block.selected),
                  allWork: str(block.allWork),
                  workPage: str(block.workPage),
                  emptyTitle: str(block.emptyTitle),
                  emptyBody: str(block.emptyBody),
                  emptyPoints: rows<{ text?: string }>(block.emptyPoints)
                    ?.map((row) => str(row?.text))
                    .filter((value): value is string => Boolean(value)),
                }}
              />
            );
          case "legalDocument":
            return (
              <LegalPage
                key={key}
                updatedAt={CONTENT_UPDATED_AT}
                content={{
                  title: ctx.page.title,
                  intro: str(block.intro) ?? "",
                  draftNotice: str(block.draftNotice) ?? "",
                  lastUpdatedLabel: str(block.lastUpdatedLabel) ?? "",
                  sections:
                    rows<{ title?: unknown; body?: unknown }>(block.sections)?.map((section) => ({
                      title: str(section.title) ?? "",
                      body: <LexicalBody data={section.body} />,
                    })) ?? [],
                }}
              />
            );
          case "cta": {
            const primary = ctaFor(block, "primary", ctx);
            const whatsapp = whatsappLabel(block, "secondary");
            return (
              <FinalCta
                key={key}
                content={{
                  eyebrow: str(block.eyebrow),
                  heading1: str(block.heading1),
                  heading2: str(block.heading2),
                  body: str(block.body),
                  primary,
                  secondaryLabel: whatsapp,
                }}
              />
            );
          }
          case "pageHeader":
            return (
              <PageHeaderSection
                key={key}
                variant={(str(block.variant) as "default" | "wide" | "withArt") ?? "default"}
                headingId={headingId}
                content={{
                  eyebrow: str(block.eyebrow),
                  title: str(block.title),
                  lede: str(block.lede),
                  support: str(block.support),
                }}
              />
            );
          case "richText":
            return (
              <SplitRichText
                key={key}
                headingId={headingId}
                content={{ heading: str(block.heading), body: block.body }}
              />
            );
          case "servicesTeaser":
            return (
              <ServicesIndex
                key={key}
                locale={locale}
                headingId={headingId}
                content={{ eyebrow: str(block.eyebrow), heading: str(block.heading), lede: str(block.lede) }}
              />
            );
          case "operations":
            return (
              <OperationsSection
                key={key}
                locale={locale}
                headingId={headingId}
                content={{
                  heading: str(block.heading),
                  steps: rows<{ label?: string; body?: string }>(block.steps)
                    ?.filter((row) => row?.label && row?.body)
                    .map((row) => ({ label: String(row.label), body: String(row.body) })),
                  facts: rows<{ label?: string; value?: string }>(block.facts)
                    ?.filter((row) => row?.label && row?.value)
                    .map((row) => ({ label: String(row.label), value: String(row.value) })),
                  locationHeading: str(block.locationHeading),
                  locationBody: str(block.locationBody),
                }}
              />
            );
          case "noteSection":
            return (
              <NoteSection
                key={key}
                headingId={headingId}
                content={{ heading: str(block.heading), note: str(block.note) }}
              />
            );
          case "buttonRow":
            return (
              <ButtonRow
                key={key}
                content={{
                  primary: ctaFor(block, "primary", ctx),
                  secondary: ctaFor(block, "secondary", ctx),
                }}
              />
            );
          case "contactPanel":
            return (
              <ContactPanel
                key={key}
                locale={locale}
                headingId={headingId}
                content={{
                  eyebrow: str(block.eyebrow),
                  title: str(block.title),
                  lede: str(block.lede),
                  channelsHeading: str(block.channelsHeading),
                  formHeading: str(block.formHeading),
                  formHelp: str(block.formHelp),
                  asideProjectHeading: str(block.asideProjectHeading),
                  asideProjectBody: str(block.asideProjectBody),
                  asideProjectCta: ctaFor(block, "asideProjectCta", ctx),
                  asideDirectionsHeading: str(block.asideDirectionsHeading),
                  asideDirectionsBody: str(block.asideDirectionsBody),
                }}
              />
            );
          case "briefForm":
            return (
              <BriefFormSection
                key={key}
                locale={locale}
                headingId={headingId}
                content={{
                  eyebrow: str(block.eyebrow),
                  title: str(block.title),
                  lede: str(block.lede),
                  asideHeading: str(block.asideHeading),
                  asidePoints: rows<{ text?: string }>(block.asidePoints)
                    ?.map((row) => str(row?.text))
                    .filter((value): value is string => Boolean(value)),
                  asideNote: str(block.asideNote),
                }}
              />
            );
          default:
            /* Unreachable for published content: the validator refuses block types without a
               renderer, so this cannot silently drop a section a visitor should have seen. */
            return null;
        }
      })}
    </>
  );
}

export type { SectionLike };
