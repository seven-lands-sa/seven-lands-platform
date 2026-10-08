# 15 — Drafts, Revisions and Publishing

## 1. Content lifecycle

```
draft ──(publish)──▶ published ──(schedule)──▶ published@future
  ▲                     │
  │                     ├──(unpublish)──▶ draft (still referenced internally)
  └──(restore)──────────┤
                        └──(archive)──▶ archived (hidden, reversible; never hard-deleted by default)
```

Every editorial collection (pages, services, projects, articles, legal text) supports:
`draft` · `published` · `scheduled` · `archived`, plus `publishAt` for scheduling.

## 2. What "publish" actually does

1. Server-side permission check (`*.publish`).
2. Validation of the full document, including required translations per the policy below.
3. Version snapshot written (`version` record with author + timestamp).
4. Cache invalidation: `revalidateTag("page:<slug>")`, `revalidateTag("services")`,
   `revalidatePath("/ar/services/branding-creative")` etc. — **only the affected surfaces**.
5. Sitemap regenerated (ISR) if the URL set changed (new project/article/service).
6. Audit event written.
7. Optional re-index ping.

Result: a published change appears in seconds, without rebuilding the site.

## 3. Required translations policy

> **Owner amendment, 2026-10-07 — this table supersedes the earlier draft.**
> There is **no AR→EN visual fallback**: Arabic must never appear inside the English website.
> Publication for a locale is allowed only when every required *visible* field for that locale is
> complete. Incomplete → publication is blocked, or (only where architecture allows) the optional
> block is omitted for that locale. Non-visible metadata (e.g. image alt) may fall back, explicitly
> and flagged.

| Content | Publish rule per locale |
| --- | --- |
| Home / static page blocks | AR required. EN: all required visible fields must be complete, otherwise **EN publication is blocked**; an *optional* block with incomplete EN is omitted from the EN render instead |
| Services | AR required. EN publication requires title, promise, intro, capabilities and FAQ complete; otherwise blocked |
| Projects | AR required. EN publication requires title, summary, narrative and results complete; otherwise blocked |
| Articles | Both required — an article is a written artefact; a half-translated article is not published |
| Legal text | Both required **and** legal status must be `approved` before the page leaves `noindex` |
| Settings / navigation | AR required. EN publication requires the visible labels complete; otherwise EN falls back to… **blocking**, not to Arabic. Missing EN labels must be filled before EN goes live |

The admin shows the computed state of every localised document — **Translated · Partially
translated · Missing translation** — and the publish button states the reason when it is disabled.

## 4. Preview

- Editor clicks "معاينة" → opens the real public URL with a signed preview token
  (Next draft mode cookie, scoped, short-lived, per-session).
- The frontend content adapter detects preview mode and reads the **draft** revision instead of the
  published one — same components, same layout, real rendering (no iframe simulator).
- Preview is shareable internally (token link, expires) so the owner can review on their phone.
- Drafts are never reachable without the token: a draft slug that is not published answers the
  normal 404 to the public.
- The preview bar shows: page, locale switcher (AR/EN), "مسودة" badge, and "نشر" when allowed.

## 5. Autosave

- Enabled for long-form editing: articles, project narratives, page blocks.
- Autosave writes a **draft revision** every ~20 s of idle typing, never a publish.
- The editor shows "تم الحفظ تلقائيًا 14:32" and a conflict notice if two sessions edit the same
  document (second session is warned and offered a diff).

## 6. Revisions and restore

- Every published version is retained (configurable retention: keep last 20 + all publish events).
- Revision screen: list (author, time, status), diff summary of changed fields, "استعادة" action
  which creates a **new draft** from the old version (it never silently overwrites live content).
- Restore is itself audited.

## 7. Deletion strategy

| Content | Behaviour |
| --- | --- |
| Draft (never published) | hard delete allowed with confirmation |
| Published page/service/project/article | **archive** by default (404 with a branded "removed" state is a Phase-2 nicety); permanent delete requires Super Admin + typed confirmation + audit |
| Media | blocked while referenced (see `08_…` §4) |
| Leads | never hard-deleted by UI; retention policy handles expiry |

## 8. Why this matters commercially

The failure mode we are protecting against is not malicious — it is a normal person editing the
homepage at 11 pm and breaking the hero before a meeting. Revisions + preview + schedule make that
survivable, and they are cheap once the CMS provides them.
