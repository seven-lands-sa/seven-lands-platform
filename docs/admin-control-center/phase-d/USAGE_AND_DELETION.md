# Phase D — Usage tracking and safe deletion

The question this answers is the one an editor actually has: **"if I delete this, what breaks?"** —
and its mirror image, "where is this picture being used?"

Evidence: suite §4 "USAGE AND SAFE DELETION" (part of the 94/94 run in
`.phase-d-evidence/verify-phase-d.log`), browser pass `.phase-d-evidence/admin-flows-results.json`,
plus the audit rows in `audit_events` (`media_delete_blocked`).

---

## 1 · The model: explicit references, resolved live

`src/lib/media/usage.ts` holds a **registry** of the paths that can carry a media reference:

```ts
{ slug: "site-settings", label: "الإعدادات العامة",
  adminPath: "/admin/globals/site-settings",
  fields: { "brand.logo": "الشعار الأساسي",
            "brand.logoLight": "نسخة للخلفيات الداكنة",
            "brand.logoDark": "نسخة للخلفيات الفاتحة",
            "brand.favicon": "أيقونة الموقع",
            "brand.defaultOgImage": "صورة المشاركة الافتراضية" } }
```

For every registered path, `findMediaUsage(payload, id)` asks the database whether any document
actually points at this media id, and returns where:

```json
{ "kind": "global", "slug": "site-settings", "label": "الإعدادات العامة",
  "fieldPath": "brand.defaultOgImage", "fieldLabel": "صورة المشاركة الافتراضية",
  "href": "/admin/globals/site-settings" }
```

Design decisions, and why:

- **Registry, not a repository text search.** A grep over `.tsx` files can only find assets
  hard-coded in code — which is exactly the practice this CMS replaces. The authoritative answer is in
  the database, so the registry names the *paths* and Payload does the querying.
- **Query, never cache.** A stored "usage: 2" column goes stale the moment someone edits a page. A
  stale counter in front of a delete button is the one failure this system must not have.
- **Future-compatible by shape, not by guessing.** Phase E adds one line per new content type
  (`pages.heroImage`, `services.cover`, `projects.images`, `articles.thumbnail`, …) and nothing else
  changes — the endpoint, the panel, the delete block and the audit all read the same registry.

Phase D wires **every entity that exists today**: the five brand fields of Site Settings (logo,
logoLight, logoDark, favicon, default OG image). Nothing else in the current schema can reference
media, and unused assets correctly report **zero** (verified: a fresh upload reports 0 usages in the
API, in `library-meta`, and in the admin panel).

## 2 · The API surface

| Endpoint | Returns |
| --- | --- |
| `GET /api/media/:id/usage` | reference list + count for one asset (nothing else). |
| `GET /api/media/library-meta?ids=a,b,c` | batched per-tile facts: usage count, alt/caption completeness per locale, decorative flag — one request per grid page. |
| `GET /api/media/capabilities` | the caller's effective media permissions (what the UI may offer). |

The library grid shows the usage count as a chip; the detail view shows the full list with links.

## 3 · Deletion rules (V1)

| Case | Behaviour |
| --- | --- |
| **Unused asset** | Deletes after a confirmation dialog. Original + every derivative are removed from storage; the row disappears; `media_deleted` is audited. |
| **Referenced asset** | **Blocked**, with the Arabic message listing exactly where it is used (below). Nothing is nulled, nothing is silently detached — the references stay intact until a human removes them deliberately. |
| **Bulk delete** | Runs per asset. Deletable ones go, protected ones are skipped and reported by name/count in Arabic. |
| **Force delete** | **Does not exist in V1** (§19). No casual override button, no hidden flag. |

The refusal, verbatim:

```
لا يمكن حذف هذه الصورة لأنها مستخدمة في:
• الإعدادات العامة → صورة المشاركة الافتراضية
```

It reaches the editor through the API (400 with that message), through the disabled delete button in
the detail view, and through a visible note next to the button:

> لا يمكن حذف هذا الملف لأنه مستخدم في الموقع (1 موضع) — راجع قسم «أين تُستخدم هذه الصورة» أعلاه،
> وأزل الاستخدام أولًا.

Verified end-to-end: the referenced delete returns 400 with the message above; the asset and its
references are untouched; removing the reference in Site Settings makes the very same asset deletable
again (no cached state, no restart).

## 4 · Audit

Six media actions are recorded in `audit_events` with actor, asset, changed field and timestamp:
`media_uploaded · media_updated · media_binary_replaced · media_visibility_changed · media_deleted ·
media_delete_blocked`. The binary is never logged — only hashes and metadata.

One deliberate implementation detail: **`media_delete_blocked` is written in its own transaction.**
Payload wraps a delete in a transaction, and a blocked delete throws — so an audit row written inside
that transaction would vanish with the rollback, making refused deletions the one thing the security
log never showed. `recordAuditEvent({ detached: true })` opens a separate connection and copies the
request metadata into the entry instead. This was caught by the suite (the check "audit records
media_delete_blocked" failed until the row was moved out of the transaction).

## 5 · The rule Phase E inherits

**Public content + private referenced media = publication blocked.** Phase D does not implement the
publishing gate (that belongs to the phases that own pages), but it exposes everything such a gate
needs:

- `visibility` on every media document (and `library-meta` for batch checks),
- `resolvePublicMedia()` returning `null` for private assets — the resolver already refuses to render
  them,
- `collectMediaIds()` walking an arbitrary document graph and returning the media ids it references,
- `findMediaUsage()` answering the reverse question.

Nothing auto-publicises an asset: an editor must flip visibility explicitly, and the transition is
audited.
