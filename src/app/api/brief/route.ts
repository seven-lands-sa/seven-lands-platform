import { NextResponse } from "next/server";
import { briefSchema } from "@/features/brief/schema";
import { normalizeSaudiPhone } from "@/lib/utils";

/**
 * ============================================================================
 * PROJECT BRIEF ENDPOINT
 * ============================================================================
 * Server-side validation + honeypot + simple rate limiting.
 * Delivery is configurable and NOT hardcoded:
 *   BRIEF_WEBHOOK_URL  — optional HTTPS endpoint that receives the JSON payload
 *                        (n8n / Make / Zapier / CRM / email service).
 * If it is not configured, the request is validated and accepted, and the
 * contact also has a one-tap WhatsApp handoff in the UI, so no lead is lost
 * while the owner decides on a delivery destination.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const hits = new Map<string, number[]>();

/**
 * The limiter is intentionally disabled outside production (local QA and the
 * Playwright suite submit repeatedly from one IP). Production keeps the guard.
 */
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

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = briefSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled → silently accept and drop.
  if (data.website) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const normalized = {
    ...data,
    phone: normalizeSaudiPhone(data.phone) ?? data.phone,
    email: data.email || null,
    company: data.company || null,
    notes: data.notes || null,
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.BRIEF_WEBHOOK_URL;

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.BRIEF_WEBHOOK_TOKEN
            ? { authorization: `Bearer ${process.env.BRIEF_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(normalized),
      });
      if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
      return NextResponse.json({ ok: true, delivered: true });
    } catch {
      // Never lose the lead silently: log for server-side recovery and let the
      // UI offer the WhatsApp handoff.
      console.error("[brief] webhook delivery failed", { phone: normalized.phone });
      return NextResponse.json({ ok: true, delivered: false }, { status: 202 });
    }
  }

  // No destination configured yet (see docs/PENDING-OWNER-INPUTS.md).
  console.info("[brief] received (no BRIEF_WEBHOOK_URL configured)", {
    mode: normalized.mode,
    lands: normalized.lands,
    phone: normalized.phone,
    timeline: normalized.timeline,
  });

  return NextResponse.json({ ok: true, delivered: false }, { status: 202 });
}
