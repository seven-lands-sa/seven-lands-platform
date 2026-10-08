import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility gate (target: Lighthouse accessibility 95+, WCAG 2.1 A/AA).
 * Uses axe-core against the real rendered pages in both directions.
 */

const pages = ["/ar", "/en", "/ar/services", "/ar/services/web-commerce-experiences", "/ar/start-a-project", "/ar/contact"];

for (const path of pages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      target: violation.nodes[0]?.target,
    }));

    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
