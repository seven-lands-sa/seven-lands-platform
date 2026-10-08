import crypto from "crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { briefSchema } from "@/features/brief/schema";
import { normalizeSaudiPhone } from "@/lib/utils";
import { recordAuditEvent } from "@/lib/auth/audit";

/**
 * ============================================================================
 * PROJECT BRIEF ENDPOINT — PHASE H (DURABLE LEADS PERSISTENCE)
 * ============================================================================
 *
 * Sequence of Execution (Strict Amendment C):
 * 1. Validate payload (Zod briefSchema)
 * 2. Spam / rate checks + honeypot evaluation
 * 3. Durable PostgreSQL Lead persistence (Payload Local API)
 *    -> If DB fails: HTTP 500 { ok: false, error: 'storage_unavailable' }
 *    -> Visitor NEVER receives { ok: true } unless lead is written to PostgreSQL.
 * 4. Success response generation with unique human Reference ID (e.g. SL-YYYYMMDD-XXXX)
 * 5. Secondary notifications (Webhook / Email) dispatched asynchronously/safely:
 *    -> Webhook/email failure must NEVER lose the lead or fail the HTTP response.
 * 6. Audit logging (lead_created)
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const hits = new Map<string, number[]>();

const RATE_LIMITING_ENABLED = process.env.NODE_ENV === "production";

function rateLimited(key: string) {
  if (!RATE_LIMITING_ENABLED) return false;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function generateLeadReference(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SL-${dateStr}-${randomSuffix}`;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = briefSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled → silently accept and drop without saving or notifying bots.
  if (data.website) {
    return NextResponse.json({ ok: true, delivered: false, reference: null });
  }

  const normalizedPhone = normalizeSaudiPhone(data.phone) ?? data.phone;
  const leadLocale = data.locale === "en" ? "en" : "ar";
  const reference = generateLeadReference();

  let payloadClient;
  try {
    payloadClient = await getPayload({ config });
  } catch (err) {
    console.error("[brief] critical: failed to initialize Payload", err);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 500 });
  }

  // 1. Durably persist to PostgreSQL Leads collection
  let leadDoc;
  try {
    leadDoc = await payloadClient.create({
      collection: "leads",
      data: {
        reference,
        status: "NEW",
        name: data.name,
        company: data.company || null,
        phone: normalizedPhone,
        email: data.email || null,
        channel: data.channel,
        timeline: data.timeline || null,
        mode: data.mode,
        lands: data.lands,
        goal: data.goal,
        notes: data.notes || null,
        consent: data.consent,
        locale: leadLocale,
        campaign: data.campaign || null,
        ipHash,
      },
      overrideAccess: true,
    });
  } catch (dbErr) {
    console.error("[brief] critical: lead persistence failed in PostgreSQL", dbErr);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 500 });
  }

  // 2. Audit log entry (write-once)
  try {
    await recordAuditEvent(payloadClient, {
      action: "lead_created",
      summary: `تسجيل طلب عميل جديد ${reference} عبر (${data.mode === "brief" ? "نموذج المشروع" : "التواصل السريع"})`,
      resourceType: "leads",
      resourceId: leadDoc.id,
      req: {
        headers: request.headers,
        method: request.method,
      },
    });
  } catch (auditErr) {
    console.warn("[brief] audit logging failed non-critically", auditErr);
  }

  // 3. Secondary Webhook notification (Optional — non-blocking)
  let webhookDelivered = false;
  const webhookUrl = process.env.BRIEF_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.BRIEF_WEBHOOK_TOKEN
            ? { authorization: `Bearer ${process.env.BRIEF_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          reference,
          leadId: leadDoc.id,
          ...data,
          phone: normalizedPhone,
          createdAt: leadDoc.createdAt,
        }),
      });
      webhookDelivered = response.ok;
      if (!response.ok) {
        console.warn(`[brief] webhook returned status ${response.status}`);
      }
    } catch (whErr) {
      console.warn("[brief] secondary webhook delivery failed", whErr);
    }
  }

  // 4. Return success response with durable reference
  return NextResponse.json(
    {
      ok: true,
      reference,
      delivered: webhookDelivered,
    },
    { status: 200 },
  );
}
