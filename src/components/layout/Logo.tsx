import { clsx } from "clsx";

type LogoProps = {
  /** Visual weight: `default` for light surfaces, `light` for dark surfaces. */
  variant?: "default" | "light";
  /** Height of the mark in px. The wordmark scales with it. */
  size?: number;
  className?: string;
  /** Show the typeset wordmark next to the mark (header use). */
  withWordmark?: boolean;
  wordmarkClassName?: string;
};

/**
 * The official mark is supplied as a single PNG lockup (mark + wordmark + tagline).
 * At header scale the lockup's wordmark and tagline become illegible, so the header
 * pairs the untouched mark with a typeset wordmark. The full lockup is used in the
 * footer and on printed/OG surfaces. The mark itself is never redrawn, recoloured
 * beyond a straight white knockout, or distorted.
 */
export function Logo({
  variant = "default",
  size = 36,
  className,
  withWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  const src = variant === "light" ? "/brand/seven-lands-mark-light.png" : "/brand/seven-lands-mark.png";

  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ height: size, width: "auto" }}
        className="block shrink-0 select-none"
        draggable={false}
        decoding="async"
      />
      {withWordmark ? (
        <span
          className={clsx(
            "latin font-bold leading-none tracking-[-0.02em]",
            variant === "light" ? "text-offwhite" : "text-ink-950",
            wordmarkClassName,
          )}
          style={{ fontSize: Math.max(15, size * 0.5) }}
          aria-hidden="true"
        >
          Seven Lands
        </span>
      ) : null}
      <span className="sr-only">Seven Lands — سفن لاند</span>
    </span>
  );
}
