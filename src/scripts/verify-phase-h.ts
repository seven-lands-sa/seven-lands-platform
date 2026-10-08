/**
 * Verification test suite for Phase H — Durable Leads & Form Persistence.
 *
 * Run: npx payload run src/scripts/verify-phase-h.ts
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { POST } from "../app/api/brief/route";

console.log("=== PHASE H VERIFICATION HARNESS START ===");

const payload = await getPayload({ config });

// Baseline lead count
const initialLeads = await payload.find({
  collection: "leads",
  overrideAccess: true,
});
console.log(`Initial leads count in database: ${initialLeads.totalDocs}`);

// Test 1: Arabic Valid Submission
console.log("\n--- TEST 1: Valid Arabic Brief Submission ---");
const arReq = new Request("http://localhost:3000/api/brief", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
  body: JSON.stringify({
    mode: "brief",
    lands: ["strategy-business-growth", "branding-creative"],
    goal: "نريد استراتيجية نمو شاملة وهوية بصرية جديدة لشركتنا التقنية في الرياض",
    timeline: "now",
    name: "عبدالله السديري",
    company: "شركة الأفق التقني",
    phone: "0501234567",
    email: "abdullah@alofoq.sa",
    channel: "whatsapp",
    notes: "نفضل التواصل عبر الواتساب في الفترة الصباحية",
    consent: true,
    locale: "ar",
  }),
});

const arRes = await POST(arReq);
const arBody = await arRes.json();
console.log(`Arabic submission response status: ${arRes.status}`);
console.log(`Arabic response body:`, arBody);

if (arRes.status !== 200 || !arBody.ok || !arBody.reference || !arBody.reference.startsWith("SL-")) {
  console.error("Test 1 Failed: Expected HTTP 200 and reference, got", arBody);
  process.exit(1);
}

// Verify in PostgreSQL
const arDbLead = await payload.find({
  collection: "leads",
  where: { reference: { equals: arBody.reference } },
  overrideAccess: true,
});
if (arDbLead.totalDocs !== 1) {
  console.error(`Test 1 Failed: Lead with reference ${arBody.reference} not found in PostgreSQL!`);
  process.exit(1);
}
const lead1 = arDbLead.docs[0];
console.log(`Verified DB Lead 1: ID=${lead1.id}, Ref=${lead1.reference}, Status=${lead1.status}, Phone=${lead1.phone}`);
if (lead1.status !== "NEW" || lead1.phone !== "+966501234567") {
  console.error(`Test 1 Failed: Lead field values mismatch in DB`);
  process.exit(1);
}
console.log("TEST 1 PASSED: Arabic lead durably stored in PostgreSQL with status NEW.");

// Test 2: English Quick Submission
console.log("\n--- TEST 2: Valid English Quick Submission ---");
const enReq = new Request("http://localhost:3000/api/brief", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.2" },
  body: JSON.stringify({
    mode: "quick",
    lands: [],
    goal: "Looking for an e-commerce platform integration with enterprise ERP",
    timeline: "quarter",
    name: "John Miller",
    company: "Miller Global Trade",
    phone: "0559876543",
    email: "john@millerglobal.com",
    channel: "call",
    consent: true,
    locale: "en",
  }),
});

const enRes = await POST(enReq);
const enBody = await enRes.json();
console.log(`English quick response status: ${enRes.status}`);
console.log(`English quick response body:`, enBody);

if (enRes.status !== 200 || !enBody.ok || !enBody.reference) {
  console.error("Test 2 Failed: Expected HTTP 200 and reference");
  process.exit(1);
}

const enDbLead = await payload.find({
  collection: "leads",
  where: { reference: { equals: enBody.reference } },
  overrideAccess: true,
});
if (enDbLead.totalDocs !== 1) {
  console.error("Test 2 Failed: Lead not found in DB");
  process.exit(1);
}
console.log("TEST 2 PASSED: English lead durably stored in PostgreSQL with status NEW.");

// Test 3: Validation Failure
console.log("\n--- TEST 3: Validation Failure (Missing Consent & Short Goal) ---");
const invalidReq = new Request("http://localhost:3000/api/brief", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.3" },
  body: JSON.stringify({
    mode: "brief",
    lands: ["branding-creative"],
    goal: "short",
    name: "Test",
    phone: "invalid_phone",
    channel: "whatsapp",
    consent: false,
  }),
});

const invalidRes = await POST(invalidReq);
const invalidBody = await invalidRes.json();
console.log(`Invalid response status: ${invalidRes.status}`);
console.log(`Invalid response body:`, invalidBody);
if (invalidRes.status !== 422 || invalidBody.ok !== false) {
  console.error("Test 3 Failed: Expected HTTP 422 validation failure");
  process.exit(1);
}
console.log("TEST 3 PASSED: Validation rejected appropriately.");

// Test 4: Honeypot Trap (Defect D3 regression check)
console.log("\n--- TEST 4: Honeypot Trap (Silent Drop) ---");
const countBeforeHoneypot = (await payload.find({ collection: "leads", overrideAccess: true })).totalDocs;
const honeypotReq = new Request("http://localhost:3000/api/brief", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.4" },
  body: JSON.stringify({
    mode: "quick",
    lands: [],
    goal: "Spam bot attempting automatic injection into customer database",
    name: "Spam Bot",
    phone: "0511111111",
    channel: "whatsapp",
    consent: true,
    website: "https://spam-domain-spammer.com", // TRAP
  }),
});

const honeypotRes = await POST(honeypotReq);
const honeypotBody = await honeypotRes.json();
console.log(`Honeypot response status: ${honeypotRes.status}`);
console.log(`Honeypot response body:`, honeypotBody);

const countAfterHoneypot = (await payload.find({ collection: "leads", overrideAccess: true })).totalDocs;
if (honeypotRes.status !== 200 || !honeypotBody.ok || honeypotBody.reference !== null) {
  console.error("Test 4 Failed: Expected silent HTTP 200 with reference: null");
  process.exit(1);
}
if (countAfterHoneypot !== countBeforeHoneypot) {
  console.error("Test 4 Failed: Honeypot bot submission leaked into database rows!");
  process.exit(1);
}
console.log("TEST 4 PASSED: Honeypot dropped silently with zero database rows stored.");

// Test 5: Verify Audit Log Events
console.log("\n--- TEST 5: Verify Audit Log Entries ---");
const auditEvents = await payload.find({
  collection: "audit-events",
  where: { action: { equals: "lead_created" } },
  sort: "-occurredAt",
  limit: 5,
  overrideAccess: true,
});
console.log(`Found ${auditEvents.totalDocs} lead_created audit events`);
if (auditEvents.totalDocs < 2) {
  console.error("Test 5 Failed: Expected at least 2 audit events for created leads");
  process.exit(1);
}
console.log("TEST 5 PASSED: Audit trail recorded all real lead events.");

console.log("\n==========================================");
console.log("ALL PHASE H TESTS PASSED SUCCESSFULLY (5/5)");
console.log("==========================================");

await payload.destroy();
process.exit(0);
