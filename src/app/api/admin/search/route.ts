import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { resolvePermissions } from "@/lib/auth/access";
import { NextResponse, type NextRequest } from "next/server";

export interface SearchResultItem {
  id: string | number;
  collection: string;
  collectionLabel: string;
  title: string;
  subtitle?: string;
  url: string;
  status?: string;
  badge?: string;
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const authRes = await payload.auth({ headers: req.headers });
  const user = authRes.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await resolvePermissions(payload, user);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const collectionFilter = searchParams.get("collection"); // optional filter

  if (!q || q.length < 2) {
    return NextResponse.json({ query: q, results: [], total: 0 });
  }

  const results: SearchResultItem[] = [];

  const searches: Promise<void>[] = [];

  // 1. Pages (requires pages.read)
  if (permissions.has("pages.read") && (!collectionFilter || collectionFilter === "pages")) {
    searches.push(
      (async () => {
        try {
          const systemKeys = ["home", "about", "contact", "start-a-project", "privacy", "terms"];
          const matchingSystemKey = systemKeys.find((k) => k.includes(q.toLowerCase()));

          const whereConditions: Where[] = [{ slug: { like: q } }];
          if (matchingSystemKey) {
            whereConditions.push({ systemKey: { equals: matchingSystemKey } });
          }

          const res = await payload.find({
            collection: "pages",
            where: { or: whereConditions },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            const label = doc.systemKey ? `صفحة نظام (${doc.systemKey})` : `صفحة مخصصة (${doc.slug})`;
            results.push({
              id: doc.id,
              collection: "pages",
              collectionLabel: "الصفحات",
              title: label,
              subtitle: doc.slug ? `/${doc.slug}` : `/${doc.systemKey}`,
              url: `/admin/collections/pages/${doc.id}`,
              status: doc._status || "draft",
              badge: doc.systemKey ? "نظام" : "مخصص",
            });
          }
        } catch {
          // ignore individual search failure
        }
      })(),
    );
  }

  // 2. Services (requires services.read)
  if (permissions.has("services.read") && (!collectionFilter || collectionFilter === "services")) {
    searches.push(
      (async () => {
        try {
          // All 7 capability services are fetched and filtered in memory to avoid PostgreSQL enum operator mismatch
          const res = await payload.find({
            collection: "services",
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          const lowerQ = q.toLowerCase();
          for (const doc of res.docs) {
            const matches =
              (doc.landKey && String(doc.landKey).toLowerCase().includes(lowerQ)) ||
              (doc.glyph && String(doc.glyph).toLowerCase().includes(lowerQ));

            if (matches) {
              results.push({
                id: doc.id,
                collection: "services",
                collectionLabel: "المجالات والخدمات",
                title: `مجال ${doc.landKey}`,
                subtitle: `/services/${doc.landKey}`,
                url: `/admin/collections/services/${doc.id}`,
                status: doc._status || "published",
                badge: `مجال ${doc.order || ""}`,
              });
            }
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  // 3. Projects (requires projects.read)
  if (permissions.has("projects.read") && (!collectionFilter || collectionFilter === "projects")) {
    searches.push(
      (async () => {
        try {
          const res = await payload.find({
            collection: "projects",
            where: {
              or: [
                { slug: { like: q } },
                { client: { like: q } },
              ],
            },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            results.push({
              id: doc.id,
              collection: "projects",
              collectionLabel: "الأعمال",
              title: doc.client ? `مشروع ${doc.client}` : `مشروع (${doc.slug})`,
              subtitle: `/work/${doc.slug}`,
              url: `/admin/collections/projects/${doc.id}`,
              status: doc._status || "draft",
              badge: doc.client || undefined,
            });
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  // 4. Insights (requires insights.read)
  if (permissions.has("insights.read") && (!collectionFilter || collectionFilter === "insights")) {
    searches.push(
      (async () => {
        try {
          const res = await payload.find({
            collection: "insights",
            where: {
              or: [
                { slug: { like: q } },
                { category: { like: q } },
                { author: { like: q } },
              ],
            },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            results.push({
              id: doc.id,
              collection: "insights",
              collectionLabel: "الرؤى والمقالات",
              title: `مقال (${doc.slug})`,
              subtitle: doc.category || `/insights/${doc.slug}`,
              url: `/admin/collections/insights/${doc.id}`,
              status: doc._status || "draft",
              badge: doc.category || undefined,
            });
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  // 5. Leads (requires leads.read)
  if (permissions.has("leads.read") && (!collectionFilter || collectionFilter === "leads")) {
    searches.push(
      (async () => {
        try {
          const res = await payload.find({
            collection: "leads",
            where: {
              or: [
                { reference: { like: q } },
                { name: { like: q } },
                { company: { like: q } },
                { phone: { like: q } },
                { email: { like: q } },
              ],
            },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            results.push({
              id: doc.id,
              collection: "leads",
              collectionLabel: "العملاء المحتملون",
              title: `${doc.name} (${doc.reference})`,
              subtitle: [doc.company, doc.phone].filter(Boolean).join(" · "),
              url: `/admin/collections/leads/${doc.id}`,
              status: doc.status,
              badge: doc.status,
            });
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  // 6. Media (requires media.read)
  if (permissions.has("media.read") && (!collectionFilter || collectionFilter === "media")) {
    searches.push(
      (async () => {
        try {
          const res = await payload.find({
            collection: "media",
            where: {
              or: [
                { filename: { like: q } },
              ],
            },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            results.push({
              id: doc.id,
              collection: "media",
              collectionLabel: "مكتبة الوسائط",
              title: doc.filename || `ملف #${doc.id}`,
              subtitle: doc.mimeType || undefined,
              url: `/admin/collections/media/${doc.id}`,
              badge: doc.mimeType?.split("/")[1] || "ملف",
            });
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  // 7. Redirects (requires seo.read)
  if (permissions.has("seo.read") && (!collectionFilter || collectionFilter === "redirects")) {
    searches.push(
      (async () => {
        try {
          const res = await payload.find({
            collection: "redirects",
            where: {
              or: [
                { from: { like: q } },
                { to: { like: q } },
              ],
            },
            limit: 10,
            depth: 0,
            overrideAccess: true,
          });

          for (const doc of res.docs) {
            results.push({
              id: doc.id,
              collection: "redirects",
              collectionLabel: "التحويلات",
              title: `${doc.from} → ${doc.to}`,
              subtitle: `رمز الحالة: ${doc.statusCode}`,
              url: `/admin/collections/redirects/${doc.id}`,
              badge: `${doc.statusCode}`,
            });
          }
        } catch {
          // ignore
        }
      })(),
    );
  }

  await Promise.all(searches);

  return NextResponse.json({
    query: q,
    results,
    total: results.length,
  });
}
