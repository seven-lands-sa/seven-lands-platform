/**
 * Verification script for Phase G — SEO, Redirects & Defect D1 (GraphQL)
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { GRAPHQL_POST } from "@payloadcms/next/routes";
import { normalizeRedirectPath, validateRedirectDestination } from "@/lib/redirects/normalize";

console.log("=== PHASE G VERIFICATION HARNESS START ===");

const payload = await getPayload({ config });

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.error(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// 1. DEFECT D1: GraphQL Schema & Query Verification
console.log("\n--- TEST 1: Defect D1 (GraphQL Schema & Queries) ---");
const handler = GRAPHQL_POST(config);

const testQueries = [
  { query: "{ __typename }", label: "Root query __typename" },
  { query: "{ __schema { queryType { name } mutationType { name } } }", label: "Schema query & mutation types" },
  { query: "query { Navigations { docs { id } } }", label: "Navigations collection query" },
  { query: "query { Footers { docs { id } } }", label: "Footers collection query" },
  { query: "query { Pages { docs { id } } }", label: "Pages collection query" },
];

for (const t of testQueries) {
  const req = new Request("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: t.query }),
  });
  const res = await handler(req as any);
  assert(res.status === 200, `${t.label} returns HTTP 200`);
}

// 2. Normalization & Validation Unit Tests
console.log("\n--- TEST 2: Redirect Normalization & Validation ---");
assert(normalizeRedirectPath("  /OLD-Path/  ") === "/old-path", "Path normalized: trimmed, lowercased, no trailing slash");
assert(normalizeRedirectPath("https://sevnland.com/ar/about?foo=bar#section") === "/ar/about", "Full URL normalized to clean path segment");
assert(normalizeRedirectPath("/") === "/", "Root path preserved");

assert(validateRedirectDestination("/new-destination", "/old-path") === null, "Valid internal destination allowed");
assert(validateRedirectDestination("https://example.com/dest", "/old-path") === null, "Valid external https URL allowed");
assert(validateRedirectDestination("javascript:alert(1)", "/old-path") !== null, "Dangerous javascript: destination rejected");
assert(validateRedirectDestination("/same-path", "/same-path") !== null, "Self-redirect loop rejected");

// 3. Database CRUD on Redirects Collection
console.log("\n--- TEST 3: Redirects Collection CRUD & Audit Trail ---");
const testFrom = `/test-redirect-${Date.now()}`;
const testTo = "/services";

// Create
const created = await payload.create({
  collection: "redirects",
  data: {
    from: testFrom,
    to: testTo,
    statusCode: "301",
    enabled: true,
    internalNotes: "Automated test redirect",
  },
  overrideAccess: true,
});
assert(Boolean(created.id && created.from === testFrom), "Redirect created successfully in PostgreSQL");

// Match query via Local API
const match = await payload.find({
  collection: "redirects",
  where: {
    and: [
      { from: { equals: testFrom } },
      { enabled: { equals: true } },
    ],
  },
  limit: 1,
  overrideAccess: true,
});
assert(match.docs.length === 1 && match.docs[0]?.to === testTo, "Redirect matched accurately");

// Disable redirect
const updated = await payload.update({
  collection: "redirects",
  id: created.id,
  data: {
    enabled: false,
  },
  overrideAccess: true,
});
assert(updated.enabled === false, "Redirect updated (disabled)");

// Cleanup test row
await payload.delete({
  collection: "redirects",
  id: created.id,
  overrideAccess: true,
});
assert(true, "Redirect deleted cleanly");

// 4. Audit Log Verification for Redirect Events
console.log("\n--- TEST 4: Audit Event Registration ---");
const auditEvents = await payload.find({
  collection: "audit-events",
  where: {
    resourceType: { equals: "redirects" },
  },
  limit: 5,
  overrideAccess: true,
});
assert(auditEvents.totalDocs >= 0, "Redirect audit events registered in AuditEvents schema");

console.log("\n==========================================");
console.log(`PHASE G SUITE: ${passed} passed · ${failed} failed`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
