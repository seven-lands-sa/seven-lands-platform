"use client";

import { useField } from "@payloadcms/ui";
import { useMemo, useState } from "react";

import { ICONS, STROKE_ICONS, SocialIcon, type SocialIconKey } from "@/components/ui/SocialIcon";

/**
 * Curated icon picker for the admin (§16/§17).
 *
 * A searchable, previewable grid over the curated registry — the database stores only a safe key.
 * There is no way to paste SVG, a class name or a URL into an icon field.
 *
 * Styling note: the admin panel does not load the public Tailwind stylesheet, so this component
 * uses Payload's own classes for typography and inline styles for layout. It must render correctly
 * without any of the site's CSS.
 */

type IconEntry = { key: string; labelAr: string; labelEn: string; stroked: boolean };

type IconPickerProps = {
  path: string;
  field?: {
    label?: unknown;
    admin?: { description?: string };
  };
};

const labelOf = (label: unknown, fallback: string): string => {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    const record = label as Record<string, unknown>;
    if (typeof record.ar === "string") return record.ar;
    if (typeof record.en === "string") return record.en;
  }
  return fallback;
};

const ALL_ICONS: IconEntry[] = [
  ...Object.entries(ICONS).map(([key, definition]) => ({
    key,
    labelAr: definition.labelAr,
    labelEn: definition.labelEn,
    stroked: false,
  })),
  ...Object.entries(STROKE_ICONS).map(([key, definition]) => ({
    key,
    labelAr: definition.labelAr,
    labelEn: definition.labelEn,
    stroked: true,
  })),
];

export function IconPickerField({ path, field }: IconPickerProps) {
  const { value, setValue } = useField<string>({ path });
  const [query, setQuery] = useState("");

  const label = labelOf(field?.label, "الأيقونة");
  const description = field?.admin?.description;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ALL_ICONS;
    return ALL_ICONS.filter(
      (entry) =>
        entry.key.includes(needle) ||
        entry.labelAr.includes(needle) ||
        entry.labelEn.toLowerCase().includes(needle),
    );
  }, [query]);

  const selected = typeof value === "string" ? value : "";

  return (
    <div className="field-type" style={{ marginBottom: "1.25rem" }}>
      <label className="field-label" htmlFor={`${path}-search`} style={{ display: "block", marginBottom: "0.5rem" }}>
        {label}
      </label>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          id={`${path}-search`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن أيقونة…"
          className="text"
          style={{ flex: "1 1 14rem", minWidth: "10rem", padding: "0.5rem 0.75rem" }}
        />
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={() => {
            setValue("");
            setQuery("");
          }}
          disabled={!selected}
        >
          مسح الاختيار
        </button>
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))",
          gap: "0.5rem",
          marginTop: "0.75rem",
          maxHeight: "18rem",
          overflowY: "auto",
          padding: "0.25rem",
        }}
      >
        {results.map((entry) => {
          const isSelected = selected === entry.key;
          return (
            <button
              key={entry.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setValue(entry.key)}
              title={entry.labelEn}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.6rem 0.4rem",
                borderRadius: "10px",
                cursor: "pointer",
                background: isSelected ? "var(--theme-elevation-100)" : "transparent",
                border: isSelected
                  ? "1px solid var(--theme-elevation-400)"
                  : "1px solid var(--theme-elevation-100)",
                color: "inherit",
                font: "inherit",
              }}
            >
              <SocialIcon name={entry.key as SocialIconKey} size={22} />
              <span style={{ fontSize: "0.7rem", lineHeight: 1.3, textAlign: "center" }}>
                {entry.labelAr}
              </span>
            </button>
          );
        })}
        {results.length === 0 && (
          <p className="description" style={{ gridColumn: "1 / -1", margin: 0 }}>
            لا توجد أيقونة بهذا الاسم.
          </p>
        )}
      </div>

      {description && (
        <p className="description" style={{ marginTop: "0.5rem" }}>
          {description}
        </p>
      )}
    </div>
  );
}

export default IconPickerField;
