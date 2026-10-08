import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentPermissions } from "@/lib/auth/current-user";
import { recordAuditEvent } from "@/lib/auth/audit";

/**
 * Phase H — Secure Leads CSV Export Endpoint
 *
 * Rules:
 * - Requires 'leads.export' permission
 * - UTF-8 with BOM (\uFEFF) for proper Arabic display in MS Excel
 * - Formula injection prevention: prefix values starting with =, +, -, @ with a single quote '
 * - Recorded in audit log
 */

import type { Lead } from "@/payload-types";

function sanitizeForCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();
  // Prevent CSV Formula Injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  const permissions = await getCurrentPermissions();
  if (!permissions.has("leads.export")) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const payload = await getPayload({ config });

  // Fetch all leads ordered by createdAt descending
  const result = await payload.find({
    collection: "leads",
    limit: 5000,
    sort: "-createdAt",
    overrideAccess: true,
  });

  const headers = [
    "الرقم المرجعي (Reference)",
    "الحالة (Status)",
    "الاسم (Name)",
    "الشركة (Company)",
    "الجوال (Phone)",
    "البريد الإلكتروني (Email)",
    "القناة (Channel)",
    "الجدول الزمني (Timeline)",
    "نوع الطلب (Mode)",
    "المجالات (Lands)",
    "الهدف (Goal)",
    "ملاحظات (Notes)",
    "اللغة (Locale)",
    "تاريخ الإنشاء (Created At)",
  ];

  const rows = result.docs.map((lead: Lead) => {
    const landsFormatted = Array.isArray(lead.lands) ? lead.lands.join(" | ") : "";
    return [
      sanitizeForCsv(lead.reference),
      sanitizeForCsv(lead.status),
      sanitizeForCsv(lead.name),
      sanitizeForCsv(lead.company),
      sanitizeForCsv(lead.phone),
      sanitizeForCsv(lead.email),
      sanitizeForCsv(lead.channel),
      sanitizeForCsv(lead.timeline),
      sanitizeForCsv(lead.mode),
      sanitizeForCsv(landsFormatted),
      sanitizeForCsv(lead.goal),
      sanitizeForCsv(lead.notes),
      sanitizeForCsv(lead.locale),
      sanitizeForCsv(lead.createdAt),
    ].join(",");
  });

  // Prepend UTF-8 BOM so Excel opens Arabic correctly
  const csvContent = "\uFEFF" + headers.map((h) => `"${h}"`).join(",") + "\n" + rows.join("\n");

  // Record audit log
  await recordAuditEvent(payload, {
    action: "lead_exported",
    summary: `تصدير ملف بيانات العملاء المحتملين (${result.docs.length} عميل)`,
    resourceType: "leads",
    req: {
      headers: request.headers,
      method: request.method,
    },
  });

  const nowStr = new Date().toISOString().slice(0, 10);
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="seven-lands-leads-${nowStr}.csv"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
