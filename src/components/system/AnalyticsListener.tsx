"use client";

import { useEffect } from "react";
import { rememberCampaign, track } from "@/lib/analytics";

/**
 * ONE delegated listener for the whole site instead of wrapping every CTA in a
 * client component. Any element with `data-analytics="event_name"` (plus optional
 * `data-analytics-*` payload attributes) is reported automatically.
 */
export function AnalyticsListener() {
  useEffect(() => {
    rememberCampaign();
    document.documentElement.classList.add("js");
    document.documentElement.classList.add("reveal-ready");

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.("[data-analytics]") as HTMLElement | null;
      if (!el) return;

      const name = el.dataset.analytics;
      if (!name) return;

      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith("analytics") && key !== "analytics" && typeof value === "string") {
          payload[key.replace(/^analytics/, "").toLowerCase()] = value;
        }
      }

      track(name as Parameters<typeof track>[0], payload);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
