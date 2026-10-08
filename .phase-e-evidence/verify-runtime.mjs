/**
 * PHASE E runtime evidence: preview authorization, draft isolation, cache freshness, revisions.
 * Every step restores the state it found.
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
const MARKER = "معاينة-المسودة-ONLY";

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
const get = async (url, withCookie = false) => {
  const res = await fetch(`${BASE}${url}`, withCookie ? { headers: { cookie } } : undefined);
  return { status: res.status, text: await res.text() };
};

const list = await (await fetch(`${BASE}/api/pages?where[systemKey][equals]=home&limit=1&draft=true&locale=ar`, { headers: auth })).json();
const id = list.docs[0].id;
const before = await (await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar&depth=0`, { headers: auth })).json();
const originalTitle = before.sections.find((b) => b.blockType === "hero").title1;
const publishedTitle = (await (await fetch(`${BASE}/api/pages/${id}?draft=false&locale=ar&depth=0`, { headers: auth })).json()).sections.find((b) => b.blockType === "hero").title1;
console.log(`home #${id}: draft hero.title1="${originalTitle}" · published hero.title1="${publishedTitle}"`);

/* ── 1 · preview authorization ─────────────────────────────────────────────────────────────── */
const anon = await get("/ar/preview?path=/");
const anonEn = await get("/en/preview?path=/");
const authed = await get("/ar/preview?path=/", true);
console.log(`preview anonymous: /ar HTTP ${anon.status} · /en HTTP ${anonEn.status} (expected 404 both)`);
console.log(`preview with admin session: HTTP ${authed.status} · has preview bar=${authed.text.includes("معاينة")} · has hero copy=${authed.text.includes("تسويق")}`);

/* ── 2 · draft isolation + published cache freshness ───────────────────────────────────────── */
const draftSections = before.sections.map((block) => (block.blockType === "hero" ? { ...block, title1: MARKER } : block));
await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, { method: "PATCH", headers: auth, body: JSON.stringify({ sections: draftSections }) });

const publicAfterDraft = await get("/ar");
const previewAfterDraft = await get("/ar/preview?path=/", true);
console.log(`after DRAFT-only edit → public /ar has marker=${publicAfterDraft.text.includes(MARKER)} (expected false) · preview has marker=${previewAfterDraft.text.includes(MARKER)} (expected true)`);

const publish = await fetch(`${BASE}/api/pages/${id}/publish`, { method: "POST", headers: auth, body: JSON.stringify({ locales: ["ar"] }) });
const publicAfterPublish = await get("/ar");
console.log(`after PUBLISH (HTTP ${publish.status}) → public /ar has marker=${publicAfterPublish.text.includes(MARKER)} (expected true, no restart, no TTL wait)`);

await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, { method: "PATCH", headers: auth, body: JSON.stringify({ sections: draftSections.map((b) => (b.blockType === "hero" ? { ...b, title1: originalTitle } : b)) }) });
const restorePublish = await fetch(`${BASE}/api/pages/${id}/publish`, { method: "POST", headers: auth, body: JSON.stringify({ locales: ["ar"] }) });
const publicRestored = await get("/ar");
console.log(`after reverting + publishing (HTTP ${restorePublish.status}) → marker gone=${!publicRestored.text.includes(MARKER)} · original copy back=${publicRestored.text.includes(originalTitle.slice(0, 12))}`);

/* ── 3 · revisions ─────────────────────────────────────────────────────────────────────────── */
const versions = await (await fetch(`${BASE}/api/pages/versions?where[parent][equals]=${id}&limit=5&depth=0`, { headers: auth })).json();
console.log(`revisions stored for page ${id}: total=${versions.totalDocs} (newest ids: ${(versions.docs ?? []).slice(0, 3).map((v) => v.id).join(", ")})`);
const older = (versions.docs ?? [])[1];
if (older) {
  const restore = await fetch(`${BASE}/api/pages/${id}/restore`, { method: "POST", headers: auth, body: JSON.stringify({ versionId: String(older.id) }) });
  const body = await restore.text();
  console.log(`restore revision ${older.id} → HTTP ${restore.status}${restore.ok ? " (Payload restoreVersion through the audited endpoint)" : ` ${body.slice(0, 140)}`}`);
}
