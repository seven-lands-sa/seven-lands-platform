import { readFileSync } from "node:fs";
import sharp from "sharp";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" };

const jpeg = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 9, g: 9, b: 9 } } }).jpeg().toBuffer();
const png = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 30, g: 90, b: 30 } } }).png().toBuffer();
const oversize = Buffer.concat([png.subarray(0, 64), Buffer.alloc(11_000_000, 3)]);
const fakeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>`);

const attempt = async (label, name, buffer, mime) => {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), name);
  form.append("_payload", JSON.stringify({ alt: "probe" }));
  const response = await fetch(`${BASE}/api/media`, { method: "POST", headers: auth, body: form });
  const text = await response.text();
  console.log(`${label}: HTTP ${response.status} → ${text.slice(0, 220)}`);
};
await attempt("mismatch (jpg bytes named .png)", "photo.png", jpeg, "image/png");
await attempt("oversize (11MB png)", "huge.png", oversize, "image/png");
await attempt("dangerous svg", "evil.svg", fakeSvg, "image/svg+xml");
await attempt("junk bytes named .jpg", "notes.jpg", Buffer.from("just text, not an image"), "image/jpeg");
await attempt("clean png (control)", `probe-${Date.now()}.png`, png, "image/png");
