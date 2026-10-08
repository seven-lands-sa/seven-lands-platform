# PERMISSION MATRIX — Phase B

*Generated from the running system, not from intent.* The catalogue below is read from
`src/lib/auth/permissions.ts` and the role rows from the live `roles` table (via
`npx payload run`: `PERMISSIONS` + `payload.find({ collection: 'roles' })`), so this document
cannot drift from the code without someone noticing.

```
permissions: 36      high-risk: 13      groups: 9      system roles: 5
permission counts per role: مدير النظام 36 · مدير 26 · محرر 17 · تسويق 15 · مشاهد 8
```

Permission counts per role: مدير النظام **36** · مدير **26** · محرر **17** · تسويق **15** · مشاهد **8**

**Risk column.** `high` means the permission can weaken security, run third-party code, expose
personal data or destroy content. Every `high` permission is withheld from **مدير (admin)** by
default; the three documented exceptions are `leads.read`, `leads.export` and `settings.update`
(see `src/lib/auth/roles.ts` → `ADMIN_HIGH_RISK_ALLOWED`). The withheld set is *derived* from the
catalogue (`HIGH_RISK_PERMISSIONS` minus those three), so a permission added by a later phase
cannot silently land in the admin role.

High-risk permissions in this phase: `pages.delete`, `media.delete`, `leads.read`, `leads.export`, `tracking.manage`, `settings.update`, `users.create`, `users.update`, `users.suspend`, `users.delete`, `scripts.manage`, `roles.manage`, `audit.read`.


### المحتوى — `content`

*الصفحات والخدمات والأعمال والمقالات.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pages.read` | قراءة الصفحات | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `pages.create` | إنشاء صفحات | — | ✅ | ✅ | ✅ | — | — |
| `pages.update` | تعديل الصفحات | — | ✅ | ✅ | ✅ | — | — |
| `pages.publish` | نشر الصفحات | — | ✅ | ✅ | ✅ | — | — |
| `pages.delete` | حذف الصفحات | **high** | ✅ | — | — | — | — |
| `services.read` | قراءة الخدمات | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `services.update` | تعديل الخدمات | — | ✅ | ✅ | ✅ | — | — |
| `services.publish` | نشر الخدمات | — | ✅ | ✅ | ✅ | — | — |
| `projects.read` | قراءة الأعمال | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `projects.update` | تعديل الأعمال | — | ✅ | ✅ | ✅ | — | — |
| `projects.publish` | نشر الأعمال | — | ✅ | ✅ | ✅ | — | — |
| `insights.read` | قراءة المقالات | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `insights.update` | تعديل المقالات | — | ✅ | ✅ | ✅ | ✅ | — |
| `insights.publish` | نشر المقالات | — | ✅ | ✅ | ✅ | ✅ | — |

### الوسائط — `media`

*الصور والملفات المستخدمة في الموقع.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `media.read` | قراءة الوسائط | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `media.upload` | رفع الوسائط | — | ✅ | ✅ | ✅ | ✅ | — |
| `media.delete` | حذف الوسائط | **high** | ✅ | — | — | — | — |

### العملاء المحتملون — `leads`

*طلبات التواصل الواردة من الموقع.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `leads.read` | قراءة العملاء المحتملين | **high** | ✅ | ✅ | — | ✅ | — |
| `leads.update` | تعديل حالة العملاء | — | ✅ | ✅ | — | — | — |
| `leads.export` | تصدير العملاء | **high** | ✅ | ✅ | — | ✅ | — |

### تحسين الظهور — `seo`

*العناوين والأوصاف وبيانات المشاركة.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `seo.read` | قراءة إعدادات الظهور | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `seo.update` | تعديل إعدادات الظهور | — | ✅ | ✅ | — | ✅ | — |

### التسويق والتتبع — `marketing`

*أدوات التحليل والبكسل.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |

### التحليلات — `analytics`

*تقارير الزيارات والتحويلات.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `analytics.read` | قراءة التحليلات | — | ✅ | ✅ | ✅ | ✅ | ✅ |

### إعدادات الموقع — `settings`

*بيانات تظهر في كل الصفحات.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `settings.read` | قراءة إعدادات الموقع | — | ✅ | ✅ | — | — | ✅ |
| `settings.update` | تعديل إعدادات الموقع | **high** | ✅ | ✅ | — | — | — |

### المستخدمون — `users`

*حسابات الوصول إلى لوحة التحكم.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `users.read` | قراءة المستخدمين | — | ✅ | ✅ | — | — | — |
| `users.create` | إضافة مستخدمين | **high** | ✅ | — | — | — | — |
| `users.update` | تعديل المستخدمين | **high** | ✅ | — | — | — | — |
| `users.suspend` | إيقاف المستخدمين | **high** | ✅ | — | — | — | — |
| `users.delete` | حذف المستخدمين | **high** | ✅ | — | — | — | — |

### النظام — `system`

*أذونات متقدمة تمسّ أمان النظام وسجلّه.*

| permission | label | risk | مدير النظام | مدير | محرر | تسويق | مشاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `scripts.manage` | إدارة الأوامر المخصصة | **high** | ✅ | — | — | — | — |
| `roles.read` | قراءة الأدوار | — | ✅ | ✅ | — | — | — |
| `roles.manage` | إدارة الأدوار والأذونات | **high** | ✅ | — | — | — | — |
| `audit.read` | قراءة سجل الأحداث | **high** | ✅ | — | — | — | — |

## Group order in the admin

The permission checkboxes inside a role render in exactly the order §16 asks for: **المحتوى ·
الوسائط · العملاء المحتملون · تحسين الظهور · التسويق والتتبع · التحليلات · إعدادات الموقع ·
المستخدمون · النظام**. Each group is a collapsible block holding one checkbox per permission,
labelled in Arabic with the rule it grants (`src/collections/Roles.ts`).

## Verified behaviour (not just configuration)

Every rule was exercised against the running system in two independent layers:

| Layer | What it proves | Evidence |
| --- | --- | --- |
| Local API, `overrideAccess: false`, 7 personas | the access rules themselves | `.phase-b-evidence/verify-phase-b.log` — 34/34 checks |
| REST over HTTP, production build | the same rules as the browser meets them | `.phase-b-evidence/live-checks.log` — 36/36 checks |

Personas: anonymous · مدير النظام (super admin) · مدير · محرر · تسويق · مشاهد · a suspended مشاهد.

```
users.read    anonymous=deny  super_admin=allow  admin=allow  editor=deny   marketing=deny   viewer=deny   suspended=deny
roles.read    anonymous=deny  super_admin=allow  admin=allow  editor=deny   marketing=deny   viewer=deny   suspended=deny
audit.read    anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
media.read    anonymous=deny  super_admin=allow  admin=allow  editor=allow  marketing=allow  viewer=allow  suspended=deny
users.create  anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
roles.manage  anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
```

Live REST additionally proved the operation-level boundary: the editor may upload media (`201`)
but not delete it (`403`); the viewer may read the library (`200`) but not upload (`403`); and a
Super Admin cannot write to the audit log at all (`403` on POST, PATCH and DELETE).

## Custom roles

The five roles are *seed data*, not code paths. Authorization never switches on a role key — it
resolves `user.roles[] → role documents → permission set`. A sixth, custom role created through the
admin holds exactly the permissions ticked on it and is enforced identically; the `roles.manage`
row above created and deleted a throwaway `temp_*` role during verification to prove exactly that.
