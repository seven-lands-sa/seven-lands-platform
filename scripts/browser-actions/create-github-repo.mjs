import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  console.log("Navigating to https://github.com/new...");
  await page.goto("https://github.com/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 1. Fill repo name
  const nameInput = page.locator("#repository-name-input");
  await nameInput.waitFor({ state: "visible", timeout: 10000 });
  await nameInput.fill("seven-lands-platform");
  console.log("Repository name filled: seven-lands-platform");
  await page.waitForTimeout(1000);

  // 2. Select Private
  // Look for label or element containing Private
  const privateOption = page.locator("label:has-text('Private'), [data-targets*='visibility']:has-text('Private'), span:text-is('Private')").first();
  if (await privateOption.count() > 0) {
    await privateOption.click();
    console.log("Clicked Private option");
  } else {
    // Fallback search
    await page.getByLabel("Private").check().catch(() => {});
  }
  await page.waitForTimeout(1500);

  // 3. Click Create repository button
  const createBtn = page.locator("button[type='submit']:has-text('Create repository'), button:has-text('Create repository')").first();
  await createBtn.waitFor({ state: "visible", timeout: 10000 });
  console.log("Clicking Create repository button...");
  await createBtn.click();

  // 4. Wait for redirection
  await page.waitForURL(url => url.pathname.includes("seven-lands-platform"), { timeout: 15000 });
  console.log("Successfully created repository! Current URL:", page.url());
}

main().catch(err => {
  console.error("Error in create-github-repo:", err);
  process.exit(1);
});
