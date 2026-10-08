"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ArrowRight, ButtonAnchor, ButtonLink, PhoneIcon, WhatsAppIcon } from "@/components/ui/Button";

type NavItem = { href: string; label: string; external?: boolean };

/**
 * Mobile navigation drawer.
 *
 * Rendered through a portal into <body>. This is not decoration: the header uses
 * `backdrop-filter`, which makes it a containing block for fixed-position children,
 * so a drawer nested inside it was clipped to the header's own height (measured:
 * 72px tall instead of full-screen). Portalling also guarantees the drawer paints
 * above every sticky/stacked element on the page.
 *
 * Behaviour: closes on link selection, Escape and overlay tap; scroll is locked
 * while open; focus moves into the panel and is trapped there until it closes.
 */
export function MobileNav({
  items,
  phoneHref,
  whatsappLink,
}: {
  items: readonly NavItem[];
  phoneHref: string;
  whatsappLink: string;
}) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Hydration-safe "are we on the client?" flag. A portal must not be created during
  // SSR, but the flag cannot be set from an effect (that triggers a second render
  // pass, which React's linter flags). useSyncExternalStore gives the same result in
  // one pass: false on the server, true once hydrated.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // If the viewport crosses into the desktop layout while the drawer is open, close
  // it — otherwise the drawer would be hidden by `lg:hidden` while the page kept its
  // scroll lock (which happens on rotation or a resized window).
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the drawer once it is on screen.
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] h-[100dvh] lg:hidden"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="absolute inset-y-0 end-0 flex h-[100dvh] w-[min(23rem,90vw)] flex-col bg-offwhite shadow-[0_0_60px_rgba(6,20,40,0.28)]"
            initial={reduceMotion ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? { x: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-ink-950/10 px-5 pt-[env(safe-area-inset-top)]">
              <span className="eyebrow">{t("nav.menu")}</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={t("nav.closeMenu")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-ink-950/15 text-ink-950 transition-colors duration-200 hover:bg-ink-950/[0.05]"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* Scrollable middle: never lets the drawer's actions fall off-screen. */}
            <nav aria-label={t("nav.mainNavigation")} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <ul className="flex flex-col">
                {items.map((item, index) => {
                  const rowClass =
                    "flex items-center justify-between gap-4 py-4 text-lg font-semibold text-ink-950";
                  const row = (
                    <>
                      <span>{item.label}</span>
                      <span className="num text-xs text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </>
                  );
                  return (
                    <li key={item.href} className="border-b border-ink-950/10 last:border-b-0">
                      {/* The CMS may point a menu item off-site; that is an anchor, not a route. */}
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className={rowClass}
                        >
                          {row}
                        </a>
                      ) : (
                        <Link href={item.href} onClick={() => setOpen(false)} className={rowClass}>
                          {row}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-ink-950/10 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-3">
                <ButtonLink
                  href="/start-a-project"
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <span>{t("nav.start")}</span>
                  <ArrowRight />
                </ButtonLink>
                <ButtonAnchor
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="whatsapp"
                  className="w-full"
                  onClick={() => setOpen(false)}
                  data-analytics="whatsapp_click"
                  data-analytics-location="mobile_menu"
                >
                  <WhatsAppIcon />
                  <span>{t("cta.whatsapp")}</span>
                </ButtonAnchor>
                <ButtonAnchor
                  href={phoneHref}
                  size="lg"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setOpen(false)}
                  data-analytics="phone_click"
                  data-analytics-location="mobile_menu"
                >
                  <PhoneIcon />
                  <span className="num" dir="ltr">
                    0507776891
                  </span>
                </ButtonAnchor>
                {/* Same single-language control as the header, at full width. */}
                <LocaleSwitcher display="full" className="mt-1" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={t("nav.openMenu")}
        className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-ink-950/20 px-3.5 text-[0.9375rem] font-semibold text-ink-950 transition-colors duration-200 hover:border-ink-950/50 hover:bg-ink-950/[0.04]"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 6h14M3 10h14M3 14h9" />
        </svg>
        <span className="hidden sm:inline">{t("nav.menu")}</span>
      </button>

      {/* Portal target is <body>: see the note at the top of this file. */}
      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
