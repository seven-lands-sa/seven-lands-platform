/**
 * AUDIT — read-only probes of the running application: public routes, SEO surfaces, headers,
 * protected surfaces, sitemap and robots. Mutates nothing.
 *
 * Usage: node .audit/probe-public.mjs
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const ES = ["strategy-business-growth","branding-creative","content-production","social-digital-presence","performance-acquisition","web-commerce-experiences","software-automation-technology"];

const ROUTES = [
  "",
  "/services",
  ...ES.map((s) => `/services/${s}`),
  "/work",
  "/insights",
  "/about",
  "/contact",
  "/start-a-project",
  "/privacy",
  "/terms",
  "/this-page-does-not-exist",
];

const grab = (html, re) => {
  const match = html.match(re);
  return match ? match[1].trim() : null;
};

const decode = (value) =>
  value === null ? null : value.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

const rows = [];
for (const locale of ["ar", "en"]) {
  for (const path of ROUTES) {
    const url = `${BASE}/${locale}${path}`;
    const res = await fetch(url, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    const title = decode(grab(html, /<title>([\s\S]*?)<\/title>/i));
    const description = decode(grab(html, /<meta name="description" content="([^"]*)"/i));
    const canonical = grab(html, /<link rel="canonical" href="([^"]*)"/i);
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)].map((m) => `${m[1]}=${m[2]}`);
    const ogImage = grab(html, /<meta property="og:image" content="([^"]*)"/i);
    const ogTitle = decode(grab(html, /<meta property="og:title" content="([^"]*)"/i));
    const twitter = grab(html, /<meta name="twitter:card" content="([^"]*)"/i);
    const robotsMeta = grab(html, /<meta name="robots" content="([^"]*)"/i);
    const types = [...html.matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1]);
    rows.push({
      route: `/${locale}${path}`,
      status: res.status,
      title: title ? title.slice(0, 60) : null,
      description: description ? `${description.length} chars` : null,
      canonical,
      alternates: alternates.length,
      hreflang: alternates.join(" "),
      ogImage: ogImage ? ogImage.replace(BASE, "").slice(0, 48) : null,
      ogTitle: ogTitle ? ogTitle.slice(0, 40) : null,
      twitter,
      robotsMeta,
      schemaTypes: [...new Set(types)].join(","),
    });
  }
}

console.log("=== PUBLIC ROUTES (served HTML) ===");
for (const row of rows) {
  console.log(
    `${row.route.padEnd(48)} ${String(row.status).padEnd(4)} title=${row.title ?? "-"} | desc=${row.description ?? "-"} | canon=${row.canonical ? "yes" : "NO"} | alt=${row.alternates} | og=${row.ogImage ?? "-"} | robots=${row.robotsMeta ?? "-"} | ld=${row.schemaTypes || "-"}`,
  );
}

const homeAr = await fetch(`${BASE}/ar`);
console.log("\n=== CANONICAL + HREFLANG SAMPLE (/ar/services) ===");
const servicesAr = await (await fetch(`${BASE}/ar/services`)).text();
console.log([...servicesAr.matchAll(/<link rel="(canonical|alternate)"[^>]*>/gi)].map((m) => m[0]).join("\n"));

console.log("\n=== SECURITY HEADERS (GET /ar) ===");
for (const [key, value] of [...homeAr.headers.entries()].sort()) console.log(`  ${key}: ${String(value).slice(0, 220)}`);

console.log("\n=== ROBOTS.TXT ===");
console.log((await (await fetch(`${BASE}/robots.txt`)).text()).trim());

console.log("\n=== SITEMAP ===");
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`urls: ${locs.length}`);
console.log(`includes privacy/terms: ${locs.some((u) => /privacy|terms/.test(u))}`);
for (const loc of locs) console.log(`  ${loc}`);
const sample = sitemap.split("<url>")[1] ?? "";
console.log(`alternates in sitemap entry sample: ${(sample.match(/hreflang/g) ?? []).length}`);

console.log("\n=== PROTECTED SURFACES (anonymous) ===");
const probes = [
  ["/admin", "GET"],
  ["/api/users", "GET"],
  ["/api/pages?limit=1", "GET"],
  ["/api/services?limit=1&draft=true", "GET"],
  ["/api/media?limit=1", "GET"],
  ["/api/audit-events?limit=1", "GET"],
  ["/api/globals/site-settings", "GET"],
  ["/api/graphql-playground", "GET"],
  ["/api/brief", "POST"],
];
for (const [path, method] of probes) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    redirect: "manual",
    ...(method === "POST" ? { headers: { "content-type": "application/json" }, body: "{}" } : {}),
  });
  const location = res.headers.get("location");
  console.log(`  ${method} ${path.padEnd(38)} → ${res.status}${location ? ` → ${location.slice(0, 60)}` : ""}`);
}

const introspection = await fetch(`${BASE}/api/graphql`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: "{ __schema { queryType { name } } }" }),
});
console.log(`  POST /api/graphql (anonymous introspection) → ${introspection.status} ${(await introspection.text()).slice(0, 120)}`);

console.log("\n=== PREVIEW SURFACE (anonymous) ===");
for (const url of [`${BASE}/ar/preview?path=/services`, `${BASE}/ar/preview`, `${BASE}/ar/preview?path=/does-not-exist`]) {
  const res = await fetch(url, { redirect: "manual" });
  const body = res.status === 200 ? (await res.text()).slice(0, 120).replace(/\s+/g, " ") : "";
  console.log(`  ${url.replace(BASE, "")} → ${res.status} ${res.headers.get("location") ?? ""} ${body}`);
}
