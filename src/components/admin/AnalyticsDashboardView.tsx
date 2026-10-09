"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  leadSummary: {
    totalLeads: number;
    recent: Array<{
      id: string | number;
      reference: string;
      name: string;
      company: string | null;
      status: string;
      createdAt: string;
    }>;
  };
  sources: {
    googleAnalytics: { status: string; statusLabel: string; id: string | null };
    searchConsole: { status: string; statusLabel: string; note?: string };
    tagManager: { status: string; statusLabel: string; id: string | null };
    metaPixel: { status: string; statusLabel: string };
    snapPixel: { status: string; statusLabel: string };
    tiktokPixel: { status: string; statusLabel: string };
  };
  disclaimer: string;
}

export function AnalyticsDashboardView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("تعذر جلب بيانات التحليلات أو عدم توفر الصلاحية.");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl" }}>
        <p>جاري تحميل لوحة المؤشرات والتحليلات...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl" }}>
        <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px" }}>
          {error || "حدث خطأ أثناء تحميل لوحة المؤشرات."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "0 0 0.5rem 0", color: "#061428" }}>
          لوحة التحليلات والمؤشرات (Analytics V1)
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9375rem" }}>
          متابعة مباشرة لطلبات المشاريع وحالة ربط المنصات التحليلية والإعلانية.
        </p>
      </header>

      {/* ── Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>إجمالي طلبات المشاريع (Leads)</span>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#061428", marginTop: "0.5rem" }}>
            {data.leadSummary.totalLeads}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#10b981", display: "inline-block", marginTop: "0.25rem" }}>
            قاعدة بيانات محلية موثوقة (PostgreSQL)
          </span>
        </div>

        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Google Analytics 4</span>
          <div style={{ fontSize: "1.25rem", fontWeight: "600", color: data.sources.googleAnalytics.status === "configured" ? "#0284c7" : "#64748b", marginTop: "0.5rem" }}>
            {data.sources.googleAnalytics.statusLabel}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-block", marginTop: "0.25rem" }}>
            {data.sources.googleAnalytics.id ? `المعرّف: ${data.sources.googleAnalytics.id}` : "لم يتم ضبط معرّف GA4"}
          </span>
        </div>

        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Google Search Console</span>
          <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#64748b", marginTop: "0.5rem" }}>
            {data.sources.searchConsole.statusLabel}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "inline-block", marginTop: "0.25rem" }}>
            يتطلب إثبات ملكية النطاق (Owner Gate G3)
          </span>
        </div>
      </div>

      {/* ── Pixels & Marketing Channels ── */}
      <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", margin: "0 0 1rem 0", color: "#061428" }}>
          حالة منصات التتبع والإعلانات (Marketing & Pixels)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>Meta Pixel</span>
            <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: data.sources.metaPixel.status === "configured" ? "#10b981" : "#64748b" }}>
              {data.sources.metaPixel.statusLabel}
            </div>
          </div>
          <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>Snapchat Pixel</span>
            <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: data.sources.snapPixel.status === "configured" ? "#10b981" : "#64748b" }}>
              {data.sources.snapPixel.statusLabel}
            </div>
          </div>
          <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>TikTok Pixel</span>
            <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: data.sources.tiktokPixel.status === "configured" ? "#10b981" : "#64748b" }}>
              {data.sources.tiktokPixel.statusLabel}
            </div>
          </div>
          <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>Google Tag Manager</span>
            <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: data.sources.tagManager.status === "configured" ? "#10b981" : "#64748b" }}>
              {data.sources.tagManager.statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Inquiries ── */}
      <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", margin: "0 0 1rem 0", color: "#061428" }}>
          أحدث استفسارات المشاريع (First-Party Leads)
        </h2>
        {data.leadSummary.recent.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>لا توجد طلبات مشاريع حتى الآن.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>المرجع</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>الاسم</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>الجهة</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>الحالة</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {data.leadSummary.recent.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace" }}>{lead.reference}</td>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500" }}>{lead.name}</td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#64748b" }}>{lead.company || "—"}</td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", backgroundColor: "#f1f5f9", color: "#334155" }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#64748b" }}>
                    {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
