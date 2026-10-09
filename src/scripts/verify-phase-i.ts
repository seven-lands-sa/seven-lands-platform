import { getPayload } from "payload";
import config from "@payload-config";
import { getTrackingSettings, getConsentSettings } from "@/lib/content";
import { fallbackTrackingSettings, fallbackConsentSettings } from "@/lib/content/fallback";
import { DEFAULT_CONSENT } from "@/lib/consent";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

async function main() {
  console.log("=== Phase I/J: Analytics, Tracking & Consent Verification ===");
  const payload = await getPayload({ config });

  // 1. Verify Globals Registered in Payload
  console.log("\n--- TEST 1: Globals Registration ---");
  const trackingDoc = await payload.findGlobal({ slug: "tracking-settings", depth: 0, overrideAccess: true });
  assert(trackingDoc !== null, "tracking-settings global is accessible");

  const consentDoc = await payload.findGlobal({ slug: "consent-settings", depth: 0, overrideAccess: true });
  assert(consentDoc !== null, "consent-settings global is accessible");

  // 2. Verify Fallbacks
  console.log("\n--- TEST 2: Static Fallbacks ---");
  const fbTracking = fallbackTrackingSettings();
  assert(fbTracking.source === "fallback", "Fallback tracking source is fallback");
  assert(fbTracking.googleAnalytics.enabled === false, "Fallback GA4 is disabled by default");
  assert(fbTracking.environments.includes("production"), "Fallback environments include production");

  const fbConsentAr = fallbackConsentSettings("ar");
  assert(fbConsentAr.source === "fallback", "Fallback consent source is fallback");
  assert(fbConsentAr.enabled === true, "Fallback consent is enabled");
  assert(fbConsentAr.cookieExpiryMonths === 6, "Fallback cookieExpiryMonths is 6");
  assert(fbConsentAr.acceptAllLabel === "قبول الكل", "Fallback Arabic accept button matches");

  const fbConsentEn = fallbackConsentSettings("en");
  assert(fbConsentEn.acceptAllLabel === "Accept All", "Fallback English accept button matches");

  // 3. Content Adapter Getters
  console.log("\n--- TEST 3: Content Adapter Getters ---");
  const liveTracking = await getTrackingSettings();
  assert(liveTracking.source === "cms" || liveTracking.source === "fallback", "getTrackingSettings resolves safely");
  
  const liveConsent = await getConsentSettings("ar");
  assert(liveConsent.source === "cms" || liveConsent.source === "fallback", "getConsentSettings resolves safely");

  // 4. Client Consent Logic (Node simulation)
  console.log("\n--- TEST 4: Client Consent Functions ---");
  assert(DEFAULT_CONSENT.necessary === true, "Default necessary consent is true");
  assert(DEFAULT_CONSENT.analytics === false, "Default analytics consent is false");
  assert(DEFAULT_CONSENT.marketing === false, "Default marketing consent is false");

  // 5. Update and Audit Verification
  console.log("\n--- TEST 5: Global Update & Audit Log ---");
  await payload.updateGlobal({
    slug: "tracking-settings",
    data: {
      googleAnalyticsId: "G-TEST123456",
      googleAnalyticsEnabled: true,
      environments: ["production", "development"],
    },
    overrideAccess: true,
  });

  const updatedTracking = await payload.findGlobal({ slug: "tracking-settings", depth: 0, overrideAccess: true });
  assert(updatedTracking.googleAnalyticsId === "G-TEST123456", "Tracking settings updated successfully in PostgreSQL");
  assert(updatedTracking.googleAnalyticsEnabled === true, "GA4 enabled status updated in PostgreSQL");

  const latestAudit = await payload.find({
    collection: "audit-events",
    where: {
      action: { equals: "tracking_updated" },
    },
    limit: 1,
    sort: "-createdAt",
    overrideAccess: true,
  });
  assert(latestAudit.docs.length > 0, "Audit event 'tracking_updated' recorded in audit-events");
  console.log(`Audited: ${latestAudit.docs[0].summary}`);

  // Revert test tracking update
  await payload.updateGlobal({
    slug: "tracking-settings",
    data: {
      googleAnalyticsId: "",
      googleAnalyticsEnabled: false,
      environments: ["production"],
    },
    overrideAccess: true,
  });

  console.log("\nALL PHASE I/J VERIFICATION TESTS PASSED SUCCESSFULLY (6/6).");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
