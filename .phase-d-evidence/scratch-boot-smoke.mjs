/**
 * §43/§44 smoke on a freshly migrated database: an instance booted against a database that contains
 * nothing but the migrations + seeds must be able to (a) serve the public site, (b) authenticate an
 * admin, (c) run the media pipeline end to end, and (d) still refuse private bytes to anonymous
 * visitors. Run with BASE=http://127.0.0.1:3100 and MEDIA_SCRATCH=1 against the scratch instance.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3100";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

let passed = 0;
let failed = 0;
const check = (ok, label, detail = "") => {
  if (ok) {
    passed += 1;
    console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ""}`);
  }
};

/* (d) public site on a fresh database */
const home = await fetch(`${BASE}/ar`);
check(home.status === 200, "public site serves from the migrated database", `HTTP ${home.status}`);
const adminPage = await fetch(`${BASE}/admin/login`);
check(adminPage.status === 200, "admin boots and renders its login screen", `HTTP ${adminPage.status}`);

/* (b) authentication with the seeded owner */
const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: BASE },
  body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }),
});
check(login.ok, "the seeded owner can log in", `HTTP ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" };

/* (c) the media pipeline on that database */
const png = await sharp({ create: { width: 900, height: 600, channels: 3, background: { r: 18, g: 52, b: 84 } } })
  .png()
  .toBuffer();
const form = new FormData();
form.append("file", new Blob([new Uint8Array(png)], { type: "image/png" }), "scratch-boot.png");
form.append("_payload", JSON.stringify({ alt: "اختبار قاعدة جديدة" }));
const upload = await fetch(`${BASE}/api/media`, { method: "POST", headers: auth, body: form });
const doc = (await upload.json())?.doc;
check(upload.status === 201, "upload works on the fresh database", `HTTP ${upload.status}`);
check(doc?.visibility === "private", "new uploads are still private by default", String(doc?.visibility));
check(doc?.sizes?.thumbnail?.url != null, "derivatives are generated", String(doc?.sizes?.thumbnail?.url));

const fileURL = `${BASE}${new URL(doc.url, BASE).pathname}`;
const derivativeURL = `${BASE}${new URL(doc.sizes.card.url, BASE).pathname}`;
check((await fetch(fileURL)).status === 403, "anonymous cannot fetch a private original", `HTTP ${await (await fetch(fileURL)).status}`);
check((await fetch(derivativeURL)).status === 403, "anonymous cannot fetch a private derivative");

await fetch(`${BASE}/api/media/${doc.id}`, {
  method: "PATCH",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ visibility: "public" }),
});
check((await fetch(fileURL)).status === 200, "after PUBLIC, anonymous gets the original", `HTTP ${(await fetch(fileURL)).status}`);
check((await fetch(derivativeURL)).status === 200, "after PUBLIC, anonymous gets the derivative");

const removed = await fetch(`${BASE}/api/media/${doc.id}`, { method: "DELETE", headers: auth });
check(removed.ok, "the fixture deletes cleanly", `HTTP ${removed.status}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
