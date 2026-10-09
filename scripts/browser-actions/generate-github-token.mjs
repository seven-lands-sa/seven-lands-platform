import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  console.log("Navigating to https://github.com/settings/tokens/new...");
  await page.goto("https://github.com/settings/tokens/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Fill Note
  const noteInput = page.locator("#oauth_access_description, input[name='oauth_access[description]']");
  await noteInput.fill("Seven Lands Platform Automation - 7-lands.com");
  console.log("Note filled.");

  // Check 'repo' scope
  const repoScope = page.locator("input[value='repo'], #oauth_access_scopes_repo");
  await repoScope.check();
  console.log("Checked 'repo' scope.");

  // Check 'workflow' scope if present
  const workflowScope = page.locator("input[value='workflow'], #oauth_access_scopes_workflow");
  if (await workflowScope.count() > 0) {
    await workflowScope.check();
  }

  // Click Generate token button
  const generateBtn = page.locator("button:has-text('Generate token'), input[value='Generate token']").first();
  console.log("Clicking Generate token button...");
  await generateBtn.click();

  await page.waitForTimeout(4000);
  console.log("Current page URL:", page.url());

  // Capture token
  const tokenElement = page.locator("#new-oauth-token, [data-copy-hint]");
  if (await tokenElement.count() > 0) {
    const token = (await tokenElement.innerText()).trim();
    if (token) {
      fs.writeFileSync("scripts/browser-actions/.token.tmp", token, "utf-8");
      console.log("TOKEN_GENERATED_SUCCESSFULLY. Length:", token.length);
      return;
    }
  }

  console.log("Could not find token element directly. Checking page text for ghp_...");
  const pageText = await page.evaluate(() => document.body.innerText);
  const match = pageText.match(/ghp_[a-zA-Z0-9]{36}/);
  if (match) {
    fs.writeFileSync("scripts/browser-actions/.token.tmp", match[0], "utf-8");
    console.log("TOKEN_MATCHED_SUCCESSFULLY. Length:", match[0].length);
  } else {
    console.log("Token not matched. Snippet:", pageText.slice(0, 500));
  }
}

main().catch(err => {
  console.error("Error generating token:", err);
  process.exit(1);
});
