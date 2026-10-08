// Identical measurement method for both builds: fetch the served HTML, extract
// every <script src="/_next/static/...">, resolve it inside that build's .next
// directory and sum the on-disk bytes. Prints per-route chunk count + total.
import { readFileSync, existsSync, statSync } from "node:fs";

const targets = [
  { label: "BEFORE (pre-Phase-A build)", origin: "http://127.0.0.1:3200", nextDir: "/tmp/before/seven-lands-website/.next" },
  { label: "AFTER  (Phase A build)     ", origin: "http://127.0.0.1:3000", nextDir: "/home/user/seven-lands-website/.next" },
];
const routes = ["/ar", "/en", "/ar/services", "/ar/start-a-project"];
const results = {};

for (const t of targets) {
  results[t.label] = {};
  for (const route of routes) {
    const html = await (await fetch(t.origin + route)).text();
    const srcs = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))].sort();
    let total = 0, missing = 0;
    for (const s of srcs) {
      const f = t.nextDir + s.replace("/_next", "");
      if (existsSync(f)) total += statSync(f).size; else missing++;
    }
    results[t.label][route] = { chunks: srcs.length, bytes: total, missing };
  }
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("route", 24) + pad("BEFORE chunks", 15) + pad("BEFORE bytes", 14) + pad("AFTER chunks", 14) + pad("AFTER bytes", 14) + "delta bytes");
const B = "BEFORE (pre-Phase-A build)", A = "AFTER  (Phase A build)     ";
for (const r of routes) {
  const b = results[B][r], a = results[A][r];
  const d = a.bytes - b.bytes;
  console.log(pad(r, 24) + pad(b.chunks, 15) + pad(b.bytes.toLocaleString("en-US"), 14) + pad(a.chunks, 14) + pad(a.bytes.toLocaleString("en-US"), 14) + (d >= 0 ? "+" : "") + d.toLocaleString("en-US"));
}
const mb = Object.entries(results).map(([k, v]) => `${k}: missing-files=${Object.values(v).reduce((s, x) => s + x.missing, 0)}`);
console.log("\nsanity — every referenced chunk resolved?", mb.join(" | "));
