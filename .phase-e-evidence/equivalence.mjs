/**
 * PHASE E §42/§44 — static-vs-CMS equivalence.
 *
 * Method: the same URL is fetched twice through the live server.
 *   1. with the CMS page PUBLISHED for the locale  → the CMS composition renders,
 *   2. after UNPUBLISHING that locale              → the shipped static composition renders.
 *
 * Both bodies are reduced to their visible text (scripts, styles, comments and whitespace removed)
 * and compared. Equality means the migration reproduced the shipped copy exactly — nothing retyped,
 * paraphrased or dropped. The run always ends by restoring the published state it started from.
 *
 * Usage: node .phase-e-evidence/equivalence.mjs [home privacy terms]
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const PAGES = {
  home: { systemKey: "home", path: "" },
  about: { systemKey: "about", path: "/about" },
  contact: { systemKey: "contact", path: "/contact" },
  "start-a-project": { systemKey: "start-a-project", path: "/start-a-project" },
  privacy: { systemKey: "privacy", path: "/privacy" },
  terms: { systemKey: "terms", path: "/terms" },
};
const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES);
const LOCALES = ["ar", "en"];

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };

const pageId = async (systemKey) => {
  const res = await fetch(`${BASE}/api/pages?where[systemKey][equals]=${systemKey}&limit=1&draft=true&locale=ar`, { headers: auth });
  const body = await res.json();
  return body.docs?.[0]?.id;
};

/** Visible text only: no scripts, styles, comments, tags or run-together whitespace. */
const visibleText = (html) =>
  html
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

const fetchText = async (path) => visibleText(await (await fetch(`${BASE}${path}`)).text());

let failures = 0;
for (const key of targets) {
  const id = await pageId(PAGES[key].systemKey);
  if (!id) {
    console.log(`${key}: page not found`);
    failures += 1;
    continue;
  }

  for (const locale of LOCALES) {
    const url = `/${locale}${PAGES[key].path}`;

    const cms = await fetchText(url);

    const off = await fetch(`${BASE}/api/pages/${id}/unpublish`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ locales: [locale] }),
    });
    if (!off.ok) {
      console.log(`${key} ${locale}: could not unpublish (${off.status}) — skipping`);
      failures += 1;
      continue;
    }
    const staticHtml = await fetchText(url);

    /* Restore immediately: the site must never be left in the temporary state. */
    const on = await fetch(`${BASE}/api/pages/${id}/publish`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ locales: [locale] }),
    });
    if (!on.ok) {
      console.log(`${key} ${locale}: REPUBLISH FAILED (${on.status}) — run publish-pages.mjs publish ${key}`);
      failures += 1;
    }

    const same = cms === staticHtml;
    console.log(`${key} ${locale} (${url}): cms=${cms.length} chars · static=${staticHtml.length} chars · equal=${same ? "YES" : "NO"}`);
    if (!same) {
      failures += 1;
      const a = cms.split(" ");
      const b = staticHtml.split(" ");
      const firstDiff = a.findIndex((token, index) => token !== b[index]);
      console.log(`  first difference at word ${firstDiff}:`);
      console.log(`   cms   : …${a.slice(Math.max(0, firstDiff - 6), firstDiff + 10).join(" ")}…`);
      console.log(`   static: …${b.slice(Math.max(0, firstDiff - 6), firstDiff + 10).join(" ")}…`);
      console.log(`   cms words=${a.length} static words=${b.length}`);
    }
  }
}

console.log(failures === 0 ? "\nEQUIVALENCE: PASS (every locale byte-equal in visible text)" : `\nEQUIVALENCE: ${failures} mismatch(es)`);
