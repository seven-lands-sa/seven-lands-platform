import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";
type Size = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2.5 rounded-[12px] font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] active:translate-y-px disabled:opacity-55 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink-950 text-offwhite hover:bg-navy-800 border border-ink-950 hover:border-navy-800",
  secondary:
    "border border-ink-950/25 text-ink-950 hover:border-ink-950/60 hover:bg-ink-950/[0.04] bg-transparent",
  ghost: "text-ink-950 hover:text-navy-800 underline-offset-4 hover:underline px-0",
  whatsapp:
    "border border-ink-950/20 text-ink-950 hover:border-ink-950/50 hover:bg-ink-950/[0.04] bg-transparent",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[3.25rem] px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

/** Internal link button. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

/** External link button (WhatsApp, phone, Maps). */
export function ButtonAnchor({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"a">) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

/** Small right-directional arrow that nudges on hover (semantic: forward). */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn(
        "h-[1.05em] w-[1.05em] shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 rtl:-scale-x-100",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11" />
      <path d="M10.5 4.8 15.7 10l-5.2 5.2" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[1.15em] w-[1.15em]", className)} fill="currentColor">
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.9 9.9 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm0 1.8c2.15 0 4.17.84 5.69 2.36a8 8 0 0 1 2.36 5.68c0 4.44-3.61 8.04-8.05 8.04a8.1 8.1 0 0 1-4.1-1.12l-.3-.18-3.05.8.81-2.98-.2-.31a8.02 8.02 0 0 1-1.24-4.25c0-4.44 3.62-8.04 8.08-8.04Zm-3.6 3.9c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.02 2.6c.13.16 1.75 2.8 4.3 3.8 2.12.84 2.55.67 3.01.63.46-.05 1.5-.62 1.71-1.21.21-.6.21-1.1.15-1.21-.06-.11-.23-.18-.48-.3-.25-.13-1.5-.75-1.73-.83-.23-.09-.4-.13-.57.12-.17.25-.66.86-.81 1.03-.15.17-.3.19-.55.06-.25-.12-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.38-.78-1.88-.19-.44-.38-.38-.53-.39h-.49Z" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[1.05em] w-[1.05em]", className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5h2.2l1.4 3.4-1.7 1.2a11 11 0 0 0 5.5 5.5l1.2-1.7 3.4 1.4v2.2c0 1.4-1.2 2.5-2.6 2.3C9.4 16.7 4.3 11.6 3.2 5.1 3 3.7 4.1 3.5 5.4 3.5Z" />
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[1.05em] w-[1.05em]", className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </svg>
  );
}
