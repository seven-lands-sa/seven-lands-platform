import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { resolvePermissions } from "@/lib/auth/access";
import { NextResponse } from "next/server";

export async function GET() {
  const payload = await getPayload({ config });
  const reqHeaders = await headers();
  const { user } = await payload.auth({ headers: reqHeaders });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await resolvePermissions(payload, user);
  if (!permissions.has("analytics.read")) {
    return NextResponse.json({ error: "Forbidden: analytics.read required" }, { status: 403 });
  }

  // 1. First-party leads count from PostgreSQL
  const leadsCount = await payload.count({
    collection: "leads",
    overrideAccess: true,
  });

  const recentLeads = await payload.find({
    collection: "leads",
    sort: "-createdAt",
    limit: 5,
    overrideAccess: true,
  });

  // 2. Tracking settings status
  const trackingDoc = await payload.findGlobal({
    slug: "tracking-settings",
    depth: 0,
    overrideAccess: true,
  });

  const gaConfigured = Boolean(trackingDoc?.googleAnalyticsId && trackingDoc?.googleAnalyticsEnabled);
  const gtmConfigured = Boolean(trackingDoc?.gtmContainerId && trackingDoc?.gtmEnabled);
  const metaConfigured = Boolean(trackingDoc?.metaPixelId && trackingDoc?.metaPixelEnabled);
  const snapConfigured = Boolean(trackingDoc?.snapPixelId && trackingDoc?.snapPixelEnabled);
  const tiktokConfigured = Boolean(trackingDoc?.tiktokPixelId && trackingDoc?.tiktokPixelEnabled);

  // 3. Honest Status reporting (V1 Rule: When external source is absent, report "غير متصل", never fake zero)
  return NextResponse.json({
    leadSummary: {
      totalLeads: leadsCount.totalDocs,
      recent: recentLeads.docs.map((lead) => ({
        id: lead.id,
        reference: lead.reference,
        name: lead.name,
        company: lead.company,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
    },
    sources: {
      googleAnalytics: {
        status: gaConfigured ? "configured" : "disconnected",
        statusLabel: gaConfigured ? "متصل (بانتظار مزامنة التقارير)" : "غير متصل",
        id: trackingDoc?.googleAnalyticsId || null,
      },
      searchConsole: {
        status: "disconnected",
        statusLabel: "غير متصل",
        note: "يتطلب ربط حساب Google Search Console المعتمد من المالك",
      },
      tagManager: {
        status: gtmConfigured ? "configured" : "disconnected",
        statusLabel: gtmConfigured ? "مفعل" : "غير متصل",
        id: trackingDoc?.gtmContainerId || null,
      },
      metaPixel: {
        status: metaConfigured ? "configured" : "disconnected",
        statusLabel: metaConfigured ? "مفعل" : "غير متصل",
      },
      snapPixel: {
        status: snapConfigured ? "configured" : "disconnected",
        statusLabel: snapConfigured ? "مفعل" : "غير متصل",
      },
      tiktokPixel: {
        status: tiktokConfigured ? "configured" : "disconnected",
        statusLabel: tiktokConfigured ? "مفعل" : "غير متصل",
      },
    },
    disclaimer: "بيانات التحليلات الخارجية تعكس الحالة الحقيقية للربط ولا تعرض أرقامًا وهمية.",
  });
}
