import path from 'path'
import { fileURLToPath } from 'url'

import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AuditEvents } from '@/collections/AuditEvents'
import { Insights } from '@/collections/Insights'
import { Leads } from '@/collections/Leads'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Projects } from '@/collections/Projects'
import { Redirects } from '@/collections/Redirects'
import { Services } from '@/collections/Services'
import { Roles } from '@/collections/Roles'
import { Users } from '@/collections/Users'
import {
  BusinessHours,
  ConsentSettings,
  ContactSettings,
  Footer,
  Navigation,
  SiteSettings,
  SocialAccounts,
  TrackingSettings,
} from '@/globals'

/**
 * PHASE B — AUTHENTICATION, USERS, RBAC & SECURITY FOUNDATION.
 *
 * Scope discipline (owner gate): the collections below are the Phase B foundation only —
 * users, roles, the audit log and the media library. No business collections (pages, services,
 * projects, insights, leads, SEO, analytics, scripts): those are later phases and require a
 * fresh approval.
 *
 * Verified in Phase A and unchanged here: `cacheComponents: true` and PPR keep working with
 * Payload in this exact app (40 prerendered routes preserved, no public route lost).
 */
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/*
 * RUNTIME origin — where THIS process is actually reachable (preview bridge, staging alias, localhost).
 * It is deliberately NOT the canonical site origin: Payload uses `serverURL` to build the absolute
 * URLs the admin talks to, and on a preview host those must point at the preview, not at the
 * production domain. Publishing is a separate concern, handled by `SITE_CANONICAL_URL`
 * (src/lib/site-origin.ts) — public markup and structured data never read this value.
 */
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL || process.env.RUNTIME_ORIGIN || 'http://localhost:3000'

/**
 * Additional origins whose cookies Payload will accept (its CSRF allow-list).
 *
 * Browsers send `Origin` on every mutating request, and Payload refuses a `*-token` cookie whose
 * `Origin` is not listed here. That is correct protection — but it also means the admin cannot be
 * used from a host that differs from `serverURL`: a hosting preview URL, a staging alias, a port
 * forward. Those have to be named explicitly.
 *
 * Comma-separated, never a wildcard. Production sets this only if the admin is genuinely served
 * from more than one origin.
 *
 * PAYLOAD_TRUSTED_ORIGINS=https://3000-<id>.e2b.app
 */
const trustedOrigins = (process.env.PAYLOAD_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — سفن لاند | Seven Lands',
      icons: {
        icon: '/icon.png',
        apple: '/apple-icon.png',
      },
      openGraph: {
        images: ['/og/og-ar.png'],
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo#AdminLogo',
        Icon: '/components/admin/AdminIcon#AdminIcon',
      },
      views: {
        mediaPicker: {
          Component: "/components/admin/MediaPickerPreview#MediaPickerPreview",
          path: "/media-picker",
          exact: true,
        },
        analyticsDashboard: {
          Component: "/components/admin/AnalyticsDashboardView#AnalyticsDashboardView",
          path: "/analytics",
          exact: true,
        },
        siteHealth: {
          Component: "/components/admin/SiteHealthView#SiteHealthView",
          path: "/health",
          exact: true,
        },
        globalSearch: {
          Component: "/components/admin/GlobalSearchView#GlobalSearchView",
          path: "/search",
          exact: true,
        },
      },
    },
  },
  editor: lexicalEditor(),

  collections: [Users, Roles, AuditEvents, Media, Pages, Services, Projects, Insights, Leads, Redirects],

  /*
   * Phase C — the global business configuration.
   *
   * Six versioned, audited singletons: site-settings · contact-settings · business-hours ·
   * social-accounts · navigation · footer. They are read server-side by `src/lib/content` (cached,
   * tagged) and never fetched from the browser. Still absent by design: services, projects,
   * insights, SEO, analytics, tracking, scripts and leads — those remain later phases.
   */
  globals: [SiteSettings, ContactSettings, BusinessHours, SocialAccounts, Navigation, Footer, TrackingSettings, ConsentSettings],
  /*
   * Arabic-first admin UI. Payload ships full Arabic translations and treats a language
   * as RTL via @payloadcms/translations' rtlLanguages — this only selects the default.
   * Verified in Phase A: the admin renders <html dir="RTL" lang="ar">.
   */
  i18n: {
    supportedLanguages: { ar, en },
    fallbackLanguage: 'ar',
  },

  /*
   * Content localization (Arabic default, English second).
   *
   * `fallback: false` is deliberate and implements owner amendment #2: a missing English value
   * must never be filled with Arabic on the public site. The admin shows translated /
   * partially-translated / missing per field, and publishing gates on completeness — non-visible
   * metadata can still request an explicit `fallbackLocale` when that is genuinely wanted.
   *
   * Distinct from `i18n` above, which only chooses the *admin interface* language.
   */
  localization: {
    locales: [
      { code: 'ar', label: 'العربية', rtl: true },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'ar',
    fallback: false,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  csrf: [serverURL, ...trustedOrigins],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  /*
   * §3 — GraphQL lockdown, pinned explicitly rather than relied on as a default.
   * Both options default to `true` in Payload; they are written out here so a future config
   * edit cannot silently re-open the playground or full schema introspection in production.
   * Nothing in this project consumes GraphQL (the admin uses REST), so this costs nothing.
   */
  graphQL: {
    disablePlaygroundInProduction: true,
    disableIntrospectionInProduction: true,
    maxComplexity: 1000,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    /*
     * MIGRATIONS ONLY.
     *
     * Payload would otherwise let drizzle-kit "push" schema changes straight to the database in
     * development. Two reasons this is off:
     *   1. It is interactive when it detects a destructive statement, so any script that touches the
     *      database in a non-interactive shell hangs with no output — measured twice in this phase,
     *      once for 15 minutes.
     *   2. Silent schema drift is exactly what the migration ledger exists to prevent (§26, §54).
     * Schema changes now require `payload migrate:create` + `payload migrate`, and every phase
     * proves the pair applies to an empty database.
     */
    push: false,
  }),
  upload: {
    limits: {
      /** One ceiling for every upload: 15 MB. Larger files are rejected before storage. */
      fileSize: 15_000_000,
    },
  },
  sharp,
  telemetry: false,
})
