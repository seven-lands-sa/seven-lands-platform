/**
 * ADMIN ↔ PUBLIC BUNDLE CONTAINMENT
 * 1. every file under .next/static
 * 2. which of them the public routes actually load
 * 3. the remainder is admin/API-only — does any of it leak into public HTML?
 * 4. do the public chunks contain Payload code at all?
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const all = walk(".next/static").filter((f) => /\.(js|css)$/.test(f));
const toUrl = (p) => "/_next/" + relative(".next", p);

const publicRoutes = [
  "/ar", "/en", "/ar/services", "/en/services", "/ar/services/branding-creative",
  "/ar/work", "/ar/insights", "/ar/about", "/ar/start-a-project", "/en/start-a-project",
  "/ar/contact", "/ar/privacy",
];

const referenced = new Set();
for (const route of publicRoutes) {
  const html = await (await fetch("http://127.0.0.1:3000" + route)).text();
  for (const m of html.matchAll(/(?:_next\/static\/[^"'\\\s]+\.(?:js|css))/g)) referenced.add("/" + m[0]);
}

const publicAssets = all.filter((f) => referenced.has(toUrl(f)));
const adminAssets = all.filter((f) => !referenced.has(toUrl(f)));
const sum = (list) => list.reduce((t, f) => t + statSync(f).size, 0);

console.log("static assets in the build ..........", all.length, "(js + css)");
console.log("loaded by the 12 public routes ......", publicAssets.length, "files —", sum(publicAssets).toLocaleString("en-US"), "B");
console.log("admin / api only ....................", adminAssets.length, "files —", sum(adminAssets).toLocaleString("en-US"), "B");
console.log("overlap .............................", publicAssets.filter((f) => adminAssets.includes(f)).length);

const markers = ["payloadcms", "@payloadcms", "create-first-user", "payload.config"];
for (const marker of markers) {
  const inPublic = publicAssets.filter((f) => readFileSync(f, "utf8").includes(marker));
  const inAdmin = adminAssets.filter((f) => readFileSync(f, "utf8").includes(marker));
  console.log(
    `marker ${JSON.stringify(marker).padEnd(20)} public: ${inPublic.length}   admin-only: ${inAdmin.length}` +
      (inAdmin.length ? `  (e.g. ${inAdmin.slice(0, 2).map(toUrl).join(", ")})` : ""),
  );
}

const biggest = adminAssets
  .map((f) => [toUrl(f), statSync(f).size])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 4);
console.log("\nlargest admin-only assets:");
for (const [url, size] of biggest) console.log("  ", size.toLocaleString("en-US").padStart(10), "B ", url.split("/").pop());

// And the reverse: what does /admin load that public never does?
const adminHtml = await (await fetch("http://127.0.0.1:3000/admin")).text();
const adminRefs = new Set([...adminHtml.matchAll(/(?:_next\/static\/[^"'\\\s]+\.(?:js|css))/g)].map((m) => "/" + m[0]));
const adminOnly = [...adminRefs].filter((u) => !referenced.has(u));
console.log(`\n/admin references ${adminRefs.size} static files, ${adminOnly.length} of which no public route references`);
