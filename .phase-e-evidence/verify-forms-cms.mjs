/**
 * PHASE E final gate — FORM BEHAVIOUR · FORM SECURITY · UTM (§30, §94).
 *
 * The three pages migrated in this phase carry two live forms (the quick enquiry on /contact and the
 * brief on /start-a-project). Their transport, validation, honeypot and attribution are product
 * behaviour and must survive the migration untouched, so this script exercises the REAL endpoint the
 * CMS-rendered pages post to — /api/brief — from the outside, with an anonymous client.
 *
 * Nothing here inspects the browser: the browser half of the same gate is the Playwright suite
 * (`npm test`), which drives both forms on the CMS-rendered pages and asserts the campaign context
 * that reaches the payload.
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const fails = [];
const ok = (label, condition, detail = "") => {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) fails.push(label);
};

/**
 * Each independent check comes from its OWN client address, so one check can never be refused by
 * another's rate limit; the limiter itself is tested deliberately at the end (its guard is enabled
 * because the evidence runs against the production build).
 */
let ipCounter = 0;
const nextIp = () => `203.0.113.${++ipCounter}`;
const post = async (body, ip = nextIp()) => {
  const res = await fetch(`${BASE}/api/brief`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const valid = {
  mode: "brief",
  lands: ["strategy-business-growth"],
  goal: "نحتاج موقعًا يشرح خدماتنا ويقود العميل إلى التواصل بشكل واضح.",
  timeline: "quarter",
  name: "اختبار المرحلة هـ",
  phone: "0507776891",
  channel: "whatsapp",
  consent: true,
  campaign: { utm_source: "phase-e", utm_medium: "gate", utm_campaign: "equivalence" },
};

/* ── the pages really are CMS-rendered (the migration is what is being tested) ─────────────── */
const startHtml = await (await fetch(`${BASE}/ar/start-a-project`)).text();
const contactHtml = await (await fetch(`${BASE}/ar/contact`)).text();
ok(
  "start-a-project serves the CMS composition (brief form present)",
  startHtml.includes("أرسل تفاصيل المشروع") && startHtml.includes("ما يحدث بعد الإرسال"),
);
ok(
  "contact serves the CMS composition (quick enquiry present)",
  contactHtml.includes("استفسار سريع") && contactHtml.includes("قنوات التواصل"),
);

/* ── happy path ───────────────────────────────────────────────────────────────────────────── */
const good = await post(valid);
ok(
  "a valid brief is accepted (202, no destination configured yet)",
  good.status === 202 && good.body?.ok === true && good.body?.delivered === false,
  `HTTP ${good.status} ${JSON.stringify(good.body)}`,
);

/* ── validation is server-side, not only in the browser ───────────────────────────────────── */
const shortGoal = await post({ ...valid, goal: "قصير" });
ok(
  "a too-short goal is refused server-side with a field path",
  shortGoal.status === 422 && shortGoal.body?.error === "validation_failed" && shortGoal.body.issues?.includes("goal"),
  `HTTP ${shortGoal.status} issues=${JSON.stringify(shortGoal.body?.issues)}`,
);

const noConsent = await post({ ...valid, consent: false });
ok("submitting without consent is refused", noConsent.status === 422, `HTTP ${noConsent.status}`);

const badPhone = await post({ ...valid, phone: "12345" });
ok(
  "an invalid Saudi mobile is refused",
  badPhone.status === 422 && badPhone.body.issues?.includes("phone"),
  `HTTP ${badPhone.status} issues=${JSON.stringify(badPhone.body?.issues)}`,
);

const noLands = await post({ ...valid, lands: [] });
ok("a brief with no capability selected is refused", noLands.status === 422, `HTTP ${noLands.status}`);

const oversizedCampaign = await post({ ...valid, campaign: { utm_source: "x".repeat(200) } });
ok("an oversized attribution value is refused (bounded input)", oversizedCampaign.status === 422, `HTTP ${oversizedCampaign.status}`);

const brokenJson = await post("{not json", nextIp());
ok("malformed JSON is refused cleanly", brokenJson.status === 400, `HTTP ${brokenJson.status}`);

/* ── honeypot: silently accepted, never delivered, never an error ─────────────────────────── */
const trap = await post({ ...valid, website: "http://spam.example" });
ok(
  "the honeypot accepts silently and delivers nothing",
  trap.status === 200 && trap.body?.ok === true && trap.body?.delivered === false,
  `HTTP ${trap.status} ${JSON.stringify(trap.body)}`,
);

/* ── no PII in refusals ───────────────────────────────────────────────────────────────────── */
const leakCheck = JSON.stringify(shortGoal.body ?? {}) + JSON.stringify(noConsent.body ?? {});
ok(
  "refusals carry field paths only — no submitted values echoed back",
  !leakCheck.includes("اختبار المرحلة") && !leakCheck.includes("0507776891"),
);

/* ── attribution format accepted exactly as the browser sends it ───────────────────────────── */
const attribution = await post({
  ...valid,
  mode: "quick",
  lands: ["branding-creative"],
  campaign: { utm_source: "snapchat", utm_medium: "cpc", utm_campaign: "oct_launch", gclid: "abc123" },
});
ok("campaign + gclid are accepted on the quick enquiry too", attribution.status === 202, `HTTP ${attribution.status}`);

/* ── rate limit: the seventh submission from one address is refused, and only then ───────────── */
const ip = nextIp();
const codes = [];
for (let i = 0; i < 7; i += 1) codes.push((await post(valid, ip)).status);
ok(
  "the first six submissions from one address are accepted",
  codes.slice(0, 6).every((code) => code === 202),
  `codes=${codes.join(",")}`,
);
ok("the seventh is rate limited", codes[6] === 429, `codes=${codes.join(",")}`);

console.log(`\nFORM GATE: ${fails.length === 0 ? "ALL GREEN" : `${fails.length} FAILED`}`);
if (fails.length) {
  for (const failure of fails) console.log(`  FAIL ${failure}`);
  process.exitCode = 1;
}
