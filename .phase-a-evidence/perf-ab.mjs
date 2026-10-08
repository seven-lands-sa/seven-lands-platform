/**
 * Performance A/B: pre-Payload build (:3200) vs Phase A build (:3000).
 * Conditions: 4x CPU throttle, 1.6 Mbps down / 750 kbps up / 150 ms RTT.
 * Each route is measured twice and the medians are reported.
 */
import { chromium } from "@playwright/test";

const sides = [
  { label: "BEFORE", origin: "http://127.0.0.1:3200" },
  { label: "AFTER ", origin: "http://127.0.0.1:3000" },
];
const routes = ["/ar", "/ar/services", "/ar/start-a-project"];

const browser = await chromium.launch();

async function measure(origin, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    window.__lcp = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.__lcp = entries[entries.length - 1].startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  await page.goto(origin + route, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const js = resources.filter((r) => r.name.endsWith(".js"));
    return {
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      lcp: Math.round(window.__lcp ?? 0),
      cls: Number((window.__cls ?? 0).toFixed(4)),
      jsBytes: js.reduce((t, r) => t + (r.transferSize || 0), 0),
      jsCount: js.length,
      requests: resources.length,
    };
  });
  await context.close();
  return metrics;
}

console.log("route".padEnd(22) + "side".padEnd(8) + "TTFB".padEnd(9) + "LCP".padEnd(9) + "CLS".padEnd(10) + "JS (transfer)".padEnd(16) + "requests");
const results = {};
for (const route of routes) {
  results[route] = {};
  for (const side of sides) {
    const runs = [];
    for (let i = 0; i < 2; i += 1) runs.push(await measure(side.origin, route));
    const median = (key) => {
      const values = runs.map((r) => r[key]).sort((a, b) => a - b);
      return (values[0] + values[values.length - 1]) / 2;
    };
    const m = {
      ttfb: Math.round(median("ttfb")),
      lcp: Math.round(median("lcp")),
      cls: Number(median("cls").toFixed(4)),
      jsBytes: Math.round(median("jsBytes")),
      jsCount: Math.round(median("jsCount")),
      requests: Math.round(median("requests")),
    };
    results[route][side.label.trim()] = m;
    console.log(
      route.padEnd(22) +
        side.label.padEnd(8) +
        `${m.ttfb}ms`.padEnd(9) +
        `${m.lcp}ms`.padEnd(9) +
        `${m.cls}`.padEnd(10) +
        `${(m.jsBytes / 1024).toFixed(0)} kB (${m.jsCount} files)`.padEnd(16) +
        m.requests,
    );
  }
  const b = results[route].BEFORE;
  const a = results[route].AFTER;
  console.log(
    `  → delta   LCP ${a.lcp - b.lcp >= 0 ? "+" : ""}${a.lcp - b.lcp} ms · TTFB ${a.ttfb - b.ttfb >= 0 ? "+" : ""}${a.ttfb - b.ttfb} ms · ` +
      `CLS ${(a.cls - b.cls).toFixed(4)} · JS ${(a.jsBytes - b.jsBytes >= 0 ? "+" : "") + (a.jsBytes - b.jsBytes)} B transfer`,
  );
}
await browser.close();
