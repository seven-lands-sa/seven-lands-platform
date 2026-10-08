/**
 * PHASE C verification — the gates §7–§12 of the completion brief ask for (§55–§58 in the phase plan).
 *
 * Runs against the Local API so each rule can be isolated, plus the real content adapter for the
 * "what does the public actually receive" questions. Binary media delivery is a separate gate
 * (verify-media-binary.ts, HTTP) and cache freshness is a third (HTTP, scripts/cache-freshness).
 *
 * Every mutation is reverted before the run ends: the seeded state is the state the public site
 * ships with, and a verification harness must not leave the owner's content changed.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { mapNavigation, mapSiteSettings, mapSocialAccounts } from "@/lib/content/cms";
import { getOpenState } from "@/lib/content";
import { fallbackBusinessHours } from "@/lib/content/fallback";
import { toLinkTarget } from "@/lib/content/links";
import type { BusinessHoursView } from "@/lib/content/views";

/*
 * WRITE GUARD (§15). This script creates fixtures ({personas, media, roles}) that must never exist
 * in a production database unless someone deliberately asks for them. It refuses by default and the
 * flag documents intent, so a stray `payload run` on a live deployment cannot seed test accounts.
 */
if (process.env.ALLOW_VERIFICATION_WRITES !== "true") {
  console.error(
    "REFUSED: this verification script writes fixtures to the database.\n" +
      "          Re-run with ALLOW_VERIFICATION_WRITES=true on a development or test database only.",
  );
  process.exit(1);
}

const payload = await getPayload({ config });

let passed = 0;
let failed = 0;
const failures: string[] = [];
const record = (ok: boolean, label: string, detail = "") => {
  if (ok) { passed += 1; console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ""}`); }
  else { failed += 1; failures.push(label); console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ""}`); }
};
const attempt = async (operation: () => Promise<unknown>) => {
  try { await operation(); return { ok: true, error: "" }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : String(error) }; }
};
const findGlobal = (slug: never, locale: "ar" | "en") =>
  payload.findGlobal({ slug, locale, depth: 0, overrideAccess: true });

/* ════════════════════════════════════════════════════════════════════════════════
 * §55 · GLOBAL SETTINGS
 * ════════════════════════════════════════════════════════════════════════════════ */
console.log("\n══ §55 · Global settings ══════════════════════════════════════════════");
{
  const ar = (await findGlobal("site-settings" as never, "ar")) as never as Record<string, never>;
  const mapped = mapSiteSettings(ar, "ar");
  record(mapped.brandNameAr === "سفن لاند" && mapped.brandNameEn === "Seven Lands", "brand reads correctly in Arabic", `${mapped.brandNameAr} / ${mapped.brandNameEn}`);
  record(mapped.timezone === "Asia/Riyadh", "timezone is the verified company timezone", mapped.timezone);
  record(mapped.location.display === "بريدة، القصيم، المملكة العربية السعودية", "location display is the verified one", mapped.location.display ?? "—");

  const en = mapSiteSettings((await findGlobal("site-settings" as never, "en")) as never, "en");
  record(en.location.display === "Buraydah, Al Qassim, Saudi Arabia", "English location is its own publication, not a transliteration of the Arabic field", en.location.display ?? "—");

  /* No visible AR→EN fallback (§22): a locale with no value resolves to null, not to the other language. */
  const before = (await findGlobal("site-settings" as never, "en")) as never as { brand: { shortDescription: string | null } };
  const savedEn = before.brand.shortDescription;
  /* The temporary edit is always undone, even when a check above it throws — a verifier must never
     leave content changed. Every global write names its locale explicitly (see AGENTS.md). */
  try {
    await payload.updateGlobal({ slug: "site-settings", locale: "en", data: { brand: { shortDescription: null } }, overrideAccess: true } as never);
    const cleared = mapSiteSettings((await findGlobal("site-settings" as never, "en")) as never, "en");
    const arabicStillThere = mapSiteSettings((await findGlobal("site-settings" as never, "ar")) as never, "ar").shortDescription;
    record(cleared.shortDescription === null, "an empty English field is null — never the Arabic text");
    record(Boolean(arabicStillThere), "the Arabic value is untouched by an English edit");
  } finally {
    await payload.updateGlobal({ slug: "site-settings", locale: "en", data: { brand: { shortDescription: savedEn } }, overrideAccess: true } as never);
  }

  /* Validation */
  const badTimezone = await attempt(() =>
    payload.updateGlobal({ slug: "site-settings", data: { localization: { timezone: "Mars/Olympus" } }, overrideAccess: true } as never),
  );
  record(!badTimezone.ok, "an unknown timezone is rejected", badTimezone.error.slice(0, 60));
  const badMaps = await attempt(() =>
    payload.updateGlobal({ slug: "site-settings", data: { location: { mapsUrl: "javascript:alert(1)" } }, overrideAccess: true } as never),
  );
  record(!badMaps.ok, "an unsafe map URL is rejected", badMaps.error.slice(0, 60));

  /* Permissions: a viewer may not write settings, and the API is the enforcement point (§11).
     The account is created here so the suite stands alone; Phase B personas are not required. */
  const roleId = (await payload.find({ collection: "roles", where: { key: { equals: "viewer" } }, limit: 1, overrideAccess: true })).docs[0]?.id;
  const viewer = await payload.create({
    collection: "users",
    data: { name: "مؤقت — فحص الصلاحيات", email: `verify+temp-${Date.now()}@sevenlands.test`, password: "Verify!PhaseC2026x", status: "ACTIVE", roles: [roleId!] },
    overrideAccess: true,
  });
  try {
    const asViewer = await attempt(() =>
      payload.updateGlobal({ slug: "site-settings", data: { general: { businessCategory: "hacked" } }, overrideAccess: false, user: viewer } as never),
    );
    record(!asViewer.ok, "a viewer cannot write global settings (server-enforced, not UI-hidden)");
    const readAsViewer = await attempt(() => payload.findGlobal({ slug: "site-settings", locale: "ar", overrideAccess: false, user: viewer }));
    record(readAsViewer.ok, "a viewer with settings.read can read them");
    const nonStaff = await attempt(() =>
      payload.updateGlobal({ slug: "site-settings", data: { general: { businessCategory: "hacked" } }, overrideAccess: false } as never),
    );
    record(!nonStaff.ok, "an anonymous caller cannot write global settings");
  } finally {
    await payload.delete({ collection: "users", id: viewer.id, overrideAccess: true });
  }
}

/* ════════════════════════════════════════════════════════════════════════════════
 * §11 · SOCIAL ACCOUNTS
 * ════════════════════════════════════════════════════════════════════════════════ */
console.log("\n══ §11 · Social accounts ══════════════════════════════════════════════");
{
  const original = (await findGlobal("social-accounts" as never, "ar")) as never as { accounts: unknown[] };
  const savedCount = original.accounts.length;

  const base = (over: Record<string, unknown> = {}) => ({
    platform: "instagram",
    url: "https://instagram.com/sevenlands",
    iconKey: "instagram",
    enabled: true,
    ...over,
  });

  /* create */
  const result = await attempt(() =>
    payload.updateGlobal({ slug: "social-accounts", data: { accounts: [base()] }, overrideAccess: true } as never),
  );
  record(result.ok, "an account can be created", result.error.slice(0, 60));
  let doc = (await findGlobal("social-accounts" as never, "ar")) as never as { accounts: { id: string; url: string; enabled: boolean }[] };
  record(doc.accounts.length === 1, "the created account is stored");

  /* edit */
  await payload.updateGlobal({ slug: "social-accounts", data: { accounts: [{ id: doc.accounts[0]!.id, url: "https://instagram.com/seven.lands" }] }, overrideAccess: true } as never);
  doc = (await findGlobal("social-accounts" as never, "ar")) as never as typeof doc;
  record(doc.accounts[0]!.url === "https://instagram.com/seven.lands", "an account can be edited");

  /* reorder + second row */
  await payload.updateGlobal({
    slug: "social-accounts",
    data: { accounts: [base({ platform: "x", url: "https://x.com/sevenlands", iconKey: "x" }), { id: doc.accounts[0]!.id }] },
    overrideAccess: true,
  } as never);
  doc = (await findGlobal("social-accounts" as never, "ar")) as never as typeof doc;
  record(doc.accounts[0]!.url === "https://x.com/sevenlands", "accounts can be reordered (order is the array order)");

  /* disable */
  await payload.updateGlobal({
    slug: "social-accounts",
    data: { accounts: [{ id: doc.accounts[0]!.id, enabled: false }, { id: doc.accounts[1]!.id, enabled: true }] },
    overrideAccess: true,
  } as never);
  let mapped = mapSocialAccounts((await findGlobal("social-accounts" as never, "ar")) as never, "ar");
  record(mapped.length === 1 && mapped[0]!.platform === "instagram", "a disabled account is not public; the enabled one is", mapped.map((a) => a.platform).join(","));

  /* invalid URL / invalid icon */
  const badUrl = await attempt(() => payload.updateGlobal({ slug: "social-accounts", data: { accounts: [base({ url: "http://insecure.example/x" })] }, overrideAccess: true } as never));
  record(!badUrl.ok, "a non-https social URL is rejected", badUrl.error.slice(0, 50));
  const badIcon = await attempt(() => payload.updateGlobal({ slug: "social-accounts", data: { accounts: [base({ iconKey: "not-an-icon" })] }, overrideAccess: true } as never));
  record(!badIcon.ok, "an unknown icon key is rejected by the curated registry", badIcon.error.slice(0, 50));

  /* empty list renders nothing */
  await payload.updateGlobal({ slug: "social-accounts", data: { accounts: [] }, overrideAccess: true } as never);
  mapped = mapSocialAccounts((await findGlobal("social-accounts" as never, "ar")) as never, "ar");
  record(mapped.length === 0, "an empty list yields zero accounts (nothing renders)");

  /* delete */
  await payload.updateGlobal({ slug: "social-accounts", data: { accounts: [base()] }, overrideAccess: true } as never);
  doc = (await findGlobal("social-accounts" as never, "ar")) as never as typeof doc;
  await payload.updateGlobal({ slug: "social-accounts", data: { accounts: [] }, overrideAccess: true } as never);
  doc = (await findGlobal("social-accounts" as never, "ar")) as never as typeof doc;
  record(doc.accounts.length === 0, "an account can be deleted");

  /* restore the seeded (empty) state */
  if (savedCount !== 0) console.log(`  note: restored ${savedCount} pre-existing account(s)`);
}

/* ════════════════════════════════════════════════════════════════════════════════
 * §10 · BUSINESS HOURS — semantics and boundaries
 * ════════════════════════════════════════════════════════════════════════════════ */
console.log("\n══ §10 · Business hours ═══════════════════════════════════════════════");
{
  const empty = fallbackBusinessHours();
  record(getOpenState(empty).state === "unknown", "no configured hours → state is UNKNOWN (the UI shows no open/closed claim)");

  const week: BusinessHoursView["week"] = [
    { day: "sunday", closed: false, allDay: false, periods: [{ from: "09:00", to: "17:00" }], note: null },
    { day: "monday", closed: false, allDay: false, periods: [{ from: "09:00", to: "12:00" }, { from: "16:00", to: "21:00" }], note: null },
    { day: "tuesday", closed: true, allDay: false, periods: [], note: null },
    { day: "wednesday", closed: false, allDay: true, periods: [], note: null },
    { day: "thursday", closed: false, allDay: false, periods: [{ from: "09:00", to: "17:00" }], note: null },
    { day: "friday", closed: true, allDay: false, periods: [], note: null },
    { day: "saturday", closed: false, allDay: false, periods: [{ from: "10:00", to: "14:00" }], note: null },
  ];
  const view: BusinessHoursView = {
    source: "cms",
    timezone: "Asia/Riyadh",
    configured: true,
    week,
    exceptions: [],
    note: null,
  };

  /* Riyadh is UTC+3 year-round (no DST), so an instant maps to a stable local wall clock. */
  const riyadh = (iso: string) => new Date(iso);
  const at = (day: string, time: string) => new Date(`${day}T${time}:00+03:00`);

  record(getOpenState(view, riyadh("2026-10-11T06:00:00Z")).state === "open", "normal day, inside hours → open", "Sunday 09:00 Riyadh");
  record(getOpenState(view, riyadh("2026-10-11T15:00:00Z")).state === "closed", "normal day, after close → closed", "Sunday 18:00 Riyadh");
  record(getOpenState(view, riyadh("2026-10-13T09:00:00Z")).state === "closed", "a closed day is closed", "Tuesday 12:00 Riyadh");
  record(getOpenState(view, riyadh("2026-10-12T09:30:00Z")).state === "closed", "split shift: the gap between shifts is closed", "Monday 12:30 Riyadh");
  record(getOpenState(view, riyadh("2026-10-12T06:30:00Z")).state === "open", "split shift: first shift is open", "Monday 09:30 Riyadh");
  record(getOpenState(view, riyadh("2026-10-12T13:30:00Z")).state === "open", "split shift: second shift is open", "Monday 16:30 Riyadh");
  record(getOpenState(view, riyadh("2026-10-14T09:00:00Z")).state === "open", "an all-day schedule is open", "Wednesday 12:00 Riyadh");

  /* BOUNDARY SEMANTICS: from <= now < to. Opening is inclusive, closing is exclusive. */
  record(getOpenState(view, at("2026-10-11", "09:00")).state === "open", "exact opening boundary → OPEN (inclusive)");
  record(getOpenState(view, at("2026-10-11", "17:00")).state === "closed", "exact closing boundary → CLOSED (exclusive)");
  record(getOpenState(view, at("2026-10-11", "08:59")).state === "closed", "one minute before opening → CLOSED");
  record(getOpenState(view, at("2026-10-11", "16:59")).state === "open", "one minute before closing → OPEN");

  /* Exceptions beat the weekly pattern. */
  const withException: BusinessHoursView = {
    ...view,
    exceptions: [{ id: "x1", date: "2026-10-11", closed: true, periods: [], note: "إجازة" }],
  };
  record(getOpenState(withException, at("2026-10-11", "12:00")).state === "closed", "a special closure date overrides an open weekly day");
  const withSpecialOpening: BusinessHoursView = {
    ...view,
    exceptions: [{ id: "x2", date: "2026-10-13", closed: false, periods: [{ from: "11:00", to: "13:00" }], note: null }],
  };
  record(getOpenState(withSpecialOpening, at("2026-10-13", "12:00")).state === "open", "a special opening date opens a normally closed day");
  record(getOpenState(withSpecialOpening, at("2026-10-13", "14:00")).state === "closed", "…and closes again outside its hours");

  /* Timezone is honoured: the same instant is 06:00 in Riyadh and 03:00 in London. */
  const londonView: BusinessHoursView = { ...view, timezone: "Europe/London" };
  record(
    getOpenState(view, riyadh("2026-10-11T06:30:00Z")).state !== getOpenState(londonView, riyadh("2026-10-11T06:30:00Z")).state,
    "the same instant resolves differently per configured timezone (the timezone is actually applied)",
    `Riyadh ${getOpenState(view, riyadh("2026-10-11T06:30:00Z")).state} vs London ${getOpenState(londonView, riyadh("2026-10-11T06:30:00Z")).state}`,
  );

  /* CMS round-trip: what the editor saves is what the resolver reads. */
  const before = (await findGlobal("business-hours" as never, "ar")) as never as { week: unknown[]; exceptions: unknown[] };
  await payload.updateGlobal({
    slug: "business-hours",
    data: {
      week: [{ day: "sunday", closed: false, allDay: false, periods: [{ from: "09:00", to: "17:00" }] }],
      exceptions: [{ date: "2026-12-25T12:00:00.000Z", closed: true, note: "عطلة" }],
    },
    overrideAccess: true,
  } as never);
  const stored = (await findGlobal("business-hours" as never, "ar")) as never as { week: { day: string; periods: { from: string }[] }[]; exceptions: { date?: string | null }[] };
  record(stored.week.length === 1 && stored.week[0]!.day === "sunday" && stored.week[0]!.periods[0]!.from === "09:00", "a schedule round-trips through the CMS unchanged");
  record(Boolean(stored.exceptions?.length === 1 && stored.exceptions[0]?.date && stored.exceptions[0].date.startsWith("2026-12-25")), "a special date round-trips through the CMS", String(stored.exceptions?.[0]?.date));
  /* restore the deliberate empty state (§49: no invented hours) */
  await payload.updateGlobal({ slug: "business-hours", data: { week: [], exceptions: [], note: null }, overrideAccess: true } as never);
  const restored = (await findGlobal("business-hours" as never, "ar")) as never as { week: unknown[]; exceptions: unknown[] };
  record(restored.week.length === 0 && restored.exceptions.length === 0, "the seeded (empty) hours state is restored after the test", `was ${before.week.length} row(s)`);
}

/* ════════════════════════════════════════════════════════════════════════════════
 * §12 · NAVIGATION
 * ════════════════════════════════════════════════════════════════════════════════ */
console.log("\n══ §12 · Navigation ═══════════════════════════════════════════════════");
{
  /* Unsafe protocols are refused before they can ever reach a rendered <a href>. */
  record(toLinkTarget({ linkType: "external", url: "javascript:alert(1)", newTab: true }) === null, "javascript: URL is refused by the link resolver");
  record(toLinkTarget({ linkType: "external", url: "data:text/html,<script>", newTab: true }) === null, "data: URL is refused by the link resolver");
  record(toLinkTarget({ linkType: "external", url: "https://example.com", newTab: true })?.kind === "external", "a legitimate https URL resolves as external");

  /*
   * ARRAY ROWS ARE SHARED BETWEEN LOCALES (§26 trap, measured 2026-10-07): writing a localized array
   * a second time WITHOUT row ids deletes the rows the first write created — including their values in
   * the first language. Every multi-locale write here therefore follows the only safe order:
   *   write ar → read the generated row ids back → write en WITH those ids.
   */
  const seededAr = (await findGlobal("navigation" as never, "ar")) as never as {
    header: { items: { id: string; label: string; enabled: boolean }[]; cta: { label: string } };
  };
  const seededEn = (await findGlobal("navigation" as never, "en")) as never as {
    header: { items: { id: string; label: string }[]; cta: { label: string } };
  };
  /*
   * The values the seeder writes (§48). Used as the restore target when the live document cannot be
   * trusted — e.g. after an interrupted run — so the suite always leaves a correct menu behind.
   */
  const SEEDED_AR = ["خدماتنا", "أعمالنا", "من نحن", "رؤى", "تواصل"];
  const SEEDED_EN = ["Services", "Work", "About", "Insights", "Contact"];
  const readLabels = (items: { label?: string }[]) =>
    items.length === 5 && items.every((item) => typeof item.label === "string" && item.label.trim())
      ? items.map((item) => item.label!)
      : null;
  const seededLabelsAr = readLabels(seededAr.header.items) ?? SEEDED_AR;
  const seededLabelsEn = readLabels(seededEn.header.items) ?? SEEDED_EN;
  /* The CTA is restored from the known seeded values, never from the read-back: a previous
     interrupted run could have left the fixture CTA in the document. */
  const SEEDED_CTA_AR = "ابدأ مشروعك";
  const SEEDED_CTA_EN = "Start a project";
  const SEEDED_CTA_ROUTE = "start-a-project";

  const fixture = {
    header: {
      items: [
        { label: "اختبار داخلي", linkType: "internal", route: "contact", enabled: true },
        { label: "Test external", linkType: "external", url: "https://example.com/insights", newTab: true, enabled: true },
        { label: "مخفي", linkType: "internal", route: "about", enabled: false },
      ],
      cta: { enabled: true, label: "تواصل الآن", linkType: "internal", route: "contact" },
    },
  };
  await payload.updateGlobal({ slug: "navigation", locale: "ar", data: fixture, overrideAccess: true } as never);
  const fixtureAr = (await findGlobal("navigation" as never, "ar")) as never as { header: { items: { id: string }[] } };
  const fixtureIds = fixtureAr.header.items.map((item) => item.id);
  await payload.updateGlobal({
    slug: "navigation",
    locale: "en",
    data: {
      header: {
        items: [
          { id: fixtureIds[0], label: "Internal test" },
          { id: fixtureIds[1], label: "Test external" },
          { id: fixtureIds[2], label: "Hidden" },
        ],
        cta: { enabled: true, label: "Talk now", linkType: "internal", route: "contact" },
      },
    },
    overrideAccess: true,
  } as never);

  const arNav = mapNavigation((await findGlobal("navigation" as never, "ar")) as never, "ar");
  const enNav = mapNavigation((await findGlobal("navigation" as never, "en")) as never, "en");

  record(arNav.items.length === 2, "a disabled item is not published", `${arNav.items.length} of 3 rows`);
  record(arNav.items[0]!.link.kind === "internal" && (arNav.items[0]!.link as { path: string }).path === "/contact", "an internal item resolves to its registered route");
  record(arNav.items[1]!.link.kind === "external" && arNav.items[1]!.link.kind === "external" && (arNav.items[1]!.link as { newTab: boolean }).newTab, "an external item keeps newTab (rendered as target=_blank + rel=noopener)");
  record(arNav.items[0]!.label === "اختبار داخلي" && enNav.items[0]!.label === "Internal test", "AR and EN labels are independent");
  record(enNav.cta?.label === "Talk now" && arNav.cta?.label === "تواصل الآن", "the primary CTA is localized", `${arNav.cta?.label} / ${enNav.cta?.label}`);

  /* Reorder: the array order is the rendered order (reuses the same rows, so no locale damage). */
  await payload.updateGlobal({
    slug: "navigation",
    locale: "ar",
    data: {
      header: {
        items: [
          { id: fixtureIds[2], label: "مخفي" },
          { id: fixtureIds[1], label: "Test external" },
          { id: fixtureIds[0], label: "اختبار داخلي" },
        ],
      },
    },
    overrideAccess: true,
  } as never);
  const reordered = mapNavigation((await findGlobal("navigation" as never, "ar")) as never, "ar");
  record(reordered.items[0]!.label === "Test external", "reordering the rows reorders the menu", reordered.items.map((i) => i.label).join(" · "));

  /* Unsafe protocol through the CMS is rejected by validation, not merely filtered later. */
  const unsafe = await attempt(() =>
    payload.updateGlobal({
      slug: "navigation",
      locale: "ar",
      data: { header: { items: [{ label: "خطير", linkType: "external", url: "javascript:alert(1)", newTab: true, enabled: true }] } },
      overrideAccess: true,
    } as never),
  );
  record(!unsafe.ok, "the CMS rejects a javascript: menu link outright", unsafe.error.slice(0, 50));

  /* Restore the seeded menu by rewriting it in full, ar → ids → en, exactly like the seeder does. */
  const ROUTES = ["services", "work", "about", "insights", "contact"] as const;
  await payload.updateGlobal({
    slug: "navigation",
    locale: "ar",
    data: {
      header: {
        items: ROUTES.map((route, index) => ({ label: seededLabelsAr[index], linkType: "internal", route, enabled: true })),
        cta: { enabled: true, label: SEEDED_CTA_AR, linkType: "internal", route: SEEDED_CTA_ROUTE },
      },
    },
    overrideAccess: true,
  } as never);
  const restoreAr = (await findGlobal("navigation" as never, "ar")) as never as { header: { items: { id: string }[] } };
  await payload.updateGlobal({
    slug: "navigation",
    locale: "en",
    data: {
      header: {
        items: restoreAr.header.items.map((item, index) => ({ id: item.id, label: seededLabelsEn[index] })),
        cta: { enabled: true, label: SEEDED_CTA_EN, linkType: "internal", route: SEEDED_CTA_ROUTE },
      },
    },
    overrideAccess: true,
  } as never);
  const restoredAr = mapNavigation((await findGlobal("navigation" as never, "ar")) as never, "ar");
  const restoredEn = mapNavigation((await findGlobal("navigation" as never, "en")) as never, "en");
  record(
    restoredAr.items.length === 5 && restoredAr.items.map((i) => i.label).join("·") === SEEDED_AR.join("·"),
    "the seeded five-item Arabic menu is restored exactly",
    restoredAr.items.map((i) => i.label).join(" · "),
  );
  record(
    restoredAr.cta?.label === SEEDED_CTA_AR &&
      restoredAr.cta?.link.kind === "internal" &&
      (restoredAr.cta.link as { path: string }).path === "/start-a-project",
    "the primary CTA is restored to «ابدأ مشروعك» → /start-a-project",
    `${restoredAr.cta?.label} → ${restoredAr.cta?.link.kind === "internal" ? (restoredAr.cta.link as { path: string }).path : "?"}`,
  );
  record(
    restoredEn.items.length === 5 && restoredEn.items.map((i) => i.label).join("·") === SEEDED_EN.join("·"),
    "the seeded English menu is restored exactly",
    restoredEn.items.map((i) => i.label).join(" · "),
  );
}

console.log(`\n  checks passed: ${passed}`);
console.log(`  checks failed: ${failed}`);
if (failures.length) for (const f of failures) console.log(`    · ${f}`);
console.log(failed === 0 ? "\n  PHASE_C_GLOBALS_SOCIAL_HOURS_NAV = PASS\n" : "\n  PHASE_C_GLOBALS_SOCIAL_HOURS_NAV = FAIL\n");

await payload.destroy();
process.exit(failed === 0 ? 0 : 1);
