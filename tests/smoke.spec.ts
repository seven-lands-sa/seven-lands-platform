import { test, expect } from "@playwright/test";

/**
 * Critical smoke paths from the QA brief:
 * homepage, service navigation, language switch, brief form validation,
 * WhatsApp link, contact/map link, 404 and the mobile menu.
 */

const isArabic = (project: string) => !project.startsWith("en");

test.describe("navigation and locale", () => {
  test("homepage renders in the right direction with one h1", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    await page.goto(ar ? "/ar" : "/en");

    await expect(page.locator("html")).toHaveAttribute("dir", ar ? "rtl" : "ltr");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      ar ? "تسويق." : "Marketing.",
    );
  });

  test("language switch keeps the reader on the same page", async ({ page }, testInfo) => {
    test.skip(!isArabic(testInfo.project.name), "Locale switching is verified from the Arabic side.");
    await page.goto("/ar/services");

    const target = page.locator('a[hreflang="en"]');
    await expect(target).toHaveAttribute("href", "/en/services");
    await target.click();
    await page.waitForURL("**/en/services");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("service navigation reaches every capability detail page", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    await page.goto(ar ? "/ar/services" : "/en/services");

    const slugs = [
      "strategy-business-growth",
      "branding-creative",
      "content-production",
      "social-digital-presence",
      "performance-acquisition",
      "web-commerce-experiences",
      "software-automation-technology",
    ];

    for (const slug of slugs) {
      const response = await page.goto(`${ar ? "/ar" : "/en"}/services/${slug}`);
      expect(response?.status(), `${slug} should render`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });

  test("public pages never carry the old binding-offer disclaimer", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    const forbidden = [
      "محتوى الموقع",
      "تعريف بالخدمات",
      "لا يُعد عرضًا ملزمًا",
      "الأراضي السبع",
      "binding offer",
      "Website content describes",
    ];

    for (const path of [ar ? "/ar" : "/en", ar ? "/ar/terms" : "/en/terms", ar ? "/ar/this-does-not-exist" : "/en/this-does-not-exist"]) {
      await page.goto(path);
      const html = await page.content();
      for (const phrase of forbidden) {
        expect(html, `${path} must not contain "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  test("footer carries the approved commercial line and legal links only", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    await page.goto(ar ? "/ar" : "/en");

    const footer = page.locator("footer");
    await expect(footer).toContainText(ar ? "تسويق، محتوى، مواقع وبرمجيات تعمل معًا لنمو أعمالك." : "Marketing, content, websites and software");
    await expect(footer).toContainText("© 2026 Seven Lands.");

    const footerLinks = footer.locator("ul").last().locator("a");
    await expect(footerLinks).toHaveCount(2);
    await expect(footerLinks).toContainText([ar ? "سياسة الخصوصية" : "Privacy policy", ar ? "الشروط والأحكام" : "Terms & conditions"]);
  });

  test("WhatsApp CTAs carry a page-specific message", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    const messages = new Set<string>();

    const surfaces: [string, string][] = [
      [ar ? "/ar" : "/en", "header a[href*='wa.me']"],
      [ar ? "/ar/services/branding-creative" : "/en/services/branding-creative", "main a[href*='wa.me']"],
      [ar ? "/ar/services/web-commerce-experiences" : "/en/services/web-commerce-experiences", "main a[href*='wa.me']"],
      [ar ? "/ar/contact" : "/en/contact", "main a[href*='wa.me']"],
    ];

    for (const [path, selector] of surfaces) {
      await page.goto(path);
      const href = await page.locator(selector).first().getAttribute("href");
      const text = decodeURIComponent(new URL(href!, "http://localhost").searchParams.get("text") ?? "");
      expect(text.length, `${path} should prefill a message`).toBeGreaterThan(5);
      messages.add(text);
    }

    expect(messages.size, "each surface should prefill a different message").toBe(surfaces.length);
  });

  test("campaign context survives the journey into the brief payload", async ({ page }, testInfo) => {
    test.skip(!isArabic(testInfo.project.name), "Attribution is verified once, from the Arabic funnel.");

    let posted: Record<string, unknown> | null = null;
    await page.route("**/api/brief", async (route) => {
      posted = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, delivered: false }),
      });
    });

    await page.goto("/ar?utm_source=snapchat&utm_medium=cpc&utm_campaign=oct_launch");
    await page.waitForTimeout(900);
    await page.goto("/ar/services/web-commerce-experiences");
    await page.goto("/ar/start-a-project");

    await page.locator("main").getByRole("checkbox").first().check();
    for (let step = 0; step < 3; step += 1) await page.getByRole("button", { name: "التالي" }).click();
    await page.locator("main textarea").first().fill("نحتاج موقعًا جديدًا يشرح خدماتنا ويقود العميل للتواصل.");
    await page.getByRole("button", { name: "التالي" }).click();
    await page.getByRole("button", { name: "التالي" }).click();
    await page.getByLabel("الاسم").fill("اختبار");
    await page.getByLabel("رقم الجوال").fill("0507776891");
    await page.locator("main input[type='checkbox']").last().check();
    await page.getByRole("button", { name: "أرسل تفاصيل المشروع" }).click();
    await page.waitForTimeout(800);

    expect(posted, "the brief endpoint should receive the request").not.toBeNull();
    expect(posted!.campaign, "campaign context must survive navigation").toMatchObject({
      utm_source: "snapchat",
      utm_campaign: "oct_launch",
    });
  });

  test("unknown routes return a real 404 page", async ({ page }) => {
    const response = await page.goto("/ar/this-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("conversion paths", () => {
  test("WhatsApp links point at the verified number only", async ({ page }) => {
    await page.goto("/ar");
    const hrefs = await page.locator('a[href*="wa.me"]').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).href),
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toContain("https://wa.me/966507776891");
    }
  });

  test("phone conventions and the map link are correct", async ({ page }) => {
    await page.goto("/ar/contact");

    const tel = await page.locator('a[href^="tel:"]').first().getAttribute("href");
    expect(tel).toBe("tel:+966507776891");

    const maps = await page.locator('a[href*="maps.app.goo.gl"]').first().getAttribute("href");
    expect(maps).toContain("e3wYtFWUgd2vRZP28");
  });

  test("brief form validates before submitting and then confirms", async ({ page }, testInfo) => {
    const ar = isArabic(testInfo.project.name);
    const t = ar
      ? {
          land: /الاستراتيجية/,
          next: "التالي",
          submit: "أرسل تفاصيل المشروع",
          goal: "وصف مختصر",
          goalShort: "قصير",
          goalOk: "نحتاج موقعًا يقنع العميل وحملة نقيس نتائجها بشكل صحيح.",
          name: "الاسم",
          nameValue: "محمد",
          phone: "رقم الجوال",
          success: "وصلتنا تفاصيلك.",
        }
      : {
          land: /Strategy/,
          next: "Next",
          submit: "Send project details",
          goal: "Short description",
          goalShort: "too short",
          goalOk: "We need a website that convinces customers and a campaign we can measure properly.",
          name: "Name",
          nameValue: "Mohammed",
          phone: "Mobile number",
          success: "We've got your details.",
        };

    await page.goto(ar ? "/ar/start-a-project" : "/en/start-a-project");

    // Step 1 — required capability blocks an empty submission.
    await page.getByRole("button", { name: t.next }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.getByRole("checkbox", { name: t.land }).check();
    await page.getByRole("button", { name: t.next }).click();

    // Step 2 — the goal must be substantive.
    await page.getByLabel(t.goal).fill(t.goalShort);
    await page.getByRole("button", { name: t.next }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.getByLabel(t.goal).fill(t.goalOk);
    await page.getByRole("button", { name: t.next }).click();

    // Step 3 — timing.
    await page.getByRole("button", { name: t.next }).click();

    // Step 4 — an invalid Saudi mobile is rejected, a valid one passes.
    await page.getByLabel(t.name).fill(t.nameValue);
    await page.getByLabel(t.phone).fill("12345");
    await page.getByRole("button", { name: t.submit }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    await page.getByLabel(t.phone).fill("0507776891");
    await page.getByRole("checkbox").last().check();
    await page.getByRole("button", { name: t.submit }).click();

    await expect(page.getByText(t.success)).toBeVisible();

    // The success state hands the same details to WhatsApp.
    const handoff = await page.locator('a[href*="wa.me"]').first().getAttribute("href");
    expect(handoff).toContain("wa.me/966507776891");
  });
});

test.describe("mobile surface", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens, is keyboard dismissible and links correctly", async ({ page }, testInfo) => {
    test.skip(!isArabic(testInfo.project.name), "Mobile menu is verified once per locale.");
    await page.goto("/ar");

    const trigger = page.getByRole("button", { name: /القائمة/ });
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /خدماتنا/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("mobile drawer covers the whole viewport and stays above the header", async ({ page }, testInfo) => {
    test.skip(!isArabic(testInfo.project.name), "Drawer geometry is shared across locales.");
    await page.goto("/ar");
    await page.getByRole("button", { name: /فتح القائمة/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Regression guard: a nested drawer was previously clipped to the header height
    // (72px) because the header's backdrop-filter created a containing block.
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 1);

    // The primary action must be reachable without scrolling the drawer.
    await expect(dialog.getByRole("link", { name: /ابدأ مشروعك/ })).toBeVisible();

    // And the drawer must paint above the sticky header: the point at the centre of
    // the header must no longer belong to the header, and the overlay layer must sit
    // above the header's stacking level (z-50).
    const above = await page.evaluate(() => {
      const header = document.querySelector("header") as HTMLElement;
      const rect = header.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const overlay = document.querySelector('[role="dialog"]')?.parentElement as HTMLElement | null;
      return {
        headerCovered: hit ? !header.contains(hit) : false,
        overlayZ: overlay ? Number(getComputedStyle(overlay).zIndex) : 0,
        headerZ: Number(getComputedStyle(header).zIndex) || 0,
      };
    });
    expect(above.headerCovered).toBe(true);
    expect(above.overlayZ).toBeGreaterThan(above.headerZ);
  });

  test("no horizontal overflow on the primary pages", async ({ page }, testInfo) => {
    test.skip(!isArabic(testInfo.project.name), "Checked once; layout is shared.");
    for (const path of ["/ar", "/ar/services", "/ar/start-a-project", "/ar/contact"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${path} should not scroll horizontally`).toBeLessThanOrEqual(1);
    }
  });
});
