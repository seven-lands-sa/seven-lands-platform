"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResultItem } from "@/app/api/admin/search/route";

const COLLECTIONS = [
  { key: "all", label: "الكل" },
  { key: "pages", label: "الصفحات" },
  { key: "services", label: "المجالات" },
  { key: "projects", label: "الأعمال" },
  { key: "insights", label: "الرؤى" },
  { key: "leads", label: "العملاء المحتملون" },
  { key: "media", label: "الوسائط" },
  { key: "redirects", label: "التحويلات" },
];

export function GlobalSearchView() {
  const [query, setQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isShortQuery = query.trim().length < 2;
  const visibleResults = isShortQuery ? [] : results;
  const isSearched = isShortQuery ? false : searched;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      const url = new URL("/api/admin/search", window.location.origin);
      url.searchParams.set("q", trimmed);
      if (selectedCollection !== "all") {
        url.searchParams.set("collection", selectedCollection);
      }

      fetch(url.toString())
        .then((res) => {
          if (!res.ok) throw new Error("Search failed");
          return res.json();
        })
        .then((data) => {
          setResults(data.results || []);
          setSearched(true);
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setSearched(true);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCollection]);

  return (
    <div style={{ padding: "2rem", maxWidth: "75rem", margin: "0 auto", direction: "rtl", fontFamily: "var(--font-arabic)" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#061428", margin: "0 0 0.5rem 0" }}>
          البحث الشامل في لوحة التحكم
        </h1>
        <p style={{ color: "#475569", margin: 0, fontSize: "0.95rem" }}>
          بحث فوري وسريع عبر جميع الصفحات، المجالات، الأعمال، المقالات، الوسائط، التحويلات وطلبات العملاء.
        </p>
      </div>

      {/* Search Input Box */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الرابط، رقم العميل، أو الكلمات المفتاحية... (حرفين على الأقل)"
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              fontSize: "1.1rem",
              borderRadius: "12px",
              border: "2px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#061428",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1b324a")}
            onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
          />
          {loading && (
            <div
              style={{
                position: "absolute",
                left: "1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "#64748b",
              }}
            >
              جاري البحث...
            </div>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
        {COLLECTIONS.map((c) => {
          const active = selectedCollection === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCollection(c.key)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: active ? "600" : "500",
                backgroundColor: active ? "#061428" : "#f1f5f9",
                color: active ? "#ffffff" : "#475569",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Results Container */}
      <div>
        {isSearched && visibleResults.length === 0 && !loading && (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
            }}
          >
            <p style={{ color: "#64748b", fontSize: "1rem", margin: "0 0 0.5rem 0" }}>
              لم يتم العثور على أي نتائج تطابق «{query}»
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              جرّب استخدام كلمات أخرى أو تغيير الفئة المحددة.
            </p>
          </div>
        )}

        {visibleResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>
              تم العثور على {visibleResults.length} نتيجة:
            </div>
            {visibleResults.map((item) => (
              <a
                key={`${item.collection}-${item.id}`}
                href={item.url}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#7a9cc6";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      {item.collectionLabel}
                    </span>
                    <span style={{ fontWeight: "600", color: "#061428", fontSize: "1rem" }}>{item.title}</span>
                  </div>
                  {item.subtitle && (
                    <div style={{ color: "#64748b", fontSize: "0.85rem", direction: "ltr", textAlign: "right" }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {item.badge && (
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span style={{ color: "#7a9cc6", fontSize: "1.2rem", fontWeight: "bold" }}>←</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {!searched && (
          <div
            style={{
              padding: "2.5rem 1.5rem",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "#061428", margin: "0 0 0.5rem 0" }}>
              نصائح للبحث السريع:
            </h3>
            <ul style={{ margin: 0, paddingRight: "1.25rem", color: "#475569", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li>ابحث برقم مرجع العميل (مثل: <code style={{ direction: "ltr" }}>SL-202610</code>) للوصول المباشر للطلب.</li>
              <li>ابحث بمسار الصفحة (مثل: <code style={{ direction: "ltr" }}>services</code> أو <code style={{ direction: "ltr" }}>about</code>).</li>
              <li>ابحث باسم الملف أو امتداده للوصول إلى أصول ومرفقات الوسائط.</li>
              <li>ابحث بعنوان التحويل للعثور على قواعد إعادة التوجيه الحالية.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
