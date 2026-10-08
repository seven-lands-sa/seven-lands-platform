/**
 * MEDIA POLICY — what may enter the library, and how it is vetted (§6, §7, §26, §40).
 *
 * Pure functions only: the validation hooks, the verification suite and any future import tool all
 * call the same code, so the rule cannot drift between the API and the tests.
 *
 * Two independent questions, deliberately answered twice:
 *   1. Is the DECLARED type allowed?        (`allowedFor`, cheap, runs on every upload)
 *   2. Do the BYTES match that declaration? (`sniffMimeType`, magic-byte check)
 * A file that lies about its type fails the second test. That is what stops a .exe renamed to .png
 * and an HTML document renamed to .jpg from being stored as an image and later served with an
 * image content type.
 */

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** SVG is allowed only through the guarded path in `validateSvg`. */
export const SVG_MIME_TYPE = "image/svg+xml";

export const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, SVG_MIME_TYPE] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Size ceilings. Images are meant to be big enough for a hero and small enough to process; SVG is a
 * vector format and the only legitimate large SVGs are maps or complex illustrations, so it gets a
 * much tighter ceiling — the smaller the surface, the smaller the attack surface.
 */
export const MAX_IMAGE_BYTES = 10_000_000; // 10 MB
export const MAX_SVG_BYTES = 1_000_000; // 1 MB

/** Extensions that must never be stored, whatever the declared MIME says. */
export const FORBIDDEN_EXTENSIONS = [
  "exe", "dll", "so", "sh", "bash", "bat", "cmd", "com", "cgi", "js", "mjs", "cjs",
  "php", "phtml", "asp", "aspx", "jsp", "py", "rb", "pl", "html", "htm", "xhtml",
  "svgz", "jar", "msi", "apk", "dmg", "zip", "rar", "7z", "tar", "gz",
] as const;

export type SniffResult =
  | { ok: true; mimeType: AllowedMimeType }
  | { ok: false; reason: string };

const startsWith = (buffer: Uint8Array, bytes: readonly number[]): boolean =>
  bytes.every((byte, index) => buffer[index] === byte);

const asciiAt = (buffer: Uint8Array, offset: number, text: string): boolean =>
  [...text].every((char, index) => buffer[offset + index] === char.charCodeAt(0));

/**
 * Magic-byte identification for the formats the library accepts.
 *
 * Deliberately conservative: an unrecognised byte signature is refused rather than trusted from the
 * declared MIME. When the file is an image the check also covers the container details that matter
 * (`ftyp` brand for AVIF) instead of a prefix that any file could carry.
 */
export function sniffMimeType(buffer: Uint8Array): SniffResult {
  if (buffer.length < 12) return { ok: false, reason: "الملف أصغر من أن يكون صورة صحيحة." };

  /* JPEG: FF D8 FF */
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { ok: true, mimeType: "image/jpeg" };

  /* PNG: 89 50 4E 47 0D 0A 1A 0A */
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ok: true, mimeType: "image/png" };
  }

  /* WEBP: "RIFF" ???? "WEBP" */
  if (asciiAt(buffer, 0, "RIFF") && asciiAt(buffer, 8, "WEBP")) {
    return { ok: true, mimeType: "image/webp" };
  }

  /* AVIF / HEIF: ISO-BMFF box "ftyp" with an avif/avis brand. */
  if (asciiAt(buffer, 4, "ftyp")) {
    const brand = String.fromCharCode(...buffer.slice(8, 12));
    if (brand === "avif" || brand === "avis") return { ok: true, mimeType: "image/avif" };
  }

  /* SVG: an XML-ish text document. The content check happens in `validateSvg`; here we only
     confirm it is text starting with an SVG-shaped prologue. */
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(buffer.slice(0, 1024))
    .replace(/^\uFEFF/, "")
    .trimStart()
    .toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return { ok: true, mimeType: SVG_MIME_TYPE };
  }

  return {
    ok: false,
    reason: "تعذّر التعرّف على نوع الملف من محتواه. الأنواع المدعومة: JPG، PNG، WebP، AVIF، SVG.",
  };
}

/**
 * Raster normalisation: orientation baked into the pixels, then re-encoded.
 *
 * One function, used by both the upload hook and the replacement endpoint, so "what a stored file is"
 * has a single definition — and so a hash taken before storing describes the bytes that are stored.
 * Re-encoding without `withMetadata` is what removes EXIF: GPS coordinates, device make/model and
 * software tags never reach the disk (§40, §41).
 */
export async function normaliseRaster(
  buffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif",
): Promise<Buffer> {
  const format = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[mimeType] as
    | "jpeg"
    | "png"
    | "webp"
    | "avif";
  const { default: sharp } = await import("sharp");
  return sharp(buffer)
    .rotate()
    .toFormat(format, mimeType === "image/jpeg" ? { quality: 90, mozjpeg: true } : { quality: 90 })
    .toBuffer();
}

/**
 * Stored filename for a REPLACEMENT.
 *
 * The base name stays the asset's own name (identity for the human), the extension follows the new
 * bytes, and a short content stamp makes the name change exactly when the bytes do. That last part
 * matters: the URL changes with every replacement, so nothing that cached the old image — browser,
 * CDN, a link someone pasted in a chat — can serve the old picture from the old address.
 *
 * The stamp is stripped before re-applying, so replacing a file ten times leaves
 * `name-<8 hex>.jpg`, never `name-1-2-3.jpg`.
 */
export function replaceStoredFilename(currentName: string, mimeType: AllowedMimeType, hash: string): string {
  const base = currentName.replace(/\.[^.]*$/, "").replace(/-[0-9a-f]{8}$/, "");
  return safeStoredFilename(`${base}-${hash.slice(0, 8)}`, mimeType);
}

export type SvgCheck = { ok: true } | { ok: false; reason: string };

/**
 * SVG SAFETY (§7) — chosen policy: TRUSTED UPLOAD + CONTENT REFUSAL + CSP BACKSTOP.
 *
 * Chosen over sanitising because a sanitiser that rewrites a designer's file can silently change
 * how it renders, while a refusal is honest: the editor is told exactly what is not accepted.
 *
 * Three layers, in order:
 *   1. The upload permission. SVG needs `media.svg_upload` — a high-risk permission that only a
 *      Super Admin holds by default, so the file arrives from a trusted operator, not a stranger.
 *   2. This check. Scripts, event handlers, external references, `foreignObject`, embedded HTML and
 *      entity declarations are refused outright — the file is not stored at all.
 *   3. The delivery headers (`next.config.ts`): an SVG response carries
 *      `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`, so even a
 *      payload that slipped past today's patterns cannot execute in a visitor's browser.
 *
 * The regexes are intentionally blunt. A false rejection costs one support conversation; a false
 * acceptance costs an XSS on the public origin.
 */
export function validateSvg(buffer: Uint8Array): SvgCheck {
  if (buffer.byteLength > MAX_SVG_BYTES) {
    return { ok: false, reason: `حجم ملف SVG يتجاوز الحد المسموح (${Math.round(MAX_SVG_BYTES / 1000)} كيلوبايت).` };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer).toLowerCase();

  const refusals: { pattern: RegExp; label: string }[] = [
    { pattern: /<\s*script\b/, label: "وسم script" },
    { pattern: /<\s*foreignobject\b/, label: "وسم foreignObject (HTML داخل SVG)" },
    { pattern: /<\s*(iframe|embed|object|applet|frame)\b/, label: "إطار أو عنصر مضمّن" },
    { pattern: /<\s*(audio|video)\b/, label: "عنصر وسائط" },
    { pattern: /\son[a-z]+\s*=/, label: "معالج حدث (onload، onclick…)" },
    { pattern: /javascript\s*:/, label: "بروتوكول javascript:" },
    { pattern: /data\s*:\s*text\/html/, label: "بيانات HTML مضمّنة" },
    { pattern: /<!doctype/, label: "تعريف DOCTYPE (يفتح باب الكيانات الخارجية)" },
    { pattern: /<!entity/, label: "تعريف كيان XML" },
    { pattern: /<\?xml-stylesheet/, label: "ورقة أنماط خارجية" },
    { pattern: /(href|xlink:href|src)\s*=\s*["']?\s*(https?:|\/\/)/, label: "مرجع خارجي (http/https)" },
    { pattern: /@import/, label: "استيراد CSS" },
    { pattern: /<\s*use\b[^>]*\b(href|xlink:href)\s*=\s*["']?\s*(https?:|\/\/|data:)/, label: "use يشير إلى مصدر خارجي" },
    { pattern: /<\s*(animate|set)\b[^>]*\battributeName\s*=\s*["']?\s*on/i, label: "تحريك يغيّر معالج حدث" },
    { pattern: /<\s*set\b[^>]*\bto\s*=\s*["']?\s*javascript/i, label: "قيمة javascript داخل set" },
  ];

  for (const { pattern, label } of refusals) {
    if (pattern.test(text)) {
      return { ok: false, reason: `ملف SVG مرفوض: يحتوي على ${label}. أزل العنصر ثم أعد المحاولة.` };
    }
  }

  if (!/<\s*svg\b/.test(text)) {
    return { ok: false, reason: "الملف لا يحتوي على وسم <svg>." };
  }

  return { ok: true };
}

/**
 * What the file *claims* to be, from its extension. The upload contract is "the claim must match the
 * bytes": a JPEG named `.png` is refused rather than silently retyped, because the editor chose that
 * name and any consumer of the filename will believe it.
 */
export const MIME_BY_EXTENSION: Record<string, AllowedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export const expectedMimeFromExtension = (filename: string): AllowedMimeType | null =>
  MIME_BY_EXTENSION[extensionOf(filename)] ?? null;

/** Extension of a filename, lowercased and without the dot. */
export function extensionOf(filename: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match ? match[1]!.toLowerCase() : "";
}

export function isForbiddenExtension(filename: string): boolean {
  return (FORBIDDEN_EXTENSIONS as readonly string[]).includes(extensionOf(filename));
}

/**
 * Deterministic, path-safe stored filename (§26).
 *
 * The rule: keep the editor's name (so the library stays searchable and human), but reduce it to a
 * conservative character set, keep the format extension derived from the CONTENT (not from what the
 * editor typed), and never let an executable extension survive. Payload adds a numeric suffix on
 * collision, so two files called `hero.png` cannot overwrite each other.
 */
export function safeStoredFilename(originalName: string, mimeType: AllowedMimeType): string {
  const base = originalName
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    /* Arabic letters are legitimate in a filename and Payload stores them fine; emoji, control
       characters, slashes, quotes and dots are not. */
    .replace(/[^\p{L}\p{N}\s._-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80)
    .toLowerCase();

  const extension: Record<AllowedMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };

  return `${base || "asset"}.${extension[mimeType]}`;
}
