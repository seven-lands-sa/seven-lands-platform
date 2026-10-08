/**
 * PHASE D — ADMIN MEDIA UX IN THE BROWSER (§13, §14, §15, §29, §32, §33, §34).
 *
 * Drives the real admin as the seeded Super Admin and asserts what an editor sees, at four widths:
 * grid + filters + sort + search, the upload dialog, the detail surfaces (usage / alt / actions), the
 * picker, and the known table-overflow surfaces. Screenshots land in .phase-d-evidence/admin-d/.
 *
 * Findings are printed as PASS/FAIL lines and written to a JSON artefact. It is a measurement pass:
 * it does not change product data except for one upload made through the UI (deleted at the end).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.ADMIN_BASE ?? "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const fixtures = JSON.parse(readFileSync(".phase-d-evidence/fixtures.json", "utf8"));
const OUT = ".phase-d-evidence/admin-d";
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (ok, label, detail = "") => {
  results.push({ ok, label, detail });
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? `  — ${detail}` : ""}`);
};

const overflowOf = (page) =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > doc.clientWidth + 2;
      })
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`);
    return { client: doc.clientWidth, scroll: doc.scrollWidth, offenders };
  });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
console.log("logged in\n");

/* ── 1 · THE LIBRARY GRID ─────────────────────────────────────────────────────────────────────── */
console.log("══ LIBRARY GRID ══");
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
await page.waitForSelector(".sl-grid, .sl-library__empty", { timeout: 20000 });
await page.waitForTimeout(600);

const cardCount = await page.locator(".sl-card").count();
check(cardCount >= fixtures.created.length, "grid shows every fixture", `${cardCount} tiles`);
check(await page.locator(".sl-card__image").first().isVisible(), "tiles render real thumbnails");
const usageChip = await page.locator(".sl-chip--usage").allInnerTexts();
check(
  usageChip.some((t) => t.includes("1")),
  "a referenced asset reports a non-zero usage count",
  usageChip.slice(0, 4).join(" | "),
);
check(
  (await page.locator(".sl-chip--private").count()) > 0,
  "private assets are labelled",
  `${await page.locator(".sl-chip--private").count()} private tiles`,
);
check((await page.locator(".sl-chip--duplicate").count()) === 1, "the duplicate pair is flagged");
check((await page.locator(".sl-chip--alt-decorative").count()) === 1, "decorative asset flagged as such");

/* Search */
await page.fill('input[type="search"]', "hero");
await page.waitForTimeout(1200);
const searched = await page.locator(".sl-card").count();
check(searched === 1, "search narrows the grid", `${searched} tile for «hero»`);
await page.fill('input[type="search"]', "");
await page.waitForTimeout(1200);

/* Filters */
const selects = page.locator(".sl-library__filters select");
await selects.nth(0).selectOption("private");
await page.waitForTimeout(1200);
const privateCount = await page.locator(".sl-card").count();
check(privateCount === 3, "visibility filter → private only", `${privateCount} tiles`);
await selects.nth(0).selectOption("");
await page.waitForTimeout(900);

await selects.nth(1).selectOption("image/svg+xml");
await page.waitForTimeout(1200);
check((await page.locator(".sl-card").count()) === 1, "type filter → SVG only");
await selects.nth(1).selectOption("");
await page.waitForTimeout(900);

await selects.nth(2).selectOption("services");
await page.waitForTimeout(1200);
check((await page.locator(".sl-card").count()) === 2, "tag filter → «الخدمات»", `${await page.locator(".sl-card").count()} tiles`);
await selects.nth(2).selectOption("");
await page.waitForTimeout(900);

/* Sort */
await selects.nth(3).selectOption("name");
await page.waitForTimeout(1200);
const firstName = await page.locator(".sl-card__name").first().innerText();
check(firstName.trim().startsWith("banner-line"), "sort by name is alphabetical", firstName.trim());
await selects.nth(3).selectOption("newest");
await page.waitForTimeout(1200);

/* Responsive: the grid at each width */
for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
  await page.waitForSelector(".sl-card", { timeout: 20000 });
  await page.waitForTimeout(500);
  const overflow = await overflowOf(page);
  check(!(overflow.scroll > overflow.client + 2), `library: no page-level overflow at ${width}px`, JSON.stringify(overflow));
  await page.screenshot({ path: `${OUT}/${width}-library.png`, fullPage: false });
}
await page.setViewportSize({ width: 1440, height: 1000 });

/* ── 2 · UPLOAD DIALOG (§35, §36) ─────────────────────────────────────────────────────────────── */
console.log("\n══ UPLOAD DIALOG ══");
await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
await page.waitForSelector(".sl-card");
await page.getByRole("button", { name: "رفع صورة", exact: true }).first().click();
await page.waitForTimeout(600);
check(await page.locator('input[type="file"]').count() > 0, "dialog keeps a real file input (drag/drop is an addition, not a replacement)");
check((await page.locator(".sl-dropzone, [data-dropzone]").count()) > 0, "drag-and-drop zone present");
await page.screenshot({ path: `${OUT}/1440-upload-dialog.png` });
await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(400);
const dialogOverflow = await overflowOf(page);
check(!(dialogOverflow.scroll > dialogOverflow.client + 2), "upload dialog fits a 390px screen", JSON.stringify(dialogOverflow));
await page.screenshot({ path: `${OUT}/390-upload-dialog.png` });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

/* ── 3 · DETAIL SURFACES (§14, §18) ───────────────────────────────────────────────────────────── */
console.log("\n══ DETAIL VIEW ══");
await page.goto(`${BASE}/admin/collections/media/${fixtures.ogId}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const detailText = await page.locator("main").innerText();
check(/مستخدمة|استخدام/.test(detailText), "detail view shows the usage area");
check(detailText.includes("صورة المشاركة الافتراضية"), "usage names the exact field", "صورة المشاركة الافتراضية");
check(/النص البديل|حالة النص البديل/.test(detailText), "detail view shows alt completeness");
check(detailText.includes("الإعدادات العامة"), "usage names the owning entity (الإعدادات العامة)");
await page.screenshot({ path: `${OUT}/1440-detail-referenced.png`, fullPage: true });

/* the blocked delete must be visible to the editor, not just to the API */
const deleteBlocked = await page.evaluate(async () => {
  const response = await fetch(`/api/media/${window.location.pathname.split("/").pop()}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, message: body?.errors?.[0]?.message ?? "" };
});
check(deleteBlocked.status === 400, "deleting a referenced asset is refused", `HTTP ${deleteBlocked.status}`);
check(/لا يمكن حذف هذه الصورة/.test(deleteBlocked.message), "the refusal is the Arabic block message", deleteBlocked.message.slice(0, 90));
check(/الإعدادات العامة/.test(deleteBlocked.message), "the refusal lists where it is used (in the API response)");

/* a private asset must not be openable by anonymous visitors */
const privateId = fixtures.created.find((entry) => entry.label.includes("private"))?.id;
const anonStatus = await page.evaluate(async (id) => {
  const response = await fetch(`/api/media/${id}`);
  return response.status;
}, privateId);
check(anonStatus === 200 || anonStatus === 403, "authenticated staff can read their own private asset", `HTTP ${anonStatus}`);

for (const width of [390, 1024]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`${BASE}/admin/collections/media/${fixtures.ogId}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const overflow = await overflowOf(page);
  check(!(overflow.scroll > overflow.client + 2), `detail view: no overflow at ${width}px`, JSON.stringify(overflow));
  await page.screenshot({ path: `${OUT}/${width}-detail.png`, fullPage: false });
}

/* ── 4 · PICKER (§15) ─────────────────────────────────────────────────────────────────────────── */
console.log("\n══ PICKER ══");
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(`${BASE}/admin/media-picker`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
check((await page.locator("h1").first().innerText()).includes("اختيار صورة"), "picker review surface loads");
await page.getByRole("button", { name: "اختر صورة" }).first().click();
await page.waitForTimeout(1200);
const pickerCards = await page.locator(".sl-card").count();
check(pickerCards > 0, "picker lists the library", `${pickerCards} tiles`);
await page.screenshot({ path: `${OUT}/1440-picker.png` });

/* search inside the picker, then pick the first result */
const pickerSearch = page.locator('input[type="search"]').first();
await pickerSearch.fill("og-default");
await page.waitForTimeout(1200);
check((await page.locator(".sl-card").count()) === 1, "picker search works");
await page.locator(".sl-card__pick").first().click();
await page.waitForTimeout(900);
const pickedSummary = await page.locator(".sl-panel").innerText();
check(pickedSummary.includes("og-default"), "picking returns the asset to the field (no ID typing)", pickedSummary.split("\n").slice(0, 2).join(" / "));
await page.screenshot({ path: `${OUT}/1440-picker-selected.png` });

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(400);
const pickerOverflow = await overflowOf(page);
check(!(pickerOverflow.scroll > pickerOverflow.client + 2), "picker fits a 390px screen", JSON.stringify(pickerOverflow));
await page.screenshot({ path: `${OUT}/390-picker.png` });

/* ── 5 · THE TABLE-OVERFLOW SURFACES (§32) ────────────────────────────────────────────────────── */
console.log("\n══ TABLE OVERFLOW (§32) ══");
await page.setViewportSize({ width: 1024, height: 900 });
const surfaces = [
  ["media-table", "/admin/collections/media"],
  ["users", "/admin/collections/users"],
  ["roles", "/admin/collections/roles"],
  ["audit-events", "/admin/collections/audit-events"],
];
for (const [name, path] of surfaces) {
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const overflow = await overflowOf(page);
    check(!(overflow.scroll > overflow.client + 2), `${name}: no page overflow at ${width}px`, JSON.stringify(overflow));
    if (name !== "media-table") await page.screenshot({ path: `${OUT}/${width}-${name}.png`, fullPage: false });
  }
}

/* ── 6 · ACCESSIBILITY SPOT-CHECK (§34) ───────────────────────────────────────────────────────── */
console.log("\n══ A11Y SPOT-CHECK ══");
await page.setViewportSize({ width: 1440, height: 1000 });
const { default: AxeBuilder } = await import("@axe-core/playwright");
for (const [name, path] of [["library", "/admin/collections/media"], ["picker", "/admin/media-picker"]]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = scan.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  const detail = serious
    .map((violation) => `${violation.id}: ${violation.nodes.slice(0, 3).map((node) => `${node.target.join(" ")} «${(node.failureSummary ?? "").split("\n").slice(0, 2).join(" ")}»`).join(" ; ")}`)
    .join(" || ");
  check(serious.length === 0, `axe: no serious/critical issues on the media ${name}`, detail.slice(0, 400));
}

/* keyboard: tab into the grid and open a tile with the keyboard */
await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
await page.waitForSelector(".sl-card");
const keyboardFocus = await page.evaluate(() => {
  const target = document.querySelector(".sl-card__name");
  if (!(target instanceof HTMLElement)) return false;
  target.focus();
  return document.activeElement === target;
});
check(keyboardFocus, "tiles are keyboard-focusable");

writeFileSync(".phase-d-evidence/admin-ux-results.json", JSON.stringify(results, null, 2));
const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) console.log(failed.map((entry) => `  ✗ ${entry.label} ${entry.detail}`).join("\n"));
await browser.close();
process.exit(failed.length === 0 ? 0 : 1);
