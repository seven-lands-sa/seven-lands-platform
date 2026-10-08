/**
 * Measures the cost a browser pays to negotiate Payload's client hints.
 *
 * `Critical-CH` makes the browser discard the first response and re-issue the navigation, so the
 * signal is: does a cold navigation produce ONE document request or TWO, and how much longer does
 * it take before the document starts arriving.
 *
 * Usage: node scripts/measure-nav-cost.mjs <label>   (writes .phase-c-evidence/nav-cost-<label>.json)
 */
import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

const label = process.argv[2] ?? "unlabelled";
const BASE = process.env.QA_BASE ?? "http://127.0.0.1:3000";
const ROUTES = ["/ar", "/en"];
const ROUNDS = 7;

const browser = await chromium.launch();
const results = [];

for (const route of ROUTES) {
  const perRoute = [];
  for (let i = 0; i < ROUNDS; i++) {
    /* Fresh context each round: no warm cache, no reused connection — the condition Critical-CH
       actually costs something in. */
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    let documentRequests = 0;
    page.on("request", (request) => {
      if (request.resourceType() === "document") documentRequests += 1;
    });
    await page.goto(BASE + route, { waitUntil: "load" });
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return nav
        ? {
            responseStart: Math.round(nav.responseStart),
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
            loadEvent: Math.round(nav.loadEventEnd),
          }
        : null;
    });
    perRoute.push({ documentRequests, ...timing });
    await context.close();
  }
  const median = (key) => {
    const values = perRoute.map((r) => r[key]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  };
  results.push({
    route,
    rounds: perRoute.length,
    documentRequestsMedian: median("documentRequests"),
    documentRequestsAll: perRoute.map((r) => r.documentRequests),
    responseStartMedianMs: median("responseStart"),
    loadEventMedianMs: median("loadEvent"),
    samples: perRoute,
  });
}

/* Header evidence for the same build, so the numbers are tied to the configuration. */
const context = await browser.newContext();
const publicResponse = await context.request.get(BASE + "/ar");
const adminResponse = await context.request.get(BASE + "/admin");
const headerOf = (response, name) => response.headers()[name.toLowerCase()] ?? null;
const headers = {
  public: {
    "accept-ch": headerOf(publicResponse, "accept-ch"),
    "critical-ch": headerOf(publicResponse, "critical-ch"),
  },
  admin: {
    "accept-ch": headerOf(adminResponse, "accept-ch"),
    "critical-ch": headerOf(adminResponse, "critical-ch"),
  },
};
await context.close();
await browser.close();

const report = { label, base: BASE, at: new Date().toISOString(), headers, routes: results };
mkdirSync(".phase-c-evidence", { recursive: true });
writeFileSync(`.phase-c-evidence/nav-cost-${label}.json`, JSON.stringify(report, null, 2));

for (const r of results) {
  console.log(
    `${label} ${r.route}: document requests per navigation = ${r.documentRequestsMedian} (${r.documentRequestsAll.join(",")}) | responseStart ${r.responseStartMedianMs} ms | load ${r.loadEventMedianMs} ms`,
  );
}
console.log(`${label} headers: public Critical-CH=${headers.public["critical-ch"]} | admin Critical-CH=${headers.admin["critical-ch"]}`);
