/**
 * The system pages — the routes that already exist on the public site (§4, §5, §62).
 *
 * `systemKey` is the stable identity an editor can never change; `path` is the locked public route.
 * Phase E migrates exactly the pages listed here with `migrated: true`, and nothing else.
 *
 * Hub shells (`/services`, `/work`, `/insights`) are deliberately NOT page documents in this phase:
 * their content belongs to Phase F domain records, and the phase brief is explicit that this phase
 * must not migrate service/project/article data.
 */
import type { LocalizedLabel } from "@/lib/blocks/types";

export type SystemPageKey = "home" | "about" | "contact" | "start-a-project" | "privacy" | "terms";

export type SystemPage = {
  key: SystemPageKey;
  /** Public route WITHOUT the locale prefix, exactly as the router sees it. Never editable. */
  path: string;
  label: LocalizedLabel;
  /** True when Phase E migrates and owns the page's content. */
  migrated: boolean;
  /** Core pages publish in both locales or not at all (§16). */
  requiresBothLocales: boolean;
  /** Static-authority note used in the admin UI and the docs. */
  note: LocalizedLabel;
};

export const SYSTEM_PAGES: Record<SystemPageKey, SystemPage> = {
  home: {
    key: "home",
    path: "/",
    label: { ar: "الرئيسية", en: "Home" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "أعلى الصفحات حساسية — تُنشر باللغتين معًا.", en: "The most sensitive page — publishes in both locales together." },
  },
  about: {
    key: "about",
    path: "/about",
    label: { ar: "من نحن", en: "About" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "لا تُضاف أي معلومة عن الشركة لم تُعتمد.", en: "No company facts are added unless they are approved." },
  },
  contact: {
    key: "contact",
    path: "/contact",
    label: { ar: "تواصل معنا", en: "Contact" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "بيانات التواصل تُقرأ من الإعدادات العامة، لا تُنسخ هنا.", en: "Contact details come from the global settings, never copied here." },
  },
  "start-a-project": {
    key: "start-a-project",
    path: "/start-a-project",
    label: { ar: "ابدأ مشروعك", en: "Start a project" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "النموذج نفسه يبقى مكوّنًا برمجيًا محميًا.", en: "The form itself stays a protected code-backed component." },
  },
  privacy: {
    key: "privacy",
    path: "/privacy",
    label: { ar: "سياسة الخصوصية", en: "Privacy policy" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "النص الحالي يُنقل كما هو — لا صياغة قانونية جديدة.", en: "Current wording is migrated as-is — no new legal text." },
  },
  terms: {
    key: "terms",
    path: "/terms",
    label: { ar: "الشروط والأحكام", en: "Terms & conditions" },
    migrated: true,
    requiresBothLocales: true,
    note: { ar: "النص الحالي يُنقل كما هو.", en: "Current wording is migrated as-is." },
  },
};

export const SYSTEM_PAGE_KEYS = Object.keys(SYSTEM_PAGES) as SystemPageKey[];

export function isSystemPageKey(value: unknown): value is SystemPageKey {
  return typeof value === "string" && value in SYSTEM_PAGES;
}

export function systemPage(key: SystemPageKey): SystemPage {
  return SYSTEM_PAGES[key];
}
