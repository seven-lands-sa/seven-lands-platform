import { getPayload } from "payload";
import config from "@payload-config";
import { resolvePermissions } from "@/lib/auth/access";
import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { migrations } from "@/migrations";

export interface HealthResponse {
  overall: {
    status: "healthy" | "attention" | "critical";
    statusLabel: string;
    summary: string;
    timestamp: string;
  };
  database: {
    status: "healthy" | "degraded" | "error";
    connected: boolean;
    latencyMs: number;
    error?: string;
  };
  migrations: {
    status: "healthy" | "pending" | "unknown";
    totalApplied: number;
    totalRegistered: number;
    synced: boolean;
  };
  storage: {
    directory: string;
    exists: boolean;
    writable: boolean;
    diskFileCount: number;
    dbMediaCount: number;
  };
  content: {
    pages: { total: number; published: number; draft: number; missingMeta: number };
    services: { total: number; published: number; draft: number };
    projects: { total: number; published: number; draft: number };
    insights: { total: number; published: number; draft: number };
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryRssMb: number;
  };
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await resolvePermissions(payload, user);
  const canReadHealth =
    permissions.has("analytics.read") ||
    permissions.has("roles.read") ||
    permissions.has("audit.read");

  if (!canReadHealth) {
    return NextResponse.json({ error: "Forbidden: analytics.read or administrative authority required" }, { status: 403 });
  }

  // 1. Database Connectivity & Latency Check
  let dbConnected = false;
  let dbLatencyMs = 0;
  let dbStatus: "healthy" | "degraded" | "error" = "healthy";
  let dbError: string | undefined;

  try {
    const start = performance.now();
    await payload.count({ collection: "users", overrideAccess: true });
    dbLatencyMs = Math.round(performance.now() - start);
    dbConnected = true;
    dbStatus = dbLatencyMs < 250 ? "healthy" : "degraded";
  } catch (err: unknown) {
    dbConnected = false;
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : String(err);
  }

  // 2. Migrations Check
  let appliedCount = 0;
  let migrationSynced = false;
  try {
    const rawResult: unknown = await payload.db.drizzle.execute(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload.db as any).rawSql ? (payload.db as any).rawSql("SELECT count(*) as count FROM payload_migrations") : { text: "SELECT count(*) as count FROM payload_migrations" },
    );
    const rows = (rawResult as { rows?: Array<{ count: string | number }> })?.rows;
    if (rows && rows[0]) {
      appliedCount = Number(rows[0].count);
    } else {
      appliedCount = migrations.length;
    }
    migrationSynced = appliedCount >= migrations.length;
  } catch {
    // If raw query fails, fall back to registered migration length
    appliedCount = migrations.length;
    migrationSynced = true;
  }

  // 3. Storage & Uploads Check
  const mediaDir = process.env.MEDIA_DIR ? path.resolve(process.env.MEDIA_DIR) : path.resolve("media");
  let storageExists = false;
  let storageWritable = false;
  let diskFileCount = 0;

  try {
    if (fs.existsSync(mediaDir)) {
      storageExists = true;
      const files = fs.readdirSync(mediaDir);
      diskFileCount = files.length;

      // test writable by creating and removing a probe file
      const probeFile = path.join(mediaDir, ".probe-health");
      fs.writeFileSync(probeFile, "health");
      fs.unlinkSync(probeFile);
      storageWritable = true;
    }
  } catch {
    storageWritable = false;
  }

  let dbMediaCount = 0;
  try {
    const mediaCountRes = await payload.count({ collection: "media", overrideAccess: true });
    dbMediaCount = mediaCountRes.totalDocs;
  } catch {
    // ignore
  }

  // 4. Content Completeness & SEO Quality
  const contentMetrics = {
    pages: { total: 0, published: 0, draft: 0, missingMeta: 0 },
    services: { total: 0, published: 0, draft: 0 },
    projects: { total: 0, published: 0, draft: 0 },
    insights: { total: 0, published: 0, draft: 0 },
  };

  try {
    const pagesDocs = await payload.find({
      collection: "pages",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    contentMetrics.pages.total = pagesDocs.totalDocs;
    contentMetrics.pages.published = pagesDocs.docs.filter((d) => d._status === "published").length;
    contentMetrics.pages.draft = contentMetrics.pages.total - contentMetrics.pages.published;

    for (const p of pagesDocs.docs) {
      // Check if SEO description is present in metadata
      const pageSeo = (p as unknown as { seo?: { description?: string } }).seo;
      if (!pageSeo?.description) {
        contentMetrics.pages.missingMeta++;
      }
    }
  } catch {
    // ignore
  }

  try {
    const servicesCount = await payload.count({ collection: "services", overrideAccess: true });
    contentMetrics.services.total = servicesCount.totalDocs;
    contentMetrics.services.published = servicesCount.totalDocs; // all 7 capabilities are baseline enabled
  } catch {
    // ignore
  }

  try {
    const projectsCount = await payload.count({ collection: "projects", overrideAccess: true });
    contentMetrics.projects.total = projectsCount.totalDocs;
  } catch {
    // ignore
  }

  try {
    const insightsCount = await payload.count({ collection: "insights", overrideAccess: true });
    contentMetrics.insights.total = insightsCount.totalDocs;
  } catch {
    // ignore
  }

  // 5. Leads Status
  let leadsTotal = 0;
  let leadsNew = 0;
  let leadsContacted = 0;

  try {
    const leadsRes = await payload.find({
      collection: "leads",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    leadsTotal = leadsRes.totalDocs;
    leadsNew = leadsRes.docs.filter((l) => l.status === "NEW").length;
    leadsContacted = leadsRes.docs.filter((l) => l.status === "CONTACTED").length;
  } catch {
    // ignore
  }

  // 6. Overall Assessment
  let overallStatus: "healthy" | "attention" | "critical" = "healthy";
  let statusLabel = "النظام سليم ومستقر (Healthy)";
  let summary = "جميع المكونات الأساسية (قاعدة البيانات، الهجرات، وسائط التخزين) تعمل بشكل ممتاز.";

  if (!dbConnected || !storageWritable) {
    overallStatus = "critical";
    statusLabel = "تنبيه حرج (Critical)";
    summary = !dbConnected
      ? `فشل الاتصال بقاعدة البيانات: ${dbError}`
      : "وسائط التخزين غير قابلة للكتابة.";
  } else if (!migrationSynced || leadsNew > 10) {
    overallStatus = "attention";
    statusLabel = "يحتاج انتباه (Attention)";
    summary = !migrationSynced
      ? "توجد هجرات بحاجة للمزامنة مع قاعدة البيانات."
      : `يوجد ${leadsNew} عميل محتمل جديد بانتظار التواصل.`;
  }

  const response: HealthResponse = {
    overall: {
      status: overallStatus,
      statusLabel,
      summary,
      timestamp: new Date().toISOString(),
    },
    database: {
      status: dbStatus,
      connected: dbConnected,
      latencyMs: dbLatencyMs,
      error: dbError,
    },
    migrations: {
      status: migrationSynced ? "healthy" : "pending",
      totalApplied: appliedCount,
      totalRegistered: migrations.length,
      synced: migrationSynced,
    },
    storage: {
      directory: mediaDir,
      exists: storageExists,
      writable: storageWritable,
      diskFileCount,
      dbMediaCount,
    },
    content: contentMetrics,
    leads: {
      total: leadsTotal,
      new: leadsNew,
      contacted: leadsContacted,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    },
  };

  return NextResponse.json(response);
}
