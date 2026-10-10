import { chromium } from 'playwright';

async function testLiveInteraction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log("Navigating to https://7-lands.com/ar ...");
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  
  const trigger = await page.$('button[aria-label="فتح محادثة مستشار سفن لاند"]');
  console.log("Clicking chat trigger button...");
  await trigger.click();
  await page.waitForTimeout(1000);
  
  // Verify chat drawer opened
  const input = await page.$('input[placeholder*="اكتب استفسارك"]');
  console.log("Chat input field visible:", Boolean(input));
  
  console.log("Typing message to Saudi AI assistant...");
  await input.fill("مرحبا، كم اسعار باقات التسويق الرقمي وتطوير العلامة التجارية عندكم؟");
  
  const submitBtn = await page.$('form button[type="submit"]');
  await submitBtn.click();
  
  console.log("Waiting for AI response from GhostMind...");
  // Wait up to 10 seconds for the response bubble to appear
  await page.waitForTimeout(6000);
  
  const messages = await page.$$eval('div[class*="rounded-2xl"]', els => els.map(e => e.innerText));
  console.log("Rendered chat messages in UI:", messages.length);
  for (const m of messages) {
    if (m.trim().length > 20) {
      console.log("\n--- Message in UI ---\n", m.trim().slice(0, 300), "...");
    }
  }
  
  await page.screenshot({ path: "scripts/browser-actions/live-chat-verified.png" });
  console.log("Saved screenshot to scripts/browser-actions/live-chat-verified.png");
  
  await browser.close();
}

testLiveInteraction().catch(console.error);
