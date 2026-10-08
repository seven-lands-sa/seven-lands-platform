/**
 * Seeds the Phase B authentication foundation.
 *
 *   • the five system roles, from `SYSTEM_ROLES` — the single source of truth
 *   • the first Super Admin, from the environment
 *
 * Idempotent: roles are matched on `key` and updated in place (their identity is frozen, their
 * permissions may be tuned), and an existing user is never overwritten — only completed if it is
 * missing the `super_admin` role or is not ACTIVE.
 *
 * Run:
 *   npx payload run src/scripts/seed-auth-foundation.ts
 *
 * Credentials never live in code: the account comes from `SEED_SUPER_ADMIN_EMAIL` /
 * `SEED_SUPER_ADMIN_PASSWORD` (dev values in the git-ignored `.env`). In a real deployment the
 * password is set from the platform's secret store and changed on first login.
 */

import { getPayload } from 'payload'

import config from '@payload-config'

import type { Role } from '@/payload-types'

import { ALL_PERMISSIONS } from '@/lib/auth/permissions'
import { permissionFieldName, SYSTEM_ROLES } from '@/lib/auth/roles'

const payload = await getPayload({ config })

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
  console.error(
    'REFUSED: refusing to seed a production database. This script creates accounts and roles.\n' +
      '          Re-run with ALLOW_PRODUCTION_SEED=true only during a planned first-time setup.',
  )
  process.exit(1)
}

type RoleData = Omit<Role, 'id' | 'collection' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

/** One boolean per catalogue entry, under the field name the checkbox is registered as. */
const permissionPatch = (permissions: readonly string[]): Record<string, boolean> => {
  const patch: Record<string, boolean> = {}
  for (const permission of ALL_PERMISSIONS) {
    patch[permissionFieldName(permission)] = permissions.includes(permission)
  }
  return patch
};

console.log('\n── Seeding system roles ────────────────────────────────────────────────')
const roleIdByKey = new Map<string, number>()

for (const seed of SYSTEM_ROLES) {
  const existing = await payload.find({
    collection: 'roles',
    where: { key: { equals: seed.key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data = {
    label: seed.label,
    key: seed.key,
    description: seed.description,
    fullAccess: seed.fullAccess,
    isSystem: true,
    ...permissionPatch(seed.permissions),
  } as unknown as RoleData

  if (existing.docs.length > 0) {
    const current = existing.docs[0]!
    const updated = await payload.update({
      collection: 'roles',
      id: current.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    roleIdByKey.set(seed.key, updated.id)
    console.log(
      `  updated  ${seed.key.padEnd(12)} ${seed.label}  ·  ` +
        `${seed.fullAccess ? 'كل الصلاحيات (fullAccess)' : `${seed.permissions.length} صلاحية`}`,
    )
  } else {
    const created = await payload.create({ collection: 'roles', data, depth: 0, overrideAccess: true })
    roleIdByKey.set(seed.key, created.id)
    console.log(
      `  created  ${seed.key.padEnd(12)} ${seed.label}  ·  ` +
        `${seed.fullAccess ? 'كل الصلاحيات (fullAccess)' : `${seed.permissions.length} صلاحية`}`,
    )
  }
}

console.log('\n── Seeding the first Super Admin ──────────────────────────────────────')
const email = process.env.SEED_SUPER_ADMIN_EMAIL
const password = process.env.SEED_SUPER_ADMIN_PASSWORD
const name = process.env.SEED_SUPER_ADMIN_NAME || 'مالك النظام'
const superAdminRoleId = roleIdByKey.get('super_admin')

if (!superAdminRoleId) {
  throw new Error('The super_admin role was not seeded — aborting before touching any user.')
}

if (!email || !password) {
  console.log(
    '  skipped — set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create the account.\n' +
      '  Roles are seeded; no user was created or modified.',
  )
} else if (password.length < 12) {
  throw new Error('SEED_SUPER_ADMIN_PASSWORD must be at least 12 characters.')
} else {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    showHiddenFields: true,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const user = existing.docs[0]!
    const roleIds = (user.roles ?? [])
      .map((role) => (role && typeof role === 'object' ? role.id : role))
      .filter((id): id is number => typeof id === 'number')
    const hasSuperAdmin = roleIds.includes(superAdminRoleId)
    const needsFix = !hasSuperAdmin || user.status !== 'ACTIVE'

    if (needsFix) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          roles: [...new Set([...roleIds, superAdminRoleId])],
          status: 'ACTIVE',
        },
        depth: 0,
        overrideAccess: true,
      })
      console.log(`  repaired ${email} — super_admin role and ACTIVE status ensured`)
    } else {
      console.log(`  present  ${email} — untouched (already an active Super Admin)`)
    }
  } else {
    const created = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        status: 'ACTIVE',
        roles: [superAdminRoleId],
        preferredAdminLanguage: 'ar',
      },
      depth: 0,
      overrideAccess: true,
    })
    console.log(`  created  ${email} — first Super Admin (id ${created.id})`)
  }
}

console.log('\n── Verification ───────────────────────────────────────────────────────')
const roleCount = await payload.count({ collection: 'roles', overrideAccess: true })
const systemRoleCount = await payload.count({
  collection: 'roles',
  where: { isSystem: { equals: true } },
  overrideAccess: true,
})
const userCount = await payload.count({ collection: 'users', overrideAccess: true })
const auditCount = await payload.count({ collection: 'audit-events', overrideAccess: true }).catch(() => ({ totalDocs: 'n/a' }))

console.log(`  roles ............ ${roleCount.totalDocs} (system: ${systemRoleCount.totalDocs})`)
console.log(`  users ............ ${userCount.totalDocs}`)
console.log(`  audit events ..... ${auditCount.totalDocs}`)
console.log('\nSeeding complete.\n')

process.exit(0)
