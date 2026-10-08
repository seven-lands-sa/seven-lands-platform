/**
 * Seven Lands — visual + functional QA capture.
 * Usage: node scripts/qa-capture.mjs
 * Writes screenshots to qa/screenshots and prints a findings report
 * (console errors, failed requests, horizontal overflow, missing landmarks).
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:3000";
const OUT = "qa/screenshots";

const routes = [
  { path: "/ar", name: "home-ar" },
  { path: "/en", name: "home-en" },
  { path: "/ar/services", name: "services-ar" },
  { path: "/en/services", name: "services-en" },
  { path: "/ar/services/branding-creative", name: "service-ar" },
  { path: "/ar/work", name: "work-ar" },
  { path: "/ar/insights", name: "insights-ar" },
  { path: "/ar/about", name: "about-ar" },
  { path: "/ar/start-a-project", name: "start-ar" },
  { path: "/en/start-a-project", name: "start-en" },
  { path: "/ar/contact", name: "contact-ar" },
  { path: "/ar/privacy", name: "privacy-ar" },
  { path: "/ar/this-page-does-not-exist", name: "notfound-ar" },
];

const viewports = [
  { label: "390", width: 390, height: 900 },
  { label: "1440", width: 1440, height: 1000 },
];

const findings = [];

const browser = await chromium.launch();

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    locale: "ar-SA",
  });

  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    const failed = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("requestfailed", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.includes("favicon")) return;
      failed.push(`${request.failure()?.errorText} ${url}`);
    });

    try {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 45000 });
    } catch (error) {
      console.log(`✗ ${route.path} @${viewport.label} — ${error.message.split("\n")[0]}`);
      await page.close();
      continue;
    }

    // Let fonts settle before the full-page shot. Reveal animations are forced to
    // their end state so the capture shows the real layout, not mid-animation.
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: "[data-reveal]{opacity:1 !important;transform:none !important}",
    });
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 40);
          else {
            window.scrollTo(0, 0);
            setTimeout(resolve, 250);
          }
        };
        step();
      });
    });
    await page.waitForTimeout(350);

    /* Settle check: streamed segments can land after `networkidle`, and a screenshot taken in that
       window once captured a pre-stream footer (the location line rendered its fallback label
       instead of the address). Wait until the page height has been stable for three consecutive
       checks, so the capture always shows the finished document. */
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let last = -1;
          let stable = 0;
          const tick = () => {
            const height = document.body.scrollHeight;
            stable = height === last ? stable + 1 : 0;
            last = height;
            if (stable >= 3) resolve();
            else setTimeout(tick, 200);
          };
          tick();
        }),
    );

    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const offenders = [];
      if (docWidth > winWidth + 1) {
        document.querySelectorAll("*").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winWidth + 2 || rect.left < -2) {
            offenders.push(
              `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(rect.left)}→${Math.round(rect.right)}]`,
            );
          }
        });
      }
      return { docWidth, winWidth, offenders: offenders.slice(0, 6) };
    });

    const a11y = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
      imgWithoutAlt: Array.from(document.querySelectorAll("img")).filter((i) => !i.hasAttribute("alt")).length,
      title: document.title,
    }));

    await page.screenshot({
      path: `${OUT}/${route.name}-${viewport.label}.png`,
      fullPage: true,
    });

    if (errors.length || failed.length || overflow.offenders.length || a11y.h1 !== 1) {
      console.log(`   ↳ offenders: ${JSON.stringify(overflow.offenders).slice(0, 400)}`);
      console.log(`   ↳ errors: ${JSON.stringify(errors).slice(0, 400)}`);
      findings.push({
        route: route.path,
        viewport: viewport.label,
        errors,
        failed,
        overflow,
        a11y,
      });
    }

    console.log(
      `✓ ${route.path} @${viewport.label} — h1:${a11y.h1} dir:${a11y.dir} overflow:${overflow.offenders.length} errors:${errors.length} failed:${failed.length}`,
    );
    await page.close();
  }

  await context.close();
}

await browser.close();
await mkdir("qa", { recursive: true });
await writeFile("qa/findings.json", JSON.stringify(findings, null, 2));
console.log(`\n${findings.length} route/viewport combinations with findings — see qa/findings.json`);
