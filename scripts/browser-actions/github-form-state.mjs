import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  const state = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Create repository"));
    const errors = Array.from(document.querySelectorAll("[role='alert'], .flash-error, .error, [aria-invalid='true']")).map(e => e.innerText);
    const repoInput = document.querySelector("#repository-name-input");
    return {
      repoInputValue: repoInput ? repoInput.value : null,
      buttonFound: !!btn,
      buttonDisabled: btn ? btn.disabled : null,
      buttonAriaDisabled: btn ? btn.getAttribute("aria-disabled") : null,
      errors: errors
    };
  });

  console.log("GitHub Form State:", JSON.stringify(state, null, 2));
}

main().catch(err => console.error(err));
