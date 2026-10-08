/**
 * PHASE F §42/§44 — Services equivalence harness.
 *
 * Method: the same URLs are fetched through the live server in several states and reduced to their
 * VISIBLE TEXT (scripts, styles, comments and whitespace removed). Comparing states byte for byte is
 * what proves the migration.
 *
 *   capture <label>   fetch the current state into .phase-f-evidence/text/<label>/
 *   compare <a> <b>   diff two captured labels
 *   publish           publish all seven capabilities, both locales (the real gated endpoint)
 *   publish-ar        publish only the Arabic locale (mixed-state proof)
 *   unpublish         return all seven to drafts
 *   state             print the stored publication state from the database
 *
 * Usage: node .phase-f-evidence/equivalence-services.mjs capture pre
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const LANDS = [
  "strategy-business-growth",
  "branding-creative",
  "content-production",
  "social-digital-presence",
  "performance-acquisition",
  "web-commerce-experiences",
  "software-automation-technology",
];

/** Every public surface a capability appears on, plus the two index pages and the sitemap. */
const PATHS = [
  "",
  "/services",
  ...LANDS.map((slug) => `/services/${slug}`),
  "/work",
  "/insights",
  "/sitemap.xml",
];

const LOCALES = ["ar", "en"];
const OUT = new URL("./text/", import.meta.url);

const visibleText = (body) =>
  body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const login = async () => {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  return { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
};

const ids = async (auth) => {
  const res = await fetch(`${BASE}/api/services?limit=20&draft=true&locale=ar&depth=0`, { headers: auth });
  const body = await res.json();
  return (body.docs ?? []).map((doc) => ({ id: doc.id, landKey: doc.landKey }));
};

const setState = async (auth, locales) => {
  const docs = await ids(auth);
  if (docs.length !== 7) throw new Error(`expected 7 capability documents, found ${docs.length}`);
  const results = [];
  for (const doc of docs) {
    const res = await fetch(`${BASE}/api/services/${doc.id}/${locales.length ? "publish" : "unpublish"}`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(locales.length ? { locales } : { locales: ["ar", "en"] }),
    });
    const body = await res.json().catch(() => ({}));
    results.push({ landKey: doc.landKey, status: res.status, ok: body.ok, published: body.published, errors: body.errors });
  }
  return results;
};

const capture = async (label) => {
  const dir = new URL(`${label}/`, OUT);
  mkdirSync(dir, { recursive: true });
  const summary = [];
  for (const locale of LOCALES) {
    for (const path of PATHS) {
      const url = `${BASE}/${locale}${path}`;
      const res = await fetch(url, { headers: { "user-agent": "seven-lands-phase-f" } });
      const body = await res.text();
      const file = `${locale}${path.replace(/\//g, "_") || "_home"}.txt`;
      writeFileSync(new URL(file, dir), visibleText(body), "utf8");
      summary.push(`${locale}${path || "/"} ${res.status} ${visibleText(body).length}`);
    }
  }
  writeFileSync(new URL(`${label}.log`, OUT), summary.join("\n"), "utf8");
  console.log(summary.join("\n"));
};

const compare = (a, b) => {
  const dirA = new URL(`${a}/`, OUT);
  const dirB = new URL(`${b}/`, OUT);
  const files = readdirSync(dirA).sort();
  let same = 0;
  const diffs = [];
  for (const file of files) {
    const left = readFileSync(new URL(file, dirA), "utf8");
    const right = readFileSync(new URL(file, dirB), "utf8");
    if (left === right) {
      same += 1;
      continue;
    }
    const at = [...left].findIndex((char, index) => char !== right[index]);
    diffs.push(`${file}\n  A[${left.length}]: …${left.slice(Math.max(0, at - 60), at + 90)}…\n  B[${right.length}]: …${right.slice(Math.max(0, at - 60), at + 90)}…`);
  }
  console.log(`${a} vs ${b}: ${same}/${files.length} byte-identical`);
  if (diffs.length) console.log(diffs.join("\n"));
  return diffs.length;
};

const auth = await login();
const [, , command, arg] = process.argv;

if (command === "capture") {
  await capture(arg ?? "current");
} else if (command === "compare") {
  const failed = compare(arg, process.argv[4]);
  process.exitCode = failed ? 1 : 0;
} else if (command === "publish") {
  console.log(JSON.stringify(await setState(auth, ["ar", "en"]), null, 0));
} else if (command === "publish-ar") {
  console.log(JSON.stringify(await setState(auth, ["ar"]), null, 0));
} else if (command === "unpublish") {
  console.log(JSON.stringify(await setState(auth, []), null, 0));
} else if (command === "state") {
  const res = await fetch(`${BASE}/api/services?limit=20&draft=true&locale=ar&depth=0`, { headers: auth });
  const body = await res.json();
  const state = (body.docs ?? []).map((doc) => `${doc.landKey} ar:${doc.localeState?.ar?.state ?? "draft"} en:${doc.localeState?.en?.state ?? "draft"}`);
  console.log(state.join("\n"));
} else {
  console.error("usage: capture <label> | compare <a> <b> | publish | publish-ar | unpublish | state");
  process.exit(2);
}
