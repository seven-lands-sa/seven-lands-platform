/**
 * Public client-bundle measurement, identical method on both builds:
 * read the served HTML, take every <script src="/_next/static/...">, resolve it in that
 * build's .next directory and sum the on-disk bytes.
 */
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const sides = [
  { label: "BEFORE (pre-Payload, :3200)", origin: "http://127.0.0.1:3200", nextDir: "/home/user/.before-app/seven-lands-website/.next" },
  { label: "AFTER  (with Payload, :3000)", origin: "http://127.0.0.1:3000", nextDir: "/home/user/seven-lands-website/.next" },
];
const routes = ["/ar", "/en", "/ar/services", "/ar/start-a-project"];
const out = {};

for (const side of sides) {
  out[side.label] = {};
  for (const route of routes) {
    const html = await (await fetch(side.origin + route)).text();
    const srcs = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))].sort();
    let bytes = 0;
    for (const s of srcs) {
      const f = join(side.nextDir, s.replace("/_next", ""));
      if (!existsSync(f)) throw new Error(`missing ${f}`);
      bytes += statSync(f).size;
    }
    out[side.label][route] = { chunks: srcs.length, bytes };
  }
}

const pad = (v, n) => String(v).padEnd(n);
console.log(pad("route", 24) + pad("BEFORE chunks", 15) + pad("BEFORE bytes", 15) + pad("AFTER chunks", 14) + pad("AFTER bytes", 15) + "delta");
for (const route of routes) {
  const b = out["BEFORE (pre-Payload, :3200)"][route];
  const a = out["AFTER  (with Payload, :3000)"][route];
  const d = a.bytes - b.bytes;
  console.log(pad(route, 24) + pad(b.chunks, 15) + pad(b.bytes.toLocaleString("en-US"), 15) + pad(a.chunks, 14) + pad(a.bytes.toLocaleString("en-US"), 15) + (d >= 0 ? "+" : "") + d.toLocaleString("en-US"));
}
