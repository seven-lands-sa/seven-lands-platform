const BASE = "http://127.0.0.1:3000";
const email = process.env.SEED_SUPER_ADMIN_EMAIL, password = process.env.SEED_SUPER_ADMIN_PASSWORD;
const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
console.log("login:", login.status);
for (const url of ["/ar/preview?path=/services", "/ar/preview?path=/services/branding-creative", "/en/preview", "/ar/preview?path=/not-a-real-page"]) {
  const res = await fetch(`${BASE}${url}`, { headers: { cookie }, redirect: "manual" });
  const body = res.status === 200 ? await res.text() : "";
  const robots = body.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? null;
  const hasPreviewMark = /preview|معاينة|مسودة/i.test(body);
  console.log(`${url} → ${res.status} robots=${robots} previewMarkup=${hasPreviewMark} len=${body.length} cache=${res.headers.get("cache-control")}`);
}
const gql = await fetch(`${BASE}/api/graphql`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ query: "{ Pages { totalDocs } }" }) });
console.log("authenticated graphql:", gql.status, (await gql.text()).slice(0, 120));
