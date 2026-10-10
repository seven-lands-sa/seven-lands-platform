import { chromium } from "playwright";

async function verify() {
  console.log("=== SEVEN LANDS LIVE PRODUCTION VERIFICATION ===");

  // 1. Check live Open Graph images
  console.log("\n[1] Verifying Open Graph Images...");
  for (const path of ["/og/og-ar.jpg", "/og/og-en.jpg", "/og/og-ar.png", "/brand/seven-lands-skyline-hero.webp"]) {
    try {
      const res = await fetch(`https://7-lands.com${path}`);
      const len = res.headers.get("content-length") || "unknown";
      console.log(`  ✓ GET https://7-lands.com${path} -> Status ${res.status}, Type: ${res.headers.get("content-type")}, Size: ${(Number(len)/1024).toFixed(1)} KB`);
    } catch (e) {
      console.error(`  ✗ Failed GET ${path}:`, e.message);
    }
  }

  // 2. Check live Chat API with GhostMind
  console.log("\n[2] Verifying Live Chat API (/api/chat) with GhostMind Core...");
  try {
    const chatRes = await fetch("https://7-lands.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "السلام عليكم، حاب استفسر عن خدمات بناء وتطوير المتاجر الإلكترونية والتسويق للأداء، وش تقدرون تقدمون لنا؟",
        conversationId: "test-live-verif-" + Date.now(),
        history: []
      })
    });
    console.log("  Chat API Status:", chatRes.status);
    const chatData = await chatRes.json();
    console.log("  Chat Model used:", chatData.model);
    console.log("  Chat Reply Preview:\n", chatData.reply);
  } catch (e) {
    console.error("  ✗ Chat API error:", e.message);
  }

  // 3. Playwright browser testing: home, about, contact
  console.log("\n[3] Verifying Live Pages via Headless Browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  const routes = ["/ar", "/ar/about", "/ar/contact", "/ar/services"];
  for (const r of routes) {
    const url = `https://7-lands.com${r}`;
    const resp = await page.goto(url, { waitUntil: "networkidle" });
    console.log(`  ✓ Route ${r} -> Status ${resp.status()}`);
    // Check for images
    const imagesCount = await page.evaluate(() => document.querySelectorAll("img").length);
    console.log(`    Images rendered on page: ${imagesCount}`);
  }

  // Check Chat Widget presence on Home
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  const chatButton = await page.$('button[aria-label="مستشار سفن لاندز"]');
  console.log("  ✓ Chat Widget trigger button present:", Boolean(chatButton));

  await browser.close();
  console.log("\n=== ALL LIVE PRODUCTION CHECKS COMPLETED ===");
}

verify().catch(console.error);
