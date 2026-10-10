import { chromium } from "playwright";

async function verifyAll() {
  console.log("=== VERIFYING LIVE ADMIN & SAUDI ADVISOR PERSONA ===");
  const browser = await chromium.launch({ headless: true });
  
  // 1. Verify Public Site & Advisor Persona (Desktop)
  console.log("\n[1] Testing Public Site & Floating Saudi Advisor (Desktop)...");
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleErrors = [];
  desktopPage.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await desktopPage.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2000);

  // Check if advisor bust image is rendered
  const advisorImg = await desktopPage.$('img[src*="advisor-bust.webp"]');
  console.log("  ✓ Advisor Bust Image present in DOM:", Boolean(advisorImg));

  // Check rotating speech bubble
  const speechBubble = await desktopPage.$('div[aria-label="فتح المحادثة والاستفسار"]');
  console.log("  ✓ Speech Bubble present in DOM:", Boolean(speechBubble));
  if (speechBubble) {
    const text = await speechBubble.innerText();
    console.log("  Bubble text content:\n", text.trim());
  }

  // Screenshot desktop with floating character
  await desktopPage.screenshot({ path: "scripts/browser-actions/desktop-advisor-floating.png" });
  console.log("  ✓ Saved screenshot: scripts/browser-actions/desktop-advisor-floating.png");

  // Click advisor to open chat
  if (advisorImg) {
    console.log("  Clicking advisor character to open chat drawer...");
    await advisorImg.click();
    await desktopPage.waitForTimeout(1000);
    
    const chatInput = await desktopPage.$('input[placeholder*="اكتب استفسارك"]');
    console.log("  ✓ Chat drawer opened, input visible:", Boolean(chatInput));
    
    // Check avatar in header
    const headerAvatar = await desktopPage.$('img[src*="advisor-avatar.webp"]');
    console.log("  ✓ Advisor avatar in chat header:", Boolean(headerAvatar));
    
    await desktopPage.screenshot({ path: "scripts/browser-actions/desktop-chat-opened.png" });
    console.log("  ✓ Saved screenshot: scripts/browser-actions/desktop-chat-opened.png");
  }

  // 2. Verify Mobile View
  console.log("\n[2] Testing Mobile View (iPhone 14)...");
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1500);

  const mobileAdvisor = await mobilePage.$('img[src*="advisor-bust.webp"]');
  console.log("  ✓ Mobile Advisor Bust present:", Boolean(mobileAdvisor));

  await mobilePage.screenshot({ path: "scripts/browser-actions/mobile-advisor.png" });
  console.log("  ✓ Saved screenshot: scripts/browser-actions/mobile-advisor.png");

  // 3. Verify Admin Login & Settings API
  console.log("\n[3] Testing Admin Panel Login & Preferences at https://7-lands.com/admin ...");
  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const adminErrors = [];
  adminPage.on("console", msg => {
    if (msg.type() === "error") adminErrors.push(msg.text());
  });

  await adminPage.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  console.log("  Admin Login page reached.");

  // Check login fields
  const emailInput = await adminPage.$('input[name="email"], input[id="field-email"]');
  const passwordInput = await adminPage.$('input[name="password"], input[id="field-password"]');
  const submitBtn = await adminPage.$('button[type="submit"]');

  if (emailInput && passwordInput) {
    console.log("  Logging into Admin as super admin...");
    await emailInput.fill("owner@sevenlands.test");
    await passwordInput.fill("Sl-4BQaeUpFoWgy2h3MsXFX");
    await submitBtn.click();
    
    await adminPage.waitForTimeout(4000);
    console.log("  Current URL after login:", adminPage.url());

    // Navigate to site-settings
    await adminPage.goto("https://7-lands.com/admin/globals/site-settings", { waitUntil: "networkidle" });
    await adminPage.waitForTimeout(3000);

    await adminPage.screenshot({ path: "scripts/browser-actions/admin-site-settings.png" });
    console.log("  ✓ Saved screenshot: scripts/browser-actions/admin-site-settings.png");
  }

  console.log("\nAdmin Console Errors during session:", adminErrors.length);
  adminErrors.forEach(err => console.log("  [Admin Error]", err));

  await browser.close();
  console.log("\n=== ALL VERIFICATIONS COMPLETED ===");
}

verifyAll().catch(console.error);
