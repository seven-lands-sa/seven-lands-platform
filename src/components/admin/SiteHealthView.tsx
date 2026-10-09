"use client";

import { useEffect, useState } from "react";
import type { HealthResponse } from "@/app/api/admin/health/route";

export function SiteHealthView() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = () => {
    setRefreshing(true);
    fetch("/api/admin/health")
      .then((res) => {
        if (!res.ok) throw new Error("تعذر جلب تقرير صحة النظام أو عدم توفر الصلاحية المطلوبة.");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/health")
      .then((res) => {
        if (!res.ok) throw new Error("تعذر جلب تقرير صحة النظام أو عدم توفر الصلاحية المطلوبة.");
        return res.json();
      })
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl", fontFamily: "var(--font-arabic)" }}>
        <p style={{ color: "#475569" }}>جاري فحص مؤشرات صحة النظام وتشخيص المكونات...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl", fontFamily: "var(--font-arabic)" }}>
        <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 0.5rem 0" }}>خطأ في تشخيص النظام</h2>
          <p style={{ margin: 0 }}>{error || "تعذر فحص صحة النظام."}</p>
        </div>
      </div>
    );
  }

  const statusBg =
    data.overall.status === "healthy" ? "#ecfdf5" : data.overall.status === "attention" ? "#fffbeb" : "#fef2f2";
  const statusBorder =
    data.overall.status === "healthy" ? "#a7f3d0" : data.overall.status === "attention" ? "#fde68a" : "#fecaca";
  const statusColor =
    data.overall.status === "healthy" ? "#065f46" : data.overall.status === "attention" ? "#92400e" : "#991b1b";

  return (
    <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl", fontFamily: "var(--font-arabic)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#061428", margin: "0 0 0.5rem 0" }}>
            صحة النظام والتشخيص المباشر
          </h1>
          <p style={{ color: "#475569", margin: 0, fontSize: "0.95rem" }}>
            مراقبة حية لجاهزية قاعدة البيانات والهجرات ووسائط التخزين واكتمال المحتوى.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          disabled={refreshing}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#061428",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.7 : 1,
            fontSize: "0.9rem",
            transition: "opacity 0.2s",
          }}
        >
          {refreshing ? "جاري التحديث..." : "تحديث الفحص الآن"}
        </button>
      </div>

      {/* Overall Status Banner */}
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: statusBg,
          border: `1px solid ${statusBorder}`,
          borderRadius: "12px",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: data.overall.status === "healthy" ? "#10b981" : data.overall.status === "attention" ? "#f59e0b" : "#ef4444",
              }}
            />
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: statusColor, margin: 0 }}>
              {data.overall.statusLabel}
            </h2>
          </div>
          <p style={{ color: statusColor, margin: 0, fontSize: "0.95rem" }}>{data.overall.summary}</p>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#64748b", direction: "ltr" }}>
          {new Date(data.overall.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Grid Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Database & Migrations */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#061428", margin: "0 0 1rem 0" }}>
            قاعدة البيانات والهجرات
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>حالة الاتصال:</span>
              <span style={{ fontWeight: "600", color: data.database.connected ? "#10b981" : "#ef4444" }}>
                {data.database.connected ? "متصل بنجاح" : "غير متصل"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>زمن الاستجابة:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.database.latencyMs} مللي ثانية</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>الهجرات المطبقة:</span>
              <span style={{ fontWeight: "600", color: data.migrations.synced ? "#10b981" : "#f59e0b" }}>
                {data.migrations.totalApplied} من أصل {data.migrations.totalRegistered}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>تزامن الهيكل (Schema):</span>
              <span style={{ fontWeight: "600", color: data.migrations.synced ? "#10b981" : "#f59e0b" }}>
                {data.migrations.synced ? "متزامن بالكامل (push: false)" : "بانتظار المزامنة"}
              </span>
            </div>
          </div>
        </div>

        {/* Media Storage */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#061428", margin: "0 0 1rem 0" }}>
            وسائط التخزين والملفات
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>مجلد التخزين:</span>
              <span style={{ fontWeight: "600", color: data.storage.exists ? "#10b981" : "#ef4444" }}>
                {data.storage.exists ? "موجود وجاهز" : "غير موجود"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>صلاحية الكتابة:</span>
              <span style={{ fontWeight: "600", color: data.storage.writable ? "#10b981" : "#ef4444" }}>
                {data.storage.writable ? "قابلة للكتابة والتعديل" : "محمية / للقراءة فقط"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>عدد الملفات على القرص:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.storage.diskFileCount} ملف</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>سجلات الوسائط في النظام:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.storage.dbMediaCount} سجل</span>
            </div>
          </div>
        </div>

        {/* Content Completeness */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#061428", margin: "0 0 1rem 0" }}>
            اكتمال المحتوى والتهيئة
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>الصفحات:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>
                {data.content.pages.published} منشورة ({data.content.pages.total} إجمالي)
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>المجالات والخدمات:</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>{data.content.services.total} مجالات جاهزة</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>الأعمال المعتمدة:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>
                {data.content.projects.total === 0 ? "صفرية مهنية (بانتظار عملاء حقيقيين)" : `${data.content.projects.total} أعمال`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>مقالات الرؤى:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>
                {data.content.insights.total === 0 ? "صفرية مهنية (بانتظار نشر مقالات)" : `${data.content.insights.total} مقالات`}
              </span>
            </div>
          </div>
        </div>

        {/* Runtime & Server Specs */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#061428", margin: "0 0 1rem 0" }}>
            بيئة التشغيل والذاكرة
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>إصدار Node.js:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.system.nodeVersion}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>نظام التشغيل:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.system.platform}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>استهلاك الذاكرة (RSS):</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>{data.system.memoryRssMb} ميجابايت</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>مدة تشغيل الخادم:</span>
              <span style={{ fontWeight: "600", color: "#061428" }}>
                {Math.floor(data.system.uptimeSeconds / 60)} دقيقة ({data.system.uptimeSeconds} ثانية)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
