import { chromium } from 'playwright';

async function main() {
  console.log("=== CAPTURING LIVE RTL ADMIN & VOICE CHAT WIDGET ===");
  const browser = await chromium.launch({ headless: true });

  // 1. Capture Admin Dashboard (Arabic RTL)
  console.log("[1] Logging into Admin Dashboard...");
  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await adminPage.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await adminPage.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await adminPage.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await adminPage.locator('button[type="submit"]').first().click();
  await adminPage.waitForTimeout(4000);

  console.log("Admin Dashboard URL:", adminPage.url());
  await adminPage.screenshot({ path: "scripts/browser-actions/live-admin-dashboard-rtl.png" });
  console.log("✓ Saved screenshot: scripts/browser-actions/live-admin-dashboard-rtl.png");

  // 2. Capture Public Site & Advisor Persona
  console.log("\n[2] Checking Public Site with user-provided advisor photo...");
  const publicPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await publicPage.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  await publicPage.waitForTimeout(2000);

  // Accept cookies to clear the bottom view
  const acceptCookiesBtn = await publicPage.$('button:has-text("قبول الكل")');
  if (acceptCookiesBtn) {
    await acceptCookiesBtn.click();
    await publicPage.waitForTimeout(1000);
  }

  await publicPage.screenshot({ path: "scripts/browser-actions/live-home-new-advisor.png" });
  console.log("✓ Saved screenshot: scripts/browser-actions/live-home-new-advisor.png");

  // Open chat and check mic button
  const advisorBust = await publicPage.$('img[src*="advisor-bust.webp"]');
  if (advisorBust) {
    console.log("Opening chat via advisor bust click...");
    await advisorBust.click();
    await publicPage.waitForTimeout(1500);

    const micBtn = await publicPage.$('button[aria-label="التحدث بالمايك"]');
    console.log("✓ Mic button present in chat bar:", Boolean(micBtn));

    await publicPage.screenshot({ path: "scripts/browser-actions/live-chat-with-mic.png" });
    console.log("✓ Saved screenshot: scripts/browser-actions/live-chat-with-mic.png");
  }

  await browser.close();
  console.log("\n=== ALL CAPTURES COMPLETE ===");
}

main().catch(console.error);
