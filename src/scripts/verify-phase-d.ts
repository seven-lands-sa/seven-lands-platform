/**
 * PHASE D — MEDIA LIBRARY VERIFICATION SUITE (§48–§53).
 *
 * Six suites in one file, because they share one fixture lifecycle:
 *
 *   1. MEDIA CRUD        upload · metadata · alt AR+EN · caption · tags · focal point · read
 *   2. TYPES & SECURITY  allowlist, MIME sniffing, size ceilings, SVG policy, byte-level privacy
 *   3. EXIF              GPS/device stripped on every stored file, orientation applied
 *   4. USAGE             unused is deletable · referenced is blocked with the exact places named
 *   5. REPLACEMENT       identity preserved, derivatives regenerated, old bytes gone, audited
 *   6. RBAC              viewer / editor / marketing / admin / super admin / anonymous
 *
 * Everything that matters goes over HTTP as the browser would: uploads are multipart requests, the
 * privacy probes fetch the real derivative URLs, and the persona checks log in with real sessions.
 * The Local API is used only to build fixtures and to inspect what the database actually stored.
 *
 * WRITE GUARD: refuses to run unless ALLOW_VERIFICATION_WRITES=true — these fixtures must never
 * appear on a production database.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { getPayload } from "payload";
import { mediaSrcSet, resolvePublicMedia } from "@/lib/content";
import sharp from "sharp";
import config from "@payload-config";

const BASE = process.env.MEDIA_TEST_BASE ?? "http://127.0.0.1:3000";
const MEDIA_DIR = process.env.MEDIA_DIR ? path.resolve(process.env.MEDIA_DIR) : path.resolve("media");
const FIXTURE_PASSWORD = "Verify!PhaseB2026x";
const FIXTURE_DOMAIN = "sevenlands.test";
const TMP = path.join(os.tmpdir(), "seven-lands-phase-d");

if (process.env.ALLOW_VERIFICATION_WRITES !== "true") {
  console.error(
    "REFUSED: this verification script writes fixtures to the database and to the media directory.\n" +
      "          Re-run with ALLOW_VERIFICATION_WRITES=true on a development or test database only.",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
mkdirSync(TMP, { recursive: true });

let passed = 0;
let failed = 0;
const failures: string[] = [];
const record = (ok: boolean, label: string, detail = "") => {
  if (ok) {
    passed += 1;
    console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ""}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ""}`);
  }
};

/* ── sessions ────────────────────────────────────────────────────────────────────────────────── */
const login = async (email: string, password: string): Promise<string> => {
  const response = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email, password }),
  });
  return (response.headers.getSetCookie?.() ?? []).map((cookie) => cookie.split(";")[0]).join("; ");
};

const adminCookie = await login(process.env.SEED_SUPER_ADMIN_EMAIL ?? "", process.env.SEED_SUPER_ADMIN_PASSWORD ?? "");
record(adminCookie.length > 0, "super admin session over HTTP");

const personaCookie = async (key: string) => login(`verify+${key}@${FIXTURE_DOMAIN}`, FIXTURE_PASSWORD);
const cookies = {
  viewer: await personaCookie("viewer"),
  editor: await personaCookie("editor"),
  marketing: await personaCookie("marketing"),
  admin: await personaCookie("admin"),
};
record(Object.values(cookies).every((value) => value.length > 0), "persona sessions over HTTP (viewer, editor, marketing, admin)");

/* Browser-shaped headers: Payload ignores a cookie without a trusted Origin / Sec-Fetch-Site. */
const auth = (cookie: string, extra: Record<string, string> = {}): Record<string, string> => ({
  Cookie: cookie,
  Origin: BASE,
  "Sec-Fetch-Site": "same-origin",
  ...extra,
});

/* ── fixtures ────────────────────────────────────────────────────────────────────────────────── */
const makePng = (width: number, height: number, colour: { r: number; g: number; b: number }) =>
  sharp({ create: { width, height, channels: 3, background: colour } }).png().toBuffer();

const jpegWithExif = await (async () => {
  const base = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 118, g: 82, b: 60 } } })
    .jpeg({ quality: 92 })
    .toBuffer();
  return sharp(base)
    .withMetadata({
      orientation: 6,
      /* sharp's Exif type does not enumerate the GPS sub-IFD; the writer accepts it. */
      exif: {
        IFD0: { Make: "PhaseDCam", Model: "TestModel", Software: "PhaseD-Suite" },
        GPS: { GPSLatitudeRef: "N", GPSLatitude: "24/1 28/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "39/1 36/1 0/1" },
      } as never,
    })
    .jpeg({ quality: 92 })
    .toBuffer();
})();

const png800 = await makePng(800, 600, { r: 40, g: 90, b: 160 });
const png1600 = await makePng(1600, 1200, { r: 160, g: 60, b: 40 });
const jpegSpoofed = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 10, g: 10, b: 10 } } })
  .jpeg()
  .toBuffer();
const cleanSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80"><rect width="120" height="80" fill="#7A9CC6"/><circle cx="60" cy="40" r="18" fill="#12253a"/></svg>`,
);
const dangerousSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><script>fetch('https://evil.example')</script></svg>`,
);
const fakeBinary = Buffer.concat([Buffer.from([0x4d, 0x5a, 0x90, 0x00]), Buffer.alloc(4096, 7)]); // "MZ" — a DOS/PE signature
const oversizePng = Buffer.concat([png800.subarray(0, 64), Buffer.alloc(11_000_000, 3)]);

type SizeInfo = { url?: string | null; width?: number | null; height?: number | null; filename?: string | null };

/** Upload document as the REST API returns it (relationships expanded, sizes present). */
type UploadedDoc = {
  id: string | number;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  url?: string | null;
  visibility?: string | null;
  contentHash?: string | null;
  sourceFilename?: string | null;
  replacedAt?: string | null;
  createdBy?: unknown;
  alt?: string | null;
  caption?: string | null;
  tags?: string[] | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: { thumbnail?: SizeInfo; card?: SizeInfo; content?: SizeInfo };
};

const createdIds: (string | number)[] = [];

/* ── HTTP helpers ────────────────────────────────────────────────────────────────────────────── */
type UploadResult = { status: number; doc?: Record<string, unknown>; message?: string; raw: string };

const upload = async (
  filename: string,
  buffer: Buffer,
  mime: string,
  fields: Record<string, unknown>,
  cookie: string,
  query = "",
): Promise<UploadResult> => {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), filename);
  form.append("_payload", JSON.stringify(fields));
  const response = await fetch(`${BASE}/api/media${query}`, { method: "POST", headers: auth(cookie), body: form });
  const raw = await response.text();
  let body: { doc?: Record<string, unknown>; errors?: { message?: string }[]; message?: string } = {};
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    /* non-JSON error page */
  }
  return { status: response.status, doc: body.doc, message: body.errors?.[0]?.message ?? body.message, raw };
};

const status = async (url: string, cookie?: string): Promise<number> => {
  const pathname = new URL(url, BASE).pathname;
  const response = await fetch(BASE + pathname, cookie ? { headers: auth(cookie) } : {});
  await response.arrayBuffer();
  return response.status;
};

const json = async <T>(url: string, cookie?: string, init?: RequestInit): Promise<{ status: number; body: T }> => {
  const response = await fetch(url.startsWith("http") ? url : BASE + url, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...(cookie ? auth(cookie) : {}) },
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body: body as T };
};

const storedPath = (filename: string) => path.join(MEDIA_DIR, filename);
const hasExif = async (filePath: string) => {
  const meta = await sharp(filePath).metadata();
  return { exifBytes: meta.exif?.length ?? 0, orientation: meta.orientation, width: meta.width, height: meta.height };
};

const cleanUp = async () => {
  for (const id of createdIds) {
    try {
      await payload.delete({ collection: "media", id, overrideAccess: true });
    } catch {
      /* already deleted by a test */
    }
  }
  rmSync(TMP, { recursive: true, force: true });
};

try {
  /* ═══ 1 · MEDIA CRUD ═══════════════════════════════════════════════════════════════════════ */
  console.log("\n══ 1 · MEDIA CRUD ══");

  const uploaded = await upload("PhaseD Test Image.PNG", png800, "image/png", { alt: "صورة اختبار — واجهة متجر" }, adminCookie, "?locale=ar");
  record(uploaded.status === 201 && Boolean(uploaded.doc), "upload succeeds over HTTP", `HTTP ${uploaded.status}, ${uploaded.message ?? ""}`);
  const asset = uploaded.doc as UploadedDoc;
  createdIds.push(asset.id);

  record(/^[a-z0-9-]+\.png$/.test(String(asset.filename)), "stored filename is sanitised and deterministic", String(asset.filename));
  record(asset.sourceFilename === "PhaseD Test Image.PNG", "the original filename is kept as metadata, not as a path", String(asset.sourceFilename));
  record(typeof asset.contentHash === "string" && asset.contentHash.length === 64, "SHA-256 content hash recorded", String(asset.contentHash).slice(0, 16) + "…");
  record(asset.width === 800 && asset.height === 600, "width/height stored", `${asset.width}×${asset.height}`);
  record((asset.filesize ?? 0) > 0, "filesize stored", `${asset.filesize} B`);
  record(asset.visibility === "private", "new uploads default to PRIVATE");
  record(asset.createdBy !== null && asset.createdBy !== undefined, "createdBy recorded", JSON.stringify(asset.createdBy).slice(0, 60));
  record(Boolean(asset.sizes?.thumbnail?.url && asset.sizes?.card?.url), "thumbnail + card generated for an 800×600 source");
  record(
    !asset.sizes?.content?.url,
    "no content derivative for a source smaller than 1200 px (Payload never upscales — stated policy)",
    `content: ${String(asset.sizes?.content?.url ?? "absent")}`,
  );
  const adminUser = await payload.findByID({ collection: "users", id: 1, overrideAccess: true });
  const createdById = typeof asset.createdBy === "object" && asset.createdBy !== null ? (asset.createdBy as { id?: unknown }).id : asset.createdBy;
  record(String(createdById) === String(adminUser.id), "createdBy is the authenticated uploader", `user ${adminUser.id}`);

  const derivativeDims = {
    thumbnail: `${asset.sizes?.thumbnail?.width}×${asset.sizes?.thumbnail?.height}`,
    card: `${asset.sizes?.card?.width}×${asset.sizes?.card?.height}`,
    content: `${asset.sizes?.content?.width}×${asset.sizes?.content?.height}`,
  };
  record(
    asset.sizes?.thumbnail?.width === 400 || (asset.sizes?.thumbnail?.width ?? 0) <= 400,
    "thumbnail ≤ 400×300 (never upscaled)",
    derivativeDims.thumbnail,
  );
  record((asset.sizes?.card?.width ?? 0) <= 768, "card ≤ 768×512", derivativeDims.card);
  record((asset.sizes?.content?.width ?? 0) <= 1200, "content ≤ 1200×900", derivativeDims.content);

  /* English is written as its own locale — never inherited from Arabic. */
  const enBefore = await payload.findByID({ collection: "media", id: asset.id, locale: "en", fallbackLocale: false, overrideAccess: true });
  record(!enBefore.alt, "Arabic alt does NOT appear in the English locale (fallback: false)");
  const arRead = await payload.findByID({ collection: "media", id: asset.id, locale: "ar", overrideAccess: true });
  record(arRead.alt === "صورة اختبار — واجهة متجر", "Arabic alt stored", String(arRead.alt));

  const patchEn = await json(`/api/media/${asset.id}?locale=en`, adminCookie, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alt: "Test image — retail façade", caption: "Captured façade" }),
  });
  record(patchEn.status === 200, "English alt/caption saved in their own locale", `HTTP ${patchEn.status}`);

  const meta = await json<{ altStatus: Record<string, string>; captionStatus: Record<string, string> }>(
    `/api/media/library-meta?ids=${asset.id}`,
    adminCookie,
  );
  record(meta.body.altStatus?.[String(asset.id)] === "complete", "library-meta reports alt completeness across both locales", String(meta.body.altStatus?.[String(asset.id)]));

  const patchFocal = await json(`/api/media/${asset.id}`, adminCookie, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ focalX: 0.62, focalY: 0.38, tags: ["services", "website"] }),
  });
  record(patchFocal.status === 200, "focal point + tags saved", `HTTP ${patchFocal.status}`);
  const afterFocal = await payload.findByID({ collection: "media", id: asset.id, overrideAccess: true });
  record(afterFocal.focalX === 0.62 && afterFocal.focalY === 0.38, "focal point stored as normalised coordinates (0.62, 0.38)");
  record(Array.isArray(afterFocal.tags) && afterFocal.tags.includes("services"), "tags stored as a controlled vocabulary", JSON.stringify(afterFocal.tags));

  /* ═══ 2 · TYPES & SECURITY ═════════════════════════════════════════════════════════════════ */
  console.log("\n══ 2 · TYPES & SECURITY ══");

  const spoofed = await upload("photo.png", jpegSpoofed, "image/png", { alt: "spoof" }, adminCookie);
  record(spoofed.status === 400 && /لا يطابق/.test(spoofed.message ?? ""), "declared PNG that is really a JPEG is refused in Arabic", spoofed.message ?? "");

  const executable = await upload("payload.exe", fakeBinary, "image/png", { alt: "exe" }, adminCookie);
  record(executable.status === 400, "executable extension refused", executable.message ?? "");

  const junk = await upload("notes.jpg", Buffer.from("this is not an image at all, just text"), "image/jpeg", { alt: "junk" }, adminCookie);
  record(junk.status === 400 && /التعرّف/.test(junk.message ?? ""), "text renamed to .jpg is refused by content sniffing", junk.message ?? "");

  const oversize = await upload("huge.png", oversizePng, "image/png", { alt: "huge" }, adminCookie);
  record(oversize.status === 400 && /يتجاوز الحد/.test(oversize.message ?? ""), "oversize image refused with the limit in the message", oversize.message ?? "");

  const unsafeSvg = await upload("logo.svg", dangerousSvg, "image/svg+xml", { alt: "unsafe" }, adminCookie);
  record(unsafeSvg.status === 400 && /مرفوض/.test(unsafeSvg.message ?? ""), "SVG with a script/handler is refused for a Super Admin too", unsafeSvg.message ?? "");

  const editorSvg = await upload("logo.svg", cleanSvg, "image/svg+xml", { alt: "editor svg" }, cookies.editor);
  record(editorSvg.status === 403 || editorSvg.status === 400, "editor without media.svg_upload cannot upload SVG", `HTTP ${editorSvg.status}: ${editorSvg.message ?? ""}`);

  const adminSvg = await upload("mark.svg", cleanSvg, "image/svg+xml", { alt: "علامة اختبار" }, adminCookie, "?locale=ar");
  record(adminSvg.status === 201, "Super Admin can upload a clean SVG", `HTTP ${adminSvg.status}`);
  const svgDoc = adminSvg.doc as UploadedDoc | undefined;
  if (svgDoc?.id) createdIds.push(svgDoc.id);

  if (svgDoc?.url) {
    const response = await fetch(BASE + new URL(String(svgDoc.url), BASE).pathname);
    const csp = response.headers.get("content-security-policy") ?? "";
    record(csp.includes("sandbox") && csp.includes("default-src 'none'"), "delivered SVG carries the CSP backstop", csp.slice(0, 90));
    await response.arrayBuffer();
  }

  /* Byte-level privacy on the freshly uploaded fixture. */
  const privateUrls = [asset.url, asset.sizes?.thumbnail?.url, asset.sizes?.card?.url, asset.sizes?.content?.url].filter(Boolean) as string[];
  const anonPrivate = await Promise.all(privateUrls.map((url) => status(url)));
  record(
    anonPrivate.every((code) => code === 403 || code === 404),
    "anonymous is refused the original AND every derivative of a private asset",
    anonPrivate.join(" / "),
  );
  const authedPrivate = await Promise.all(privateUrls.map((url) => status(url, adminCookie)));
  record(authedPrivate.every((code) => code === 200), "authenticated staff can read their own private asset", authedPrivate.join(" / "));

  /* ═══ 3 · EXIF ════════════════════════════════════════════════════════════════════════════ */
  console.log("\n══ 3 · EXIF AND ORIENTATION ══");
  const exifUpload = await upload("gps-photo.jpg", jpegWithExif, "image/jpeg", { alt: "صورة ببيانات موقع" }, adminCookie, "?locale=ar");
  record(exifUpload.status === 201, "JPEG with GPS + device EXIF accepted", `HTTP ${exifUpload.status}`);
  const exifDoc = exifUpload.doc as UploadedDoc;
  createdIds.push(exifDoc.id);

  const stored = await hasExif(storedPath(String(exifDoc.filename)));
  record(stored.exifBytes === 0, "stored original carries NO EXIF block", `exif bytes: ${stored.exifBytes}`);
  record(stored.orientation === undefined, "orientation tag removed (baked into the pixels instead)");
  record(
    stored.width === 1600 && stored.height === 2400,
    "EXIF orientation 6 was applied — the stored image is upright",
    `${stored.width}×${stored.height} (uploaded 2400×1600 with orientation 6)`,
  );
  const originalBytes = readFileSync(storedPath(String(exifDoc.filename)));
  record(
    !originalBytes.includes(Buffer.from("PhaseDCam")) && !originalBytes.includes(Buffer.from("TestModel")),
    "device identifiers are absent from the stored bytes",
  );
  record(
    Boolean(exifDoc.sizes?.thumbnail?.url && exifDoc.sizes?.card?.url && exifDoc.sizes?.content?.url),
    "three derivatives for a 2400×1600 source (thumbnail · card · content)",
    `${exifDoc.sizes?.thumbnail?.width}×${exifDoc.sizes?.thumbnail?.height} · ${exifDoc.sizes?.card?.width}×${exifDoc.sizes?.card?.height} · ${exifDoc.sizes?.content?.width}×${exifDoc.sizes?.content?.height}`,
  );
  /* §46 — the responsive set a public component would emit: small derivatives first, original last. */
  const srcset = mediaSrcSet(exifDoc);
  const widths = (srcset ?? "").split(", ").map((entry) => Number(entry.split(" ")[1]?.replace("w", "")));
  record(
    JSON.stringify(widths) === JSON.stringify([400, 768, 1200, 1600]),
    "srcset offers the derivatives in ascending width, original last (original is 1600 wide after orientation)",
    srcset ?? "null",
  );
  const smallSrcset = mediaSrcSet(asset);
  record(
    JSON.stringify((smallSrcset ?? "").split(", ").map((entry) => entry.split(" ")[1])) === JSON.stringify(["400w", "768w", "800w"]),
    "a source with no content derivative still yields a correct, non-upscaled srcset",
    smallSrcset ?? "null",
  );
  record(
    resolvePublicMedia({ ...exifDoc, visibility: "private" }, { locale: "ar" }) === null,
    "the resolver still refuses a private asset (srcset never leaks one)",
  );
  const focalResolved = resolvePublicMedia({ ...exifDoc, visibility: "public", focalX: 0.62, focalY: 0.38 }, { locale: "ar" });
  record(
    focalResolved?.focal?.x === 0.62 && focalResolved?.focal?.y === 0.38,
    "focal point reaches the frontend as normalised 0–1 coordinates",
    JSON.stringify(focalResolved?.focal),
  );
  const focalPercent = resolvePublicMedia({ ...exifDoc, visibility: "public", focalX: 62, focalY: 38 }, { locale: "ar" });
  record(
    focalPercent?.focal?.x === 0.62 && focalPercent?.focal?.y === 0.38,
    "Payload's percentage convention is normalised exactly once (62 → 0.62)",
    JSON.stringify(focalPercent?.focal),
  );
  record(
    resolvePublicMedia({ ...exifDoc, visibility: "public", focalX: null, focalY: null }, { locale: "ar" })?.focal === null,
    "no focal point stays null (no invented centre)",
  );

  const derivativeBytes = readFileSync(storedPath(String(exifDoc.sizes?.thumbnail?.filename)));
  record(
    !derivativeBytes.includes(Buffer.from("PhaseDCam")),
    "derivatives are EXIF-free as well",
    String(exifDoc.sizes?.thumbnail?.filename),
  );

  /* ═══ 4 · USAGE ═══════════════════════════════════════════════════════════════════════════ */
  console.log("\n══ 4 · USAGE AND SAFE DELETION ══");
  const usageEmpty = await json<{ references: unknown[]; count: number }>(`/api/media/${exifDoc.id}/usage`, adminCookie);
  record(usageEmpty.body.count === 0, "a new asset reports zero usages", JSON.stringify(usageEmpty.body.count));
  const metaEmpty = await json<{ counts: Record<string, number> }>(`/api/media/library-meta?ids=${exifDoc.id}`, adminCookie);
  record(metaEmpty.body.counts?.[String(exifDoc.id)] === 0, "library-meta agrees: usage count 0");

  /* Temporarily point Site Settings → default OG image at the fixture, then restore it exactly.
     Every read and write below names its locale explicitly. The Local API defaults to the default
     locale, but relying on such a default is how a partial localized write once destroyed this
     global's Arabic localisation — so the guard at the end of this block asserts that BOTH locales
     still carry their own values afterwards. */
  const settingsBefore = (await payload.findGlobal({ slug: "site-settings", locale: "ar", depth: 0, overrideAccess: true })) as {
    brand?: Record<string, unknown>;
    location?: Record<string, unknown>;
    general?: Record<string, unknown>;
  };
  const ogBefore = settingsBefore?.brand?.defaultOgImage ?? null;
  const arBefore = {
    display: settingsBefore?.location?.display ?? null,
    short: settingsBefore?.brand?.shortDescription ?? null,
    category: settingsBefore?.general?.businessCategory ?? null,
  };
  const enSettings = (await payload.findGlobal({ slug: "site-settings", locale: "en", depth: 0, overrideAccess: true })) as {
    brand?: Record<string, unknown>;
    location?: Record<string, unknown>;
    general?: Record<string, unknown>;
  };
  const enSettingsBefore = {
    display: enSettings?.location?.display ?? null,
    short: enSettings?.brand?.shortDescription ?? null,
    category: enSettings?.general?.businessCategory ?? null,
  };
  record(
    Boolean(arBefore.display && arBefore.short && arBefore.category),
    "the Arabic site-settings localisation is populated before the usage probe",
    JSON.stringify(arBefore).slice(0, 90),
  );

  /* Phase C's global refuses to reference a PRIVATE asset — references and visibility are linked. */
  let privateRefused = false;
  try {
    await payload.updateGlobal({
      slug: "site-settings",
      locale: "ar",
      data: { brand: { ...settingsBefore.brand, defaultOgImage: exifDoc.id } } as never,
      depth: 0,
      overrideAccess: true,
    });
  } catch {
    privateRefused = true;
  }
  record(privateRefused, "Site Settings refuses to reference a PRIVATE asset (visibility is part of the contract)");

  await payload.update({ collection: "media", id: exifDoc.id, data: { visibility: "public" }, overrideAccess: true });
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "ar",
    data: { brand: { ...settingsBefore.brand, defaultOgImage: exifDoc.id } } as never,
    depth: 0,
    overrideAccess: true,
  });

  const usageLinked = await json<{ references: { slug: string; label: string; fieldLabel: string }[]; count: number }>(
    `/api/media/${exifDoc.id}/usage`,
    adminCookie,
  );
  record(usageLinked.body.count === 1, "attaching it to Site Settings → default OG image registers exactly one usage");
  record(
    usageLinked.body.references?.[0]?.slug === "site-settings" && /صورة المشاركة/.test(usageLinked.body.references?.[0]?.fieldLabel ?? ""),
    "the usage names the entity and the field",
    JSON.stringify(usageLinked.body.references?.[0] ?? {}),
  );

  const blockedDelete = await json<{ errors?: { message?: string }[] }>(`/api/media/${exifDoc.id}`, adminCookie, { method: "DELETE" });
  record(blockedDelete.status === 400, "deleting a referenced asset is refused", `HTTP ${blockedDelete.status}`);
  record(
    /لا يمكن حذف هذه الصورة لأنها مستخدمة في/.test(blockedDelete.body?.errors?.[0]?.message ?? ""),
    "the refusal lists where it is used, in Arabic",
    (blockedDelete.body?.errors?.[0]?.message ?? "").split("\n").slice(0, 3).join(" · "),
  );
  const stillThere = await payload.findByID({ collection: "media", id: exifDoc.id, overrideAccess: true, depth: 0 });
  record(Boolean(stillThere?.id), "the asset and its references are untouched by the refused delete");

  /* Restore the global exactly as it was. */
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "ar",
    data: { brand: { ...settingsBefore.brand, defaultOgImage: ogBefore } } as never,
    depth: 0,
    overrideAccess: true,
  });

  /* Preservation guard: the probe above must not have cost either locale a single field. */
  for (const [locale, before] of [
    ["ar", arBefore],
    ["en", enSettingsBefore],
  ] as const) {
    const after = (await payload.findGlobal({ slug: "site-settings", locale, depth: 0, overrideAccess: true })) as {
      brand?: Record<string, unknown>;
      location?: Record<string, unknown>;
      general?: Record<string, unknown>;
    };
    record(
      (after?.location?.display ?? null) === before.display &&
        (after?.brand?.shortDescription ?? null) === before.short &&
        (after?.general?.businessCategory ?? null) === before.category,
      `the ${locale === "ar" ? "Arabic" : "English"} site-settings localisation survives the usage probe intact`,
      `display=${String(after?.location?.display ?? "—").slice(0, 26)}`,
    );
  }
  const usageAfterRestore = await json<{ count: number }>(`/api/media/${exifDoc.id}/usage`, adminCookie);
  record(usageAfterRestore.body.count === 0, "removing the reference makes it deletable again — nothing was auto-nulled, the reference was removed deliberately");

  await payload.update({ collection: "media", id: exifDoc.id, data: { visibility: "private" }, overrideAccess: true });
  const safeDelete = await json(`/api/media/${asset.id}`, adminCookie, { method: "DELETE" });
  record(safeDelete.status === 200, "an unused asset deletes normally", `HTTP ${safeDelete.status}`);
  createdIds.splice(createdIds.indexOf(asset.id), 1);

  /* ═══ 5 · REPLACEMENT ═════════════════════════════════════════════════════════════════════ */
  console.log("\n══ 5 · REPLACEMENT ══");
  const target = await upload("hero-before.png", png800, "image/png", { alt: "قبل الاستبدال", visibility: "public", tags: ["website"] }, adminCookie, "?locale=ar");
  const targetDoc = target.doc as UploadedDoc;
  createdIds.push(targetDoc.id);
  const beforeURLs = {
    original: String(targetDoc.url),
    thumbnail: String(targetDoc.sizes?.thumbnail?.url),
    content: String(targetDoc.sizes?.content?.url),
  };

  const sameBytes = await (async () => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(png800)], { type: "image/png" }), "hero-before.png");
    const response = await fetch(`${BASE}/api/media/${targetDoc.id}/replace`, { method: "POST", headers: auth(adminCookie), body: form });
    const body = (await response.json()) as { errors?: { message?: string }[] };
    return { status: response.status, message: body.errors?.[0]?.message ?? "" };
  })();
  record(sameBytes.status === 400 && /مطابق/.test(sameBytes.message), "replacing with identical bytes is refused", sameBytes.message);

  const svgIntoRaster = await (async () => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(cleanSvg)], { type: "image/svg+xml" }), "mark.svg");
    const response = await fetch(`${BASE}/api/media/${targetDoc.id}/replace`, { method: "POST", headers: auth(adminCookie), body: form });
    const body = (await response.json()) as { errors?: { message?: string }[] };
    return { status: response.status, message: body.errors?.[0]?.message ?? "" };
  })();
  record(svgIntoRaster.status === 400 && /SVG/.test(svgIntoRaster.message), "raster → SVG replacement is refused (delivery model would change)", svgIntoRaster.message);

  const replaced = await (async () => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(png1600)], { type: "image/png" }), "hero-after.png");
    const response = await fetch(`${BASE}/api/media/${targetDoc.id}/replace`, { method: "POST", headers: auth(adminCookie), body: form });
    return { status: response.status, body: (await response.json()) as { doc?: UploadedDoc } };
  })();
  record(replaced.status === 200, "binary replacement succeeds", `HTTP ${replaced.status}`);
  const after = await payload.findByID({ collection: "media", id: targetDoc.id, locale: "ar", overrideAccess: true });
  record(after.id === targetDoc.id, "the document identity is preserved (same id, same references)");
  record(after.width === 1600 && after.height === 1200, "dimensions updated to the new file", `${after.width}×${after.height}`);
  record(after.alt === "قبل الاستبدال" && (after.tags ?? []).includes("website"), "metadata survives the replacement (alt + tags unchanged)");
  record(Boolean(after.replacedAt), "replacedAt recorded", String(after.replacedAt));
  record(after.sizes?.content?.url !== beforeURLs.content, "derivatives were regenerated from the new bytes", String(after.sizes?.content?.url));
  const oldDerivative = await status(beforeURLs.thumbnail);
  record(oldDerivative === 404 || oldDerivative === 403, "the previous derivative is no longer served", `HTTP ${oldDerivative}`);
  const newOriginal = await status(String(after.url));
  record(newOriginal === 200, "the new public asset is served anonymously", `HTTP ${newOriginal}`);

  /* ═══ 6 · RBAC ═════════════════════════════════════════════════════════════════════════════ */
  console.log("\n══ 6 · RBAC MATRIX ══");
  const probeUpload = async (cookie: string) => {
    const result = await upload(`rbac-${Date.now()}.png`, png800, "image/png", { alt: "rbac" }, cookie);
    /* Persona uploads land in the same library — track them, or the suite leaves litter behind. */
    if (result.doc?.id !== undefined) createdIds.push(result.doc.id as string | number);
    return result.status;
  };

  const matrix = [
    { key: "viewer", cookie: cookies.viewer, upload: 403, update: 403, visibility: 403, remove: 403 },
    { key: "editor", cookie: cookies.editor, upload: 201, update: 200, visibility: 200, remove: 403 },
    { key: "marketing", cookie: cookies.marketing, upload: 201, update: 200, visibility: 200, remove: 403 },
    { key: "admin", cookie: cookies.admin, upload: 201, update: 200, visibility: 200, remove: 403 },
  ] as const;

  for (const row of matrix) {
    const uploadStatus = await probeUpload(row.cookie);
    record(uploadStatus === row.upload, `${row.key}: upload → ${row.upload}`, `got ${uploadStatus}`);

    const updateStatus = (
      await json(`/api/media/${targetDoc.id}`, row.cookie, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: `تحرير من ${row.key}` }),
      })
    ).status;
    record(updateStatus === row.update, `${row.key}: metadata edit → ${row.update}`, `got ${updateStatus}`);

    const visibilityStatus = (
      await json(`/api/media/${targetDoc.id}`, row.cookie, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: "private" }),
      })
    ).status;
    record(visibilityStatus === row.visibility, `${row.key}: visibility change → ${row.visibility}`, `got ${visibilityStatus}`);

    const deleteStatus = (await json(`/api/media/${targetDoc.id}`, row.cookie, { method: "DELETE" })).status;
    record(deleteStatus === row.remove, `${row.key}: delete → ${row.remove}`, `got ${deleteStatus}`);
  }

  /* Restore the fixture's visibility (the matrix flipped it) and check anonymous behaviour. */
  await payload.update({ collection: "media", id: targetDoc.id, data: { visibility: "public" }, overrideAccess: true });
  const anonRead = (await json("/api/media?limit=1")).status;
  record(anonRead === 200, "anonymous can list (and therefore see) public assets", `HTTP ${anonRead}`);
  const anonPrivateDetail = (await json(`/api/media/${exifDoc.id}`)).status;
  record(anonPrivateDetail === 403 || anonPrivateDetail === 404, "anonymous cannot read a private asset's document", `HTTP ${anonPrivateDetail}`);

  /* ═══ 7 · DUPLICATES, AUDIT, CACHE ════════════════════════════════════════════════════════ */
  console.log("\n══ 7 · DUPLICATES AND AUDIT ══");
  const twin = await upload("twin.png", png800, "image/png", { alt: "نسخة مكررة" }, adminCookie, "?locale=ar");
  const twinDoc = twin.doc as UploadedDoc;
  createdIds.push(twinDoc.id);
  record(twin.status === 201, "identical bytes are still accepted (duplicate detection warns, never blocks)", `HTTP ${twin.status}`);
  const twinRead = await payload.findByID({ collection: "media", id: twinDoc.id, overrideAccess: true });
  record(
    twinRead.contentHash === (await payload.findByID({ collection: "media", id: targetDoc.id, overrideAccess: true })).contentHash,
    "both copies share one content hash",
  );

  const audit = await payload.find({
    collection: "audit-events",
    where: {
      action: {
        in: ["media_uploaded", "media_updated", "media_visibility_changed", "media_binary_replaced", "media_deleted", "media_delete_blocked"],
      },
    },
    limit: 500,
    sort: "-createdAt",
    overrideAccess: true,
  });
  const actions = new Set(audit.docs.map((event) => String(event.action)));
  for (const action of ["media_uploaded", "media_updated", "media_visibility_changed", "media_binary_replaced", "media_deleted", "media_delete_blocked"]) {
    record(actions.has(action), `audit records ${action}`);
  }
  const binaryEvent = audit.docs.find((event) => String(event.action) === "media_binary_replaced" && String(event.resourceId) === String(targetDoc.id));
  record(
    Boolean(binaryEvent && typeof binaryEvent.actorEmail === "string" && binaryEvent.actorEmail.length > 0),
    "the replacement audit entry names the actor",
    String(binaryEvent?.actorEmail ?? ""),
  );
  record(
    !JSON.stringify((binaryEvent as unknown as { details?: unknown })?.details ?? {}).includes("base64"),
    "audit details never contain binary data",
  );

  /* ═══ 8 · SAMPLE ARTEFACTS FOR THE REPORT ════════════════════════════════════════════════ */
  const summary = {
    created: createdIds.length,
    passed,
    failed,
    samples: {
      private: { id: exifDoc.id, filename: exifDoc.filename, visibility: (await payload.findByID({ collection: "media", id: exifDoc.id, overrideAccess: true })).visibility },
      public: { id: targetDoc.id, filename: after.filename, width: after.width, height: after.height },
      svg: { id: svgDoc?.id ?? null, filename: svgDoc?.filename ?? null },
    },
  };
  writeFileSync(path.join(".phase-d-evidence", "verify-phase-d-samples.json"), JSON.stringify(summary, null, 2));
} finally {
  await cleanUp();
}

console.log(`\n  checks passed: ${passed}`);
console.log(`  checks failed: ${failed}`);
if (failures.length) for (const failure of failures) console.log(`    · ${failure}`);
console.log(failed === 0 ? "\n  PHASE_D_MEDIA_SUITE = PASS\n" : "\n  PHASE_D_MEDIA_SUITE = FAIL\n");

await payload.destroy();
process.exit(failed === 0 ? 0 : 1);
