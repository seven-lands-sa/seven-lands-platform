/**
 * PHASE D — media fixtures for the populated-library evidence pass.
 *
 * Uploads through the ordinary public REST API as the seeded Super Admin, exactly like an editor
 * would: no back doors, so the fixtures also re-prove the pipeline (sniffing, normalisation, sizes,
 * duplicate detection) at realistic dimensions.
 *
 * Everything it creates is listed at the end so the teardown script can remove it again.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: BASE },
  body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" };

/** A picture that is obviously a different picture: gradient + label-free geometry. */
const picture = async (w, h, format, palette) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <circle cx="${w * 0.72}" cy="${h * 0.34}" r="${Math.min(w, h) * 0.22}" fill="${palette[2]}" opacity="0.85"/>
    <rect x="${w * 0.08}" y="${h * 0.62}" width="${w * 0.44}" height="${h * 0.22}" rx="${h * 0.03}" fill="${palette[3]}" opacity="0.9"/>
  </svg>`;
  const image = sharp(Buffer.from(svg));
  return format === "jpeg"
    ? image.jpeg({ quality: 88 }).toBuffer()
    : format === "webp"
      ? image.webp({ quality: 88 }).toBuffer()
      : format === "avif"
        ? image.avif({ quality: 70 }).toBuffer()
        : image.png().toBuffer();
};

const upload = async (filename, buffer, mime, fields, query = "") => {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), filename);
  form.append("_payload", JSON.stringify(fields));
  const response = await fetch(`${BASE}/api/media${query}`, { method: "POST", headers: auth, body: form });
  const text = await response.text();
  if (!response.ok) throw new Error(`${filename}: HTTP ${response.status} ${text.slice(0, 200)}`);
  const body = JSON.parse(text);
  return body.doc;
};

const created = [];
const note = (doc, label) => {
  created.push({ id: doc.id, filename: doc.filename, label });
  console.log(`  ✓ ${label.padEnd(26)} #${doc.id}  ${doc.filename}  ${doc.width ?? "?"}×${doc.height ?? "?"}  ${doc.visibility}`);
};

console.log("uploading fixtures…");

note(
  await upload("hero-workshop.jpg", await picture(1800, 1012, "jpeg", ["#1d3350", "#7A9CC6", "#e8eef6", "#0f1d2e"]), "image/jpeg", {
    alt: "ورشة تصنيع — صورة تجريبية للاختبار",
    caption: "صورة تجريبية",
    tags: ["website", "services"],
    visibility: "public",
  }, "?locale=ar"),
  "hero (public, tagged)",
);

note(
  await upload("services-fitting.png", await picture(1200, 800, "png", ["#123b32", "#68b39a", "#dff1ea", "#0b231e"]), "image/png", {
    alt: "تركيب — صورة تجريبية",
    tags: ["services"],
    visibility: "public",
  }, "?locale=ar"),
  "service card (public)",
);

note(
  await upload("project-tower.jpg", await picture(2000, 1200, "jpeg", ["#3a2a12", "#c69a5f", "#f6ead6", "#241a0b"]), "image/jpeg", {
    alt: "مشروع تجريبي — برج",
    tags: ["projects"],
    visibility: "private",
  }, "?locale=ar"),
  "project cover (private)",
);

note(
  await upload("brand-mark-alt.png", await picture(900, 900, "png", ["#2b2b3a", "#8d8da8", "#f0f0f5", "#16161f"]), "image/png", {
    alt: "علامة تجريبية",
    visibility: "public",
  }, "?locale=ar"),
  "product mark (public)",
);

note(
  await upload("note-arabic-only.webp", await picture(900, 600, "webp", ["#4a1f2b", "#c98a9a", "#fbe9ee", "#2c1119"]), "image/webp", {
    alt: "صورة بلا ترجمة إنجليزية — للاختبار",
    visibility: "private",
  }, "?locale=ar"),
  "AR-only alt (private)",
);

note(
  await upload("divider-pattern.avif", await picture(1400, 400, "avif", ["#1b2b1b", "#7fae7f", "#eaf5ea", "#0f1a0f"]), "image/avif", {
    decorative: true,
    tags: ["website"],
    visibility: "public",
  }, "?locale=ar"),
  "decorative divider (avif)",
);

const cleanSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><rect width="320" height="120" rx="12" fill="#12283f"/><path d="M24 60h272" stroke="#7A9CC6" stroke-width="6"/></svg>`,
);
note(
  await upload("banner-line.svg", cleanSvg, "image/svg+xml", {
    alt: "شريط تجريبي",
    tags: ["brand"],
    visibility: "public",
  }, "?locale=ar"),
  "controlled SVG (public)",
);

/* Default social image — the one fixture that is actually referenced, so the library can show a
   non-zero usage count and the delete-blocked path has a real subject. */
const ogBytes = await picture(1200, 630, "jpeg", ["#0d1b2a", "#4f6d8f", "#dfe7ef", "#081018"]);
const ogDoc = await upload("og-default.jpg", ogBytes, "image/jpeg", {
  alt: "صورة المشاركة الافتراضية",
  tags: ["og", "website"],
  visibility: "public",
}, "?locale=ar");
note(ogDoc, "default OG (referenced)");

/* Second locale for one asset, to prove per-locale editing is real. */
await fetch(`${BASE}/api/media/${ogDoc.id}?locale=en`, {
  method: "PATCH",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ alt: "Default social sharing image", caption: "Seven Lands" }),
});

/* A deliberate duplicate: same bytes, different name. */
const duplicate = await upload("services-fitting-copy.png", await sharp(Buffer.from(await picture(1200, 800, "png", ["#123b32", "#68b39a", "#dff1ea", "#0b231e"]))).png().toBuffer(), "image/png", {
  alt: "نسخة مكررة — للاختبار",
  visibility: "private",
}, "?locale=ar");
note(duplicate, "deliberate duplicate (private)");

/* Point Site Settings at the OG fixture, so usage tracking has something to report. */
/* BOTH CALLS NEED AN EXPLICIT `?locale=`. With `localization.fallback: false`:
     · a locale-less REST READ returns null for every localized field, and
     · a locale-less REST WRITE lands in the default locale (ar),
   so posting the document back "as read" nulls — and therefore deletes — the whole Arabic
   localisation row of the global. That is exactly how the Arabic Site Settings were destroyed twice
   during Phase D; sending "the whole document" was not enough, because the document contained nulls.
   With `?locale=ar` on both calls the values round-trip intact (asserted below). */
const READ_LOCALE = "ar"; /* the default locale — the read must resolve the locale the write targets */
const settings = await (
  await fetch(`${BASE}/api/globals/site-settings?depth=0&locale=${READ_LOCALE}`, { headers: auth })
).json();
const updated = await fetch(`${BASE}/api/globals/site-settings?locale=${READ_LOCALE}`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ ...settings, brand: { ...(settings.brand ?? {}), defaultOgImage: ogDoc.id } }),
});
console.log(`  → Site Settings defaultOgImage = #${ogDoc.id} (HTTP ${updated.status})`);

/* Self-check: both locales must still carry their own values after the write. */
for (const locale of ["ar", "en"]) {
  const check = await (await fetch(`${BASE}/api/globals/site-settings?depth=0&locale=${locale}`, { headers: auth })).json();
  const display = check?.location?.display;
  const short = check?.brand?.shortDescription;
  if (!display || !short) {
    throw new Error(`site-settings localisation "${locale}" was damaged by the write (display=${display}, short=${short})`);
  }
  console.log(`  ✓ ${locale} localisation intact after the write: "${String(display).slice(0, 34)}…"`);
}

writeFileSync(".phase-d-evidence/fixtures.json", JSON.stringify({ created, ogId: ogDoc.id }, null, 2));
console.log(`\n${created.length} fixtures uploaded — ids in .phase-d-evidence/fixtures.json`);
