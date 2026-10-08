# 03 — Recommended Architecture (Decision Record)

## RECOMMENDED_ADMIN_ARCHITECTURE

**Payload CMS 3 embedded in the existing Next.js 16 application, behind a content-adapter layer,
with PostgreSQL and S3-compatible object storage, and the current typed static content retained as
a fallback provider.**

Concretely:

```
sevnland.com                      (same Next.js app, same repo, same deploy)
├── /(public)                     marketing site — unchanged design, unchanged performance budget
│     └── data comes from  src/lib/content/*  ←  the ONLY new indirection
│                                 ├── provider "cms"       (Payload Local API)
│                                 └── provider "static"    (today's src/content/* + messages)
├── /admin                        Payload admin UI (isolated route segment, own bundle)
└── /api/*                        brief endpoint (unchanged contract) + preview + tracker endpoints
```

## WHY

1. **The requested modules are CMS primitives, not bespoke features.** Field-level AR/EN
   localization with status, typed blocks, media with alt text, RBAC, drafts/versions, preview,
   scheduling and audit are exactly the things a CMS has already solved. Building them by hand
   costs months and lands us with an unsupported internal tool.
2. **It keeps the public site's performance.** Admin code lives under `/admin` and never enters
   the public bundle; the marketing routes keep PPR and the current ~272 kB budget.
3. **It fits the existing architecture.** App Router + TypeScript strict + server components.
   Payload's Local API is callable directly from server components, so pages keep rendering on
   the server with no HTTP round-trips and no client-side data fetching.
4. **The design system stays in code.** Block *types* and *variants* are code; only their
   *instances* are content. This is the "controlled flexibility" the brief demands.
5. **No vendor lock-in.** Payload is MIT-licensed and self-hosted; the database is plain Postgres;
   if we ever leave, the data is ours.
6. **Arabic-first is achievable.** The admin UI can be rendered RTL with Arabic labels, and content
   fields are paired AR/EN — not two disconnected records.
7. **It is honest about the fallback.** The static provider means we can ship the adapter, verify
   byte-identical output, and *then* migrate content — with a one-line rollback if anything drifts.

## REJECTED_ALTERNATIVES

| Rejected | Reason |
| --- | --- |
| **Custom admin (Option A)** | Re-implements localization, blocks, media, RBAC, versions and preview from scratch — 3–5× the effort, permanently ours to maintain, and the first version would be worse than an established CMS at exactly the features that matter to editors. |
| **Sanity / Contentful (Option C)** | Adds a second platform and a vendor-priced content layer; the admin experience becomes theirs, not Seven Lands'. Defensible for a publisher, not for a seven-capability corporate site. |
| **Strapi / Directus self-hosted** | Same second-platform cost as C with a weaker block/localization story than Payload, and a separate process to operate. |
| **A "settings panel" bolted onto Next.js** | The request explicitly rules it out; it also fails the eight-point success test in `01_ADMIN_VISION_AND_SCOPE.md` the moment a second editor or a rollback is needed. |
| **WordPress (headless or otherwise)** | Contradicts the build pack, the security posture and the performance target. |

## Compatibility with Next.js 16 — updated statement (owner amendment, 2026-10-07)

**Payload officially supports Next.js 16.** Support landed in Payload **3.73.0** (upstream PR
#14456, after Vercel's Turbopack HMR fix) and is stated in Payload's own installation docs, which
list the supported Next.js ranges as `15.2.9–15.2.x`, `15.3.9–15.3.x`, `15.4.11–15.4.x` and
**`16.2.6+`**. The installed package's own peer range is the stricter, authoritative check:

```
@payloadcms/next@3.90.2  peerDependencies.next =
  ">=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.3.3 <17.0.0"
```

This project runs Next.js **16.4.0**, which satisfies `>=16.3.3 <17.0.0`.

One documented caveat remains and is treated as a gate, not an assumption: Payload's docs state that
`cacheComponents` "can be enabled alongside Payload without causing errors in the admin panel" but
that "full compatibility is not guaranteed". Phase A therefore tested that interaction explicitly
and it passed (see `PHASE_A_SPIKE_REPORT.md` §H).

## The spike — purpose, no longer about version support

The spike is **still required**, but it no longer asks "does Payload work on Next 16?". It asks
"does Payload work with **this exact project**?":

1. This repo's Next 16.4.0 + React 19.3.0 + TypeScript strict configuration.
2. `cacheComponents: true` and PPR/partial prefetching behaviour — verified, not configured away.
3. Local API usage from a real Server Component.
4. `/admin` isolation from the public route surface, with no admin code in public client bundles.
5. The RTL/Arabic admin.
6. Media upload + sharp derivative processing.
7. Production build behaviour under the sandbox's memory limits.
8. Public performance, bundle size and the existing test suites staying green.

`SPIKE_RESULT = PASS (2026-10-07)` — full evidence, deviations and technical findings in
`PHASE_A_SPIKE_REPORT.md`. The outcome is *not* a version downgrade: Next 16.4.0 stays, Payload is
pinned at 3.90.2, and `cacheComponents` remains enabled.

## Technology choices inside the recommendation

| Concern | Choice | Justification |
| --- | --- | --- |
| CMS / admin | Payload 3 | see WHY above |
| Database | PostgreSQL (managed: Neon / Supabase / RDS) | relational fits pages↔blocks↔media; PITR backups; Payload's first-class adapter |
| ORM | Payload's Drizzle-based adapter | no second ORM needed |
| Media storage | S3-compatible object storage (Cloudflare R2 preferred on cost/egress) | serverless-safe, CDN-friendly, versioned |
| Image processing | Payload/sharp sizes on upload + Next Image at render | matches the existing `next.config.ts` device sizes |
| Public data access | Payload **Local API** inside server components | no HTTP hop, no client JS |
| Cache invalidation | Next `revalidateTag` from Payload hooks + `revalidatePath` on publish | PPR-friendly, per-entity invalidation |
| Frontend indirection | `src/lib/content/*` adapter (new) | the rollback switch; keeps components untouched |
| Preview | Next draft mode + Payload preview URLs | no public draft exposure |
| Auth | Payload auth (email+password, secure cookies, sessions) | already integrated with RBAC; TOTP later |
| RBAC | Payload access-control functions + a permissions matrix | real resource/action checks, server-side |
| Admin UI extras | Radix primitives + Tailwind (matching the site's tokens), TanStack Table for lists, TipTap for rich text, dnd-kit for ordering, Recharts for charts | each adds a capability we would otherwise hand-roll; nothing else is added |
| Icons | `@phosphor-icons/react` for the admin and the social picker | it was removed from the public site on purpose; it returns **only** under `/admin`, and the picker stores `"InstagramLogo"`-style keys, never raw SVG |
| Analytics | GA4 Data API + Search Console API, server-side, cached | no proprietary analytics engine, no duplicate data lake |
| Secrets | environment variables (host secret store); never editable in admin forms | see `14_SECURITY_MODEL.md` |

## What stays in code forever

- Design tokens, typography, spacing, motion, focus states.
- Block type definitions, variants, validation schemas.
- The route table for structural pages (see the dynamic-pages decision in `06_CONTENT_BLOCK_SYSTEM.md`).
- Anything that could break the brand (logo manipulation, arbitrary CSS, layout maths).
