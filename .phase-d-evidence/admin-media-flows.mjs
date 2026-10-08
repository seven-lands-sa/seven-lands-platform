/**
 * PHASE D — THE EDITOR FLOWS, DRIVEN THROUGH THE REAL UI (§14, §18, §20, §35, §36, §42).
 *
 * The API suite proves the rules. This script proves an editor can actually reach them: upload a
 * picture with alt text and a tag, watch the progress states, replace its bytes, flip visibility, and
 * delete what is unused — plus the one thing that must NOT be possible: the delete button stays
 * disabled for an asset the site is using.
 *
 * Everything it creates is removed again at the end.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

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

const picture = async (w, h, color) =>
  sharp({ create: { width: w, height: h, channels: 3, background: color } })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect x="${w * 0.1}" y="${h * 0.1}" width="${w * 0.3}" height="${h * 0.3}" fill="#ffffff" opacity="0.5"/></svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

const api = async (path, init = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Cookie: adminCookie, Origin: BASE, "Sec-Fetch-Site": "same-origin", ...(init.headers ?? {}) },
  });
  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
};

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: BASE },
  body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }),
});
const adminCookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
await page.setViewportSize({ width: 1440, height: 1000 });
/* confirmations are part of the product; the run accepts them like an editor would */
page.on("dialog", (dialog) => void dialog.accept());
console.log("logged in\n");

/* ── 1 · UPLOAD THROUGH THE UI (§35, §36) ─────────────────────────────────────────────────────── */
console.log("══ UPLOAD VIA THE DIALOG ══");
const uploadBytes = await picture(1400, 900, { r: 20, g: 60, b: 90 });
await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
await page.waitForSelector(".sl-card");
await page.getByRole("button", { name: "رفع صورة", exact: true }).first().click();
await page.waitForSelector("#sl-upload-input", { state: "attached" });

await page.setInputFiles("#sl-upload-input", {
  name: "editor-upload.png",
  mimeType: "image/png",
  buffer: uploadBytes,
});
await page.fill('.sl-field:has-text("النص البديل (عربي)") input', "صورة رفعها المحرر من الأداة");
await page.fill('.sl-field:has-text("النص البديل (إنجليزي)") input', "An image the editor uploaded");
/* public + one tag, so the flow covers the metadata an editor is expected to provide */
await page.selectOption('.sl-form__row select.sl-select', "public");
await page.locator(".sl-chips button", { hasText: "الموقع" }).first().click();

const progressSeen = await page.evaluate(() => {
  window.__slProgress = false;
  const observer = new MutationObserver(() => {
    if (document.querySelector('[role="progressbar"]')) window.__slProgress = true;
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return true;
});
check(progressSeen, "progress observer installed");
await page.getByRole("button", { name: "رفع الملف" }).click();
await page.waitForTimeout(2500);
const sawProgress = await page.evaluate(() => window.__slProgress === true);
check(sawProgress, "a progress state is shown during upload (uploading → processing)", "role=progressbar observed");
await page.screenshot({ path: `${OUT}/1440-upload-progress.png` });
await page.waitForTimeout(2500);

/* find it through the API to confirm what was stored */
const found = await api(`/api/media?where[sourceFilename][equals]=editor-upload.png&limit=1&locale=ar`);
const uploaded = found.body?.docs?.[0];
check(Boolean(uploaded), "the editor's upload exists in the library", `#${uploaded?.id ?? "?"}`);
check(uploaded?.alt === "صورة رفعها المحرر من الأداة", "Arabic alt was stored from the dialog", uploaded?.alt);
check(uploaded?.visibility === "public", "visibility choice was stored", uploaded?.visibility);
check((uploaded?.tags ?? []).includes("website"), "the chosen tag was stored", JSON.stringify(uploaded?.tags));
const enAlt = uploaded ? (await api(`/api/media/${uploaded.id}?locale=en`)).body?.alt : null;
check(enAlt === "An image the editor uploaded", "English alt was stored separately", enAlt);
check(
  (await page.locator(".sl-card").count()) === fixtures.created.length + 1,
  "the grid refreshed and shows the new asset",
  `${await page.locator(".sl-card").count()} tiles`,
);

/* ── 2 · REPLACE THROUGH THE UI (§20, §42) ────────────────────────────────────────────────────── */
console.log("\n══ REPLACE VIA THE DETAIL PANEL ══");
await page.goto(`${BASE}/admin/collections/media/${uploaded.id}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const beforeReplace = await api(`/api/media/${uploaded.id}?depth=0&locale=ar`);
check(beforeReplace.body?.width === 1400, "replace case starts from the 1400×900 upload", `${beforeReplace.body?.width}×${beforeReplace.body?.height}`);

await page.setInputFiles('.sl-actions input[type="file"]', {
  name: "editor-replacement.jpg",
  mimeType: "image/jpeg",
  buffer: await sharp(uploadBytes).jpeg({ quality: 88 }).toBuffer(),
});
await page.waitForTimeout(4500);
const afterReplace = await api(`/api/media/${uploaded.id}?depth=0&locale=ar`);
check(afterReplace.body?.replacedAt != null, "the replacement is recorded (replacedAt)", String(afterReplace.body?.replacedAt));
check(afterReplace.body?.id === uploaded.id, "identity preserved (same document id — references untouched)", `#${afterReplace.body?.id}`);
check(
  typeof afterReplace.body?.filename === "string" && /^editor-upload-[0-9a-f]{8}\.jpg$/.test(afterReplace.body.filename),
  "the stored filename/URL follows the new bytes (so no cache can serve the old image under the same URL)",
  String(afterReplace.body?.filename),
);
check(
  afterReplace.body?.sourceFilename === "editor-upload.png",
  "the asset's original name is kept as metadata, never as a path",
  String(afterReplace.body?.sourceFilename),
);
await page.screenshot({ path: `${OUT}/1440-detail-actions.png` });

/* the visibility controls must be reachable and must stick */
await page.getByRole("button", { name: "اجعلها خاصة" }).first().click();
await page.waitForTimeout(2000);
const afterVisibility = await api(`/api/media/${uploaded.id}?depth=0&locale=ar`);
check(afterVisibility.body?.visibility === "private", "visibility can be changed from the detail panel", String(afterVisibility.body?.visibility));

/* ── 3 · DELETE SAFETY (§18, §19) ─────────────────────────────────────────────────────────────── */
console.log("\n══ DELETE SAFETY IN THE UI ══");
await page.goto(`${BASE}/admin/collections/media/${fixtures.ogId}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
const referencedDelete = page.locator('.sl-actions button:has-text("حذف")').first();
check(await referencedDelete.isDisabled(), "delete is disabled for a referenced asset (no force-delete in V1)");
const refusalNote = page.locator(".sl-actions__note").first();
check(await refusalNote.isVisible(), "the refusal is stated in visible Arabic text next to the disabled button");
check(
  /لا يمكن حذف هذا الملف لأنه مستخدم في الموقع/.test(await refusalNote.innerText()),
  "the refusal names the reason and points at the usage section",
  (await refusalNote.innerText()).replace(/\s+/g, " ").slice(0, 120),
);
await page.screenshot({ path: `${OUT}/1440-detail-delete-blocked.png`, fullPage: false });

/* the unused asset can be deleted from the UI — after the confirmation dialog */
await page.goto(`${BASE}/admin/collections/media/${uploaded.id}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.locator('.sl-actions button:has-text("حذف")').first().click();
await page.waitForTimeout(3000);
const deleted = await api(`/api/media/${uploaded.id}?depth=0&locale=ar`);
check(deleted.status === 404 || deleted.status === 403, "an unused asset deletes from the UI after confirmation", `HTTP ${deleted.status}`);

writeFileSync(".phase-d-evidence/admin-flows-results.json", JSON.stringify(results, null, 2));
const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} flow checks passed`);
if (failed.length) console.log(failed.map((entry) => `  ✗ ${entry.label} ${entry.detail}`).join("\n"));
await browser.close();
process.exit(failed.length === 0 ? 0 : 1);
