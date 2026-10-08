/**
 * PHASE E §24/§25 — the media gate, end to end, through the real endpoints.
 *
 * A private, English-alt-less fixture is uploaded, attached to the home page's hero in the DRAFT
 * only, and the publish endpoint is asked for a verdict. Everything is then reverted and the
 * fixture deleted, so media returns to 0 and the published page is untouched.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const env = readFileSync(".env", "utf8");
const EMAIL = env.match(/SEED_SUPER_ADMIN_EMAIL=(.*)/)?.[1]?.trim();
const PASSWORD = env.match(/SEED_SUPER_ADMIN_PASSWORD=(.*)/)?.[1]?.trim();

const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
/* Never send the JSON content-type on a multipart upload: it overrides the boundary and Payload
   then answers "Invalid JSON" (measured). */
const uploadHeaders = { cookie, origin: BASE, "sec-fetch-site": "same-origin" };

const home = await (await fetch(`${BASE}/api/pages?where[systemKey][equals]=home&limit=1&draft=true&locale=ar`, { headers: auth })).json();
const id = home.docs[0].id;
const draftAr = await (await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar&depth=0`, { headers: auth })).json();

/* 1 · a private fixture with Arabic alt only */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#dfe7f0"/><circle cx="420" cy="140" r="90" fill="#7A9CC6"/></svg>`;
const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
const form = new FormData();
form.append("file", new Blob([new Uint8Array(buffer)], { type: "image/png" }), "gate-check.png");
/* Plain form fields (not `_payload`): Payload's multipart parser rejected the JSON body with
   "Invalid JSON" here, and the documented alternative is one field per value with `?locale=` naming
   the language being written — which is also exactly the §1 rule for this project. */
form.append("visibility", "private");
form.append("alt", "صورة فحص");
form.append("caption", "فحص");
const uploaded = await fetch(`${BASE}/api/media?locale=ar`, { method: "POST", headers: uploadHeaders, body: form });
const uploadedBody = await uploaded.json();
if (!uploaded.ok) {
  console.log(`upload failed: HTTP ${uploaded.status}`, JSON.stringify(uploadedBody).slice(0, 400));
  process.exit(1);
}
const asset = uploadedBody.doc;
console.log(`fixture uploaded: #${asset.id} ${asset.filename} visibility=${asset.visibility}`);
const altEn = await (await fetch(`${BASE}/api/media/${asset.id}?locale=en&depth=0`, { headers: auth })).json();
console.log(`fixture English alt: ${JSON.stringify(altEn.alt)} (no cross-language fallback expected)`);

/* 2 · attach it to the AR draft hero (media is stored, not displayed, in this release) */
const patched = { ...draftAr, sections: draftAr.sections.map((block) => (block.blockType === "hero" ? { ...block, media: asset.id } : block)) };
await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, { method: "PATCH", headers: auth, body: JSON.stringify({ sections: patched.sections }) });

const status = await (await fetch(`${BASE}/api/pages/${id}/publish-status`, { headers: auth })).json();
const mediaBlockers = (status.blockers ?? []).filter((b) => b.kind === "media");
console.log(`publish status: ar=${status.perLocale.ar.ok ? "ok" : "blocked"} en=${status.perLocale.en.ok ? "ok" : "blocked"} · media blockers=${mediaBlockers.length}`);
for (const blocker of mediaBlockers.slice(0, 3)) console.log(`  · [${blocker.kind}/${blocker.locale}] ${blocker.message}`);
const named = mediaBlockers.some((b) => (b.message ?? "").includes("gate-check.png")) || mediaBlockers.some((b) => (b.message ?? "").includes("خاص"));
console.log(`media blocker names the asset or its privacy: ${named}`);

const publish = await fetch(`${BASE}/api/pages/${id}/publish`, { method: "POST", headers: auth, body: JSON.stringify({ locales: ["ar", "en"] }) });
console.log(`publish attempt → HTTP ${publish.status} (expected 400: nothing published)`);
const after = await (await fetch(`${BASE}/api/media/${asset.id}?locale=ar&depth=0`, { headers: auth })).json();
console.log(`asset visibility after the blocked publish: ${after.visibility} (expected private — never silently changed)`);

/* 3 · revert and clean up */
await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, { method: "PATCH", headers: auth, body: JSON.stringify({ sections: draftAr.sections }) });
const removed = await fetch(`${BASE}/api/media/${asset.id}`, { method: "DELETE", headers: auth });
console.log(`fixture deleted → HTTP ${removed.status}`);
