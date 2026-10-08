"use client";

import { useEffect } from "react";

/**
 * Reveals [data-reveal] elements as they enter the viewport using one shared
 * IntersectionObserver. No animation library is needed for this, and elements are
 * only hidden when JS is running (see html.reveal-ready in globals.css), so
 * no-JS and reduced-motion visitors see everything immediately.
 *
 * Safety net: if the observer is unavailable or misbehaves, everything is revealed
 * rather than leaving a section permanently invisible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll();
      return;
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    elements.forEach((el) => observer.observe(el));

    const safety = window.setTimeout(revealAll, 7000);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
