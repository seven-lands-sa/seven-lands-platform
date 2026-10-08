/**
 * PHASE B verification — server-side authorization matrix and security invariants.
 *
 * Runs against the Local API with `overrideAccess: false`, i.e. through the *same* access rules
 * the REST API and the admin panel use. Nothing here asserts on message text: a denial is proven
 * behaviourally (the call throws or returns no documents) and every denial is paired with a
 * positive control, so a check cannot pass by accident.
 *
 * Run:            npx payload run src/scripts/verify-phase-b.ts
 * Remove fixtures: npx payload run src/scripts/verify-phase-b.ts cleanup
 */

import { getPayload } from 'payload'

import config from '@payload-config'

import type { User } from '@/payload-types'
import { resolvePermissions } from '@/lib/auth/access'
import { ALL_PERMISSIONS, HIGH_RISK_PERMISSIONS, type Permission } from '@/lib/auth/permissions'
import { countOtherActiveSuperAdmins } from '@/lib/auth/invariants'
import { isFullAccessRole, SYSTEM_ROLES, type SystemRoleKey } from '@/lib/auth/roles'

/*
 * WRITE GUARD (§15). This script creates fixtures ({personas, media, roles}) that must never exist
 * in a production database unless someone deliberately asks for them. It refuses by default and the
 * flag documents intent, so a stray `payload run` on a live deployment cannot seed test accounts.
 */
if (process.env.ALLOW_VERIFICATION_WRITES !== "true") {
  console.error(
    "REFUSED: this verification script writes fixtures to the database.\n" +
      "          Re-run with ALLOW_VERIFICATION_WRITES=true on a development or test database only.",
  );
  process.exit(1);
}

const payload = await getPayload({ config })

/** Dev fixtures only. Never a real credential. */
const FIXTURE_PASSWORD = 'Verify!PhaseB2026x'
const FIXTURE_DOMAIN = 'sevenlands.test'

let passed = 0
let failed = 0
const failures: string[] = []

const record = (ok: boolean, label: string, detail = '') => {
  if (ok) {
    passed += 1
    console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ''}`)
  } else {
    failed += 1
    failures.push(label)
    console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ''}`)
  }
}

/** Runs an operation, reporting whether it was allowed. */
const attempt = async (
  operation: () => Promise<unknown>,
): Promise<{ allowed: boolean; error?: string }> => {
  try {
    await operation()
    return { allowed: true }
  } catch (error) {
    return { allowed: false, error: error instanceof Error ? error.message : String(error) }
  }
}

const personaEmail = (key: string) => `verify+${key}@${FIXTURE_DOMAIN}`

/* ────────────────────────────────────────────────────────────────────────────
 * Fixtures: one user per role, plus a deliberately suspended one.
 * ──────────────────────────────────────────────────────────────────────────── */

if (process.argv[2] === 'cleanup') {
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { like: `verify+` } },
    limit: 50,
    overrideAccess: true,
  })
  for (const doc of docs) {
    await payload.delete({ collection: 'users', id: doc.id, overrideAccess: true })
  }
  console.log(`Removed ${docs.length} verification fixtures.`)
  process.exit(0)
}

const roleIdByKey = new Map<string, number>()
{
  const { docs } = await payload.find({ collection: 'roles', limit: 20, overrideAccess: true })
  for (const role of docs) roleIdByKey.set(role.key, role.id)
}

const findOrCreatePersona = async (key: SystemRoleKey, status: 'ACTIVE' | 'SUSPENDED' = 'ACTIVE') => {
  const email = personaEmail(status === 'ACTIVE' ? key : `${key}-suspended`)
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  const roleId = roleIdByKey.get(key)
  if (!roleId) throw new Error(`role ${key} is not seeded`)

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: 'users',
      id: existing.docs[0]!.id,
      data: { roles: [roleId], status },
      overrideAccess: true,
    })
    return updated
  }
  return payload.create({
    collection: 'users',
    data: {
      name: `تحقّق — ${key}`,
      email,
      password: FIXTURE_PASSWORD,
      status,
      roles: [roleId],
      preferredAdminLanguage: 'ar',
    },
    overrideAccess: true,
  })
}

console.log('\n══ 0 · Permission catalogue ═══════════════════════════════════════════')
const uniquePermissions = new Set(ALL_PERMISSIONS)
record(
  ALL_PERMISSIONS.length === uniquePermissions.size,
  'catalogue has no duplicate permissions',
  `${ALL_PERMISSIONS.length} permissions, ${HIGH_RISK_PERMISSIONS.length} high-risk`,
)
const adminSeed = SYSTEM_ROLES.find((role) => role.key === 'admin')!
const adminLeaksHighRisk = adminSeed.permissions.filter(
  (permission) => HIGH_RISK_PERMISSIONS.includes(permission) && !['leads.read', 'leads.export', 'settings.update'].includes(permission),
)
record(
  adminLeaksHighRisk.length === 0,
  '§10 — ADMIN holds no high-risk permission beyond the three documented delegations',
  adminLeaksHighRisk.length ? `leaked: ${adminLeaksHighRisk.join(', ')}` : `${adminSeed.permissions.length} permissions`,
)

console.log('\n══ 1 · Personas ════════════════════════════════════════════════════════')
let superAdmin = (await payload.find({
  collection: 'users',
  where: { email: { equals: process.env.SEED_SUPER_ADMIN_EMAIL ?? '' } },
  limit: 1,
  overrideAccess: true,
})).docs[0] as User | undefined
if (!superAdmin) throw new Error('the seeded Super Admin is missing — run the seed script first')

/*
 * Repair the starting state before anything is asserted. An interrupted earlier run can leave the
 * seeded account suspended or wearing another role — and every expectation below depends on it
 * genuinely being the one active Super Admin.
 */
{
  const roleIds = (superAdmin.roles ?? []).map((role) => (role && typeof role === 'object' ? role.id : role))
  const needsRepair = superAdmin.status !== 'ACTIVE' || !roleIds.includes(roleIdByKey.get('super_admin')!)
  if (needsRepair) {
    await payload.update({
      collection: 'users',
      id: superAdmin.id,
      data: { roles: [roleIdByKey.get('super_admin')!], status: 'ACTIVE' },
      overrideAccess: true,
    })
    console.log('  repaired the seeded Super Admin (role + ACTIVE) before testing')
  }

  /* Re-read so every expectation below runs against the repaired document, not the stale copy. */
  superAdmin = await payload.findByID({ collection: 'users', id: superAdmin.id, depth: 0, overrideAccess: true })
}

const personas: { key: string; user: User; label: string }[] = []
for (const role of SYSTEM_ROLES) {
  /*
   * The Super Admin persona IS the seeded account. Creating a second full-access user here would
   * make the §14 checks below meaningless, because the invariant protects only the *last* one.
   */
  if (role.key === 'super_admin') {
    personas.push({ key: role.key, user: superAdmin, label: role.key })
    continue
  }
  const user = await findOrCreatePersona(role.key)
  personas.push({ key: role.key, user, label: role.key })
}
const suspended = await findOrCreatePersona('viewer', 'SUSPENDED')
personas.push({ key: 'viewer-suspended', user: suspended, label: 'viewer-suspended' })
console.log(`  ${personas.length} personas ready + 1 Super Admin + anonymous`)

/* ────────────────────────────────────────────────────────────────────────────
 * The matrix. Each row: what the operation requires, and who should therefore hold it.
 * ──────────────────────────────────────────────────────────────────────────── */

type Actor = { label: string; user?: User; can: (permission: Permission) => boolean }

const actors: Actor[] = [
  { label: 'anonymous', can: () => false },
  ...personas.map((persona) => ({
    label: persona.key,
    user: persona.user,
    can: (permission: Permission) => {
      // A suspended account holds nothing, whatever its role says.
      if (persona.key.includes('suspended')) return false
      if (persona.key === 'super_admin') return true
      return (SYSTEM_ROLES.find((role) => role.key === persona.key)?.permissions ?? []).includes(permission)
    },
  })),
]

const matrix: { label: string; permission: Permission; run: (actor: Actor) => Promise<unknown> }[] = [
  {
    label: 'users.read',
    permission: 'users.read',
    run: (actor) =>
      payload.find({ collection: 'users', overrideAccess: false, ...(actor.user ? { user: actor.user } : {}) }),
  },
  {
    label: 'roles.read',
    permission: 'roles.read',
    run: (actor) =>
      payload.find({ collection: 'roles', overrideAccess: false, ...(actor.user ? { user: actor.user } : {}) }),
  },
  {
    label: 'audit.read',
    permission: 'audit.read',
    run: (actor) =>
      payload.find({
        collection: 'audit-events',
        overrideAccess: false,
        ...(actor.user ? { user: actor.user } : {}),
      }),
  },
  /*
   * `media.read` is deliberately NOT a matrix row. Since the public media library exists, its read
   * access returns a CONSTRAINT (`{ visibility: { equals: 'public' } }`) rather than a flat deny, so
   * "allow/deny" is the wrong question. §2b asserts the real property: a caller without `media.read`
   * may read public documents and can never reach a private one.
   */
  {
    label: 'users.create',
    permission: 'users.create',
    run: (actor) => {
      // Written as two statically-shaped branches so each call matches a `create` overload;
      // a single object with a conditional `user` cannot satisfy the conditional types.
      const data = {
        name: 'مؤقت — اختبار الأذونات',
        // `verify+` prefix so `cleanup` removes these too.
        email: personaEmail(`temp-${Date.now()}`),
        password: FIXTURE_PASSWORD,
        status: 'ACTIVE' as const,
        // `roles` is a required field, so every create carries one — for a caller who may not
        // assign roles, field-level access strips it and the default applies instead.
        roles: [roleIdByKey.get('viewer')!],
      }
      return actor.user
        ? payload.create({ collection: 'users', data, overrideAccess: false, user: actor.user })
        : payload.create({ collection: 'users', data, overrideAccess: false })
    },
  },
  {
    label: 'roles.manage (create role)',
    permission: 'roles.manage',
    run: (actor) =>
      payload.create({
        collection: 'roles',
        data: { label: 'دور مؤقت', key: `temp_${Date.now()}` },
        overrideAccess: false,
        ...(actor.user ? { user: actor.user } : {}),
      }),
  },
]

console.log('\n══ 2 · Local API authorization matrix (overrideAccess: false) ════════')
for (const row of matrix) {
  const line: string[] = []
  for (const actor of actors) {
    const expected = actor.can(row.permission)
    const result = await attempt(() => row.run(actor))
    const ok = result.allowed === expected
    if (!ok) record(false, `${row.label} · ${actor.label}`, `expected ${expected ? 'allow' : 'deny'}, got ${result.allowed ? 'allow' : 'deny'}`)
    line.push(`${actor.label}=${result.allowed ? 'allow' : 'deny'}${ok ? '' : '❗'}`)
  }
  record(
    !line.some((entry) => entry.includes('❗')),
    `${row.label} matches the role matrix`,
    line.join(' '),
  )
}

console.log('\n══ 2b · Media visibility is a constraint, not a blanket deny ════════')
{
  /* One pixel of PNG: enough to exercise the upload pipeline without a fixture file on disk. */
  const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  const upload = (name: string, visibility: 'public' | 'private') =>
    payload.create({
      collection: 'media',
      data: { alt: `fixture ${visibility}`, visibility },
      file: { data: PNG, mimetype: 'image/png', name, size: PNG.length },
      overrideAccess: true,
    })

  const publicDoc = await upload(`verify-public-${Date.now()}.png`, 'public')
  const privateDoc = await upload(`verify-private-${Date.now()}.png`, 'private')

  const anonymous = await payload.find({ collection: 'media', overrideAccess: false, limit: 100 })
  const ids = anonymous.docs.map((doc) => doc.id)
  record(ids.includes(publicDoc.id), 'anonymous CAN read a public media document')
  record(!ids.includes(privateDoc.id), 'anonymous CANNOT see a private media document in a query')

  const direct = await attempt(() =>
    payload.findByID({ collection: 'media', id: privateDoc.id, overrideAccess: false }),
  )
  record(!direct.allowed, 'anonymous CANNOT fetch a private media document by id', direct.error?.slice(0, 60))

  const suspendedView = await payload.find({
    collection: 'media',
    overrideAccess: false,
    user: personas.find((entry) => entry.key === 'viewer-suspended')!.user,
    limit: 100,
  })
  const suspendedIds = suspendedView.docs.map((doc) => doc.id)
  record(
    suspendedIds.includes(publicDoc.id) && !suspendedIds.includes(privateDoc.id),
    'a suspended account sees exactly the public surface',
  )

  const staffView = await payload.find({
    collection: 'media',
    overrideAccess: false,
    user: personas.find((entry) => entry.key === 'viewer')!.user,
    limit: 100,
  })
  const staffIds = staffView.docs.map((doc) => doc.id)
  record(
    staffIds.includes(publicDoc.id) && staffIds.includes(privateDoc.id),
    'an editor with media.read sees both, private included',
  )

  await payload.delete({ collection: 'media', id: publicDoc.id, overrideAccess: true })
  await payload.delete({ collection: 'media', id: privateDoc.id, overrideAccess: true })
  console.log('  cleaned up 2 temporary media fixture(s)')
}

console.log('\n══ 3 · Audit log is write-once (§18) ══════════════════════════════════')
{
  const asSuper = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'audit-events',
      data: data as never,
      overrideAccess: false,
      user: superAdmin,
    })

  const created = await attempt(() =>
    asSuper({ action: 'login', summary: 'محاولة تزوير', occurredAt: new Date().toISOString() }),
  )
  record(!created.allowed, 'Super Admin cannot CREATE an audit event')

  const existing = await payload.find({ collection: 'audit-events', limit: 1, overrideAccess: true })
  const target = existing.docs[0]!
  const updated = await attempt(() =>
    payload.update({
      collection: 'audit-events',
      id: target.id,
      data: { summary: 'تعديل ممنوع' },
      overrideAccess: false,
      user: superAdmin,
    }),
  )
  record(!updated.allowed, 'Super Admin cannot UPDATE an audit event')

  const deleted = await attempt(() =>
    payload.delete({ collection: 'audit-events', id: target.id, overrideAccess: false, user: superAdmin }),
  )
  record(!deleted.allowed, 'Super Admin cannot DELETE an audit event')

  const stillThere = await payload.findByID({
    collection: 'audit-events',
    id: target.id,
    overrideAccess: true,
  })
  record(Boolean(stillThere), 'the audit event survived all three attempts', `id ${target.id}`)

  const systemWrite = await attempt(() =>
    payload.create({
      collection: 'audit-events',
      data: {
        action: 'login',
        summary: 'كتابة من النظام (إثبات إيجابي)',
        occurredAt: new Date().toISOString(),
      },
      overrideAccess: true,
    }),
  )
  record(systemWrite.allowed, 'positive control — the system writer can still append')
}

/* ────────────────────────────────────────────────────────────────────────────
 * §14 can only be tested with a known starting state: exactly one active Super Admin.
 * Fixture accounts left behind by an earlier interrupted run would silently invalidate it,
 * so leftovers are removed here — and a *real* extra Super Admin stops the run instead.
 * ──────────────────────────────────────────────────────────────────────────── */
{
  const fullAccessRoleIds = (
    await payload.find({
      collection: 'roles',
      where: { fullAccess: { equals: true } },
      limit: 0,
      pagination: false,
      overrideAccess: true,
    })
  ).docs.map((role) => role.id)

  const holders = await payload.find({
    collection: 'users',
    where: { and: [{ status: { equals: 'ACTIVE' } }, { roles: { in: fullAccessRoleIds } }] },
    limit: 100,
    overrideAccess: true,
  })

  for (const holder of holders.docs) {
    if (holder.id === superAdmin.id) continue
    if (!/^(verify|temp)\+/.test(holder.email ?? '')) {
      throw new Error(
        `refusing to continue: ${holder.email} is a real extra Super Admin — remove it deliberately first`,
      )
    }
    await payload.delete({ collection: 'users', id: holder.id, overrideAccess: true })
    console.log(`  removed leftover fixture Super Admin: ${holder.email}`)
  }

  const others = await countOtherActiveSuperAdmins(payload, superAdmin.id)
  console.log(`  other active Super Admins: ${others} (must be 0 for §14 to be meaningful)`)
}

console.log('\n══ 4 · Last-active-Super-Admin invariant (§14) ═══════════════════════')
{
  const strip = await attempt(() =>
    payload.update({
      collection: 'users',
      id: superAdmin.id,
      data: { roles: [roleIdByKey.get('viewer')!] },
      overrideAccess: true,
    }),
  )
  record(!strip.allowed, 'stripping the last Super Admin role is refused', strip.error?.slice(0, 70))

  const suspend = await attempt(() =>
    payload.update({
      collection: 'users',
      id: superAdmin.id,
      data: { status: 'SUSPENDED' },
      overrideAccess: true,
    }),
  )
  record(!suspend.allowed, 'suspending the last Super Admin is refused', suspend.error?.slice(0, 70))

  const remove = await attempt(() =>
    payload.delete({ collection: 'users', id: superAdmin.id, overrideAccess: true }),
  )
  record(!remove.allowed, 'deleting the last Super Admin is refused', remove.error?.slice(0, 70))

  // Positive control: a second Super Admin makes the same operations legitimate.
  const second = await payload.create({
    collection: 'users',
    data: {
      name: 'مدير نظام ثانٍ (تحقّق)',
      email: personaEmail('super-admin-2'),
      password: FIXTURE_PASSWORD,
      status: 'ACTIVE',
      roles: [roleIdByKey.get('super_admin')!],
    },
    overrideAccess: true,
  })
  const suspendNow = await attempt(() =>
    payload.update({
      collection: 'users',
      id: superAdmin.id,
      data: { status: 'SUSPENDED' },
      overrideAccess: true,
    }),
  )
  record(suspendNow.allowed, 'with a second Super Admin, suspension is allowed')
  await payload.update({
    collection: 'users',
    id: superAdmin.id,
    data: { status: 'ACTIVE' },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'users', id: second.id, overrideAccess: true })
  const restored = await payload.findByID({ collection: 'users', id: superAdmin.id, overrideAccess: true })
  record(restored.status === 'ACTIVE', 'the original Super Admin is ACTIVE again')
}

console.log('\n══ 5 · Effective permissions come from roles only (§7/§13) ═══════════')
for (const persona of personas.filter((entry) => entry.key !== 'viewer-suspended')) {
  const effective = await resolvePermissions(payload, persona.user)
  const expected = new Set(
    isFullAccessRole({ fullAccess: persona.key === 'super_admin' })
      ? ALL_PERMISSIONS
      : (SYSTEM_ROLES.find((role) => role.key === persona.key)?.permissions ?? []),
  )
  const missing = [...expected].filter((permission) => !effective.has(permission))
  const extra = [...effective].filter((permission) => !expected.has(permission))
  record(
    missing.length === 0 && extra.length === 0,
    `${persona.key} resolves to exactly its role's ${effective.size} permissions`,
    missing.length || extra.length ? `missing ${missing.length}, extra ${extra.length}` : '',
  )
}
{
  const effective = await resolvePermissions(payload, suspended)
  record(effective.size === 0, 'a SUSPENDED user resolves to zero permissions', `${effective.size} permissions`)
}

console.log('\n══ 6 · Suspension ends access (§19) ═══════════════════════════════════')
{
  const login = await attempt(() =>
    payload.login({ collection: 'users', data: { email: suspended.email, password: FIXTURE_PASSWORD } }),
  )
  record(!login.allowed, 'a suspended user cannot log in')

  const live = await payload.login({
    collection: 'users',
    data: { email: personas.find((p) => p.key === 'viewer')!.user.email, password: FIXTURE_PASSWORD },
  })
  record(Boolean(live.token), 'an active user can log in (positive control)', `token ${live.token?.length ?? 0} chars`)

  const viewerId = personas.find((p) => p.key === 'viewer')!.user.id
  const beforeSuspend = await payload.findByID({
    collection: 'users',
    id: viewerId,
    depth: 0,
    showHiddenFields: true,
    overrideAccess: true,
  })
  record(
    Boolean(beforeSuspend.sessions && beforeSuspend.sessions.length > 0),
    'an active session exists before suspension',
    `${beforeSuspend.sessions?.length ?? 0} session(s)`,
  )

  await payload.update({ collection: 'users', id: viewerId, data: { status: 'SUSPENDED' }, overrideAccess: true })

  const afterSuspend = await payload.findByID({
    collection: 'users',
    id: viewerId,
    depth: 0,
    showHiddenFields: true,
    overrideAccess: true,
  })
  record(
    (afterSuspend.sessions?.length ?? 0) === 0,
    'suspension revokes every stored session immediately',
    `${afterSuspend.sessions?.length ?? 0} session(s) remain`,
  )
  const stalePermissions = await resolvePermissions(payload, afterSuspend)
  record(stalePermissions.size === 0, 'a suspended account resolves to no permissions', `${stalePermissions.size} permissions`)
  const blocked = await attempt(() =>
    payload.find({ collection: 'audit-events', overrideAccess: false, user: afterSuspend }),
  )
  record(!blocked.allowed, 'a suspended account is refused by the access layer')

  await payload.update({ collection: 'users', id: viewerId, data: { status: 'ACTIVE' }, overrideAccess: true })
}

console.log('\n══ 7 · Anonymous cannot reach protected data ═══════════════════════════')
{
  const results = await Promise.all(
    /* `media` is checked in §2b: anonymous reads are allowed but constrained to public documents. */
    (['users', 'roles', 'audit-events'] as const).map(async (collection) => {
      const result = await attempt(() =>
        payload.find({ collection, overrideAccess: false, limit: 1 }),
      )
      return { collection, ...result }
    }),
  )
  for (const result of results) {
    record(!result.allowed, `anonymous read of ${result.collection} is denied`)
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Leave the database as we found it: restore the seeded Super Admin, drop the throwaway role
 * the roles.manage row may have created, and remove the temp user from users.create.
 * ──────────────────────────────────────────────────────────────────────────── */
{
  await payload.update({
    collection: 'users',
    id: superAdmin.id,
    data: { roles: [roleIdByKey.get('super_admin')!], status: 'ACTIVE' },
    overrideAccess: true,
  })

  for (const collection of ['roles', 'users'] as const) {
    const { docs } = await payload.find({
      collection,
      where:
        collection === 'roles'
          ? { key: { like: 'temp_' } }
          : { email: { like: 'verify+temp-' } },
      limit: 50,
      overrideAccess: true,
    })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id, overrideAccess: true })
    }
    if (docs.length) console.log(`  cleaned up ${docs.length} temporary ${collection} fixture(s)`)
  }
  console.log('  restored the seeded Super Admin (role + ACTIVE)')
}

console.log('\n══ SUMMARY ═════════════════════════════════════════════════════════════')
console.log(`  checks passed: ${passed}`)
console.log(`  checks failed: ${failed}`)
if (failures.length) {
  console.log('  failures:')
  for (const failure of failures) console.log(`    · ${failure}`)
}
console.log(failed === 0 ? '\n  PHASE_B_SERVER_ENFORCEMENT = PASS\n' : '\n  PHASE_B_SERVER_ENFORCEMENT = FAIL\n')

await payload.destroy()
process.exit(failed === 0 ? 0 : 1)
