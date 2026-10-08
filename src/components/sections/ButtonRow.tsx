import { ButtonAnchor, ButtonLink, ArrowRight } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

/**
 * BUTTON ROW — two approved destinations side by side, in the compact band.
 * Destinations are already resolved by the shared CTA contract (§28): internal pages, https,
 * WhatsApp, phone or email only. Nothing else is renderable here.
 */
export type ButtonRowCta = { href: string; label: string; external?: boolean; newTab?: boolean };
export type ButtonRowContent = { primary?: ButtonRowCta; secondary?: ButtonRowCta };

export function ButtonRow({ content }: { content?: ButtonRowContent }) {
  const { primary, secondary } = content ?? {};
  if (!primary && !secondary) return null;

  const button = (cta: ButtonRowCta, variant: "primary" | "secondary") => {
    const label = (
      <>
        <span>{cta.label}</span>
        <ArrowRight />
      </>
    );
    if (cta.external) {
      return (
        <ButtonAnchor
          key={variant}
          href={cta.href}
          target={cta.newTab === false ? undefined : "_blank"}
          rel="noopener noreferrer"
          size="lg"
          variant={variant}
        >
          {label}
        </ButtonAnchor>
      );
    }
    return (
      <ButtonLink key={variant} href={cta.href} size="lg" variant={variant}>
        {label}
      </ButtonLink>
    );
  };

  return (
    <Section tone="light" size="compact">
      <div className="flex flex-wrap items-center gap-4">
        {secondary ? button(secondary, "secondary") : null}
        {primary ? button(primary, "primary") : null}
      </div>
    </Section>
  );
}
