/**
 * Tests the hypothesis: withPayload adds `Critical-CH: Sec-CH-Prefers-Color-Scheme` to every
 * response, which makes the browser restart the navigation to resend the hint — costing ~1 RTT.
 * If a client that already sends the hint sees no LCP penalty, the hypothesis holds.
 */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();

async function measure(origin, label, sendHint) {
  const samples = [];
  for (let i = 0; i < 3; i += 1) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...(sendHint ? { extraHTTPHeaders: { "Sec-CH-Prefers-Color-Scheme": "light" } } : {}),
    });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => { const e = l.getEntries(); window.__lcp = e[e.length - 1].startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); });
    await page.goto(origin + "/ar", { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);
    samples.push(Math.round(await page.evaluate(() => window.__lcp)));
    await ctx.close();
  }
  const sorted = [...samples].sort((a, b) => a - b);
  console.log(`  ${label.padEnd(46)} samples: ${samples.join(", ")} ms   median ${sorted[1]} ms`);
  return sorted[1];
}

console.log("LCP of /ar under 4x CPU + 1.6 Mbps / 150 ms RTT\n");
const before = await measure("http://127.0.0.1:3200", "BEFORE (pre-Payload), no hint sent", false);
const afterNoHint = await measure("http://127.0.0.1:3000", "AFTER (Payload), no hint sent", false);
const afterHint = await measure("http://127.0.0.1:3000", "AFTER (Payload), client pre-sends the hint", true);
const beforeHint = await measure("http://127.0.0.1:3200", "BEFORE (pre-Payload), client pre-sends the hint", true);

console.log(`\n  hypothesis: if Critical-CH causes a retry, AFTER-with-hint should match BEFORE.`);
console.log(`  BEFORE ${before} ms · AFTER ${afterNoHint} ms (+${afterNoHint - before}) · AFTER with hint ${afterHint} ms`);
console.log(`  recovered by pre-sending the hint: ${afterNoHint - afterHint} ms (BEFORE with hint: ${beforeHint} ms)`);
await browser.close();
