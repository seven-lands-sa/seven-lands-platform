#!/usr/bin/env bash
# PHASE B live verification against a production build on :3000.
# Asserts on HTTP status codes and behaviour — never on localized error text.
#
# PRECONDITION: `npx payload run src/scripts/verify-phase-b.ts` has been run at least once —
# it provisions the per-role fixture accounts this script logs in as.
#
# NOTE ON MULTIPART: Payload's REST upload endpoint reads form *fields* from a single
# `_payload` JSON part (see payload/dist/utilities/addDataAndFileToRequest.js); bare
# `-F 'alt=…'` parts are ignored. Localized fields are written one locale at a time
# (`?locale=ar` on create, then PATCH `?locale=en`), exactly as the admin UI does.
set -u
BASE=http://127.0.0.1:3000
EVIDENCE="$(dirname "$0")"
SUPER_EMAIL="$(grep -m1 '^SEED_SUPER_ADMIN_EMAIL=' .env | cut -d= -f2-)"
SUPER_PASS="$(grep -m1 '^SEED_SUPER_ADMIN_PASSWORD=' .env | cut -d= -f2-)"
FIXTURE_PASS='Verify!PhaseB2026x'

pass=0; fail=0
check() { # check <expected> <actual> <label>
  if [ "$1" = "$2" ]; then pass=$((pass+1)); printf "   ✅ %-52s %s\n" "$3" "$2"
  else fail=$((fail+1)); printf "   ❌ %-52s expected %s, got %s\n" "$3" "$1" "$2"; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
token_of() { curl -s -X POST "$BASE/api/users/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$1\",\"password\":\"$2\"}" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null; }

echo "════════ PHASE B · LIVE CHECKS — $(date -u +%FT%TZ) ════════"
echo
echo "── 1 · Public site still serves ─────────────────────────────────────"
for p in /ar /en /ar/services /ar/work /en/contact /ar/privacy; do
  check 200 "$(code "$BASE$p")" "GET $p"
done

echo
echo "── 2 · Admin ────────────────────────────────────────────────────────"
check 200 "$(code "$BASE/admin")" "GET /admin (production build)"
check 200 "$(code "$BASE/ar")" "GET /ar (public page unaffected)"
curl -s "$BASE/admin" -o /tmp/admin.html
grep -o '<html[^>]*>' /tmp/admin.html | head -1 | sed 's/^/   RTL: /'
check "RTL" "$(grep -o 'dir="RTL"' /tmp/admin.html | head -1 | tr -d 'dir="')" "admin renders RTL by default"

echo
echo "── 3 · Anonymous REST is denied ─────────────────────────────────────"
for c in users roles audit-events media; do
  check 403 "$(code "$BASE/api/$c")" "anonymous GET /api/$c"
done
check 403 "$(code -X POST "$BASE/api/users" -H 'Content-Type: application/json' \
  -d '{"email":"x@y.test","password":"whatever12345","name":"x","roles":[1]}')" "anonymous POST /api/users"

echo
echo "── 4 · Login + role-scoped REST ─────────────────────────────────────"
SUPER_TOKEN="$(token_of "$SUPER_EMAIL" "$SUPER_PASS")"
VIEWER_TOKEN="$(token_of 'verify+viewer@sevenlands.test' "$FIXTURE_PASS")"
[ -n "$SUPER_TOKEN" ] && printf "   ✅ %-52s %s chars\n" "super admin login" "${#SUPER_TOKEN}" || { printf "   ❌ super admin login failed\n"; fail=$((fail+1)); }
[ -n "$VIEWER_TOKEN" ] && printf "   ✅ %-52s %s chars\n" "viewer login" "${#VIEWER_TOKEN}" || { printf "   ❌ viewer login failed\n"; fail=$((fail+1)); }

for c in users roles audit-events media; do
  check 200 "$(code -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/$c?limit=1")" "super admin GET /api/$c"
done
# viewer holds media.read only → media 200, everything else 403
check 200 "$(code -H "Authorization: JWT $VIEWER_TOKEN" "$BASE/api/media?limit=1")" "viewer GET /api/media"
check 403 "$(code -H "Authorization: JWT $VIEWER_TOKEN" "$BASE/api/users?limit=1")" "viewer GET /api/users"
check 403 "$(code -H "Authorization: JWT $VIEWER_TOKEN" "$BASE/api/roles?limit=1")" "viewer GET /api/roles"
check 403 "$(code -H "Authorization: JWT $VIEWER_TOKEN" "$BASE/api/audit-events?limit=1")" "viewer GET /api/audit-events"

echo
echo "── 5 · Audit log is write-once, even for a Super Admin ──────────────"
AUDIT_ID=$(curl -s -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/audit-events?limit=1" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['docs'][0]['id'])" 2>/dev/null)
check 403 "$(code -X POST "$BASE/api/audit-events" -H "Authorization: JWT $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"action":"login","summary":"تزوير","occurredAt":"2026-10-07T00:00:00.000Z"}')" "POST /api/audit-events"
check 403 "$(code -X PATCH "$BASE/api/audit-events/$AUDIT_ID" -H "Authorization: JWT $SUPER_TOKEN" \
  -H 'Content-Type: application/json' -d '{"summary":"edited"}')" "PATCH /api/audit-events/$AUDIT_ID"
check 403 "$(code -X DELETE "$BASE/api/audit-events/$AUDIT_ID" -H "Authorization: JWT $SUPER_TOKEN")" "DELETE /api/audit-events/$AUDIT_ID"
check 200 "$(code -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/audit-events/$AUDIT_ID")" "the event still reads back (nothing was really changed)"

echo
echo "── 6 · Media: upload, derivatives, localized values, permission boundary ──"
SOURCE="public/og/og-ar.png"
UP=$(curl -s -X POST "$BASE/api/media?locale=ar" -H "Authorization: JWT $SUPER_TOKEN" \
  -F "file=@$SOURCE;type=image/png" \
  -F '_payload={"alt":"بطاقة مشاركة بالعربية","caption":"تعليق عربي","tags":["اختبار"],"focalX":50,"focalY":50}')
echo "$UP" | python3 -c "
import sys,json
d=json.load(sys.stdin); doc=d.get('doc',d)
if 'id' not in doc:
    print('   ❌ upload failed:', json.dumps(d, ensure_ascii=False)[:200]); sys.exit(1)
print(f\"   ✅ super admin upload → id {doc['id']} · {doc.get('width')}×{doc.get('height')} · {doc.get('filesize')} B · focal {doc.get('focalX')},{doc.get('focalY')}\")
print(f\"   derivatives declared: {sorted((doc.get('sizes') or {}).keys())}\")
open('/tmp/media.id','w').write(str(doc['id']))
" || fail=$((fail+1))
MEDIA_ID=$(cat /tmp/media.id 2>/dev/null)

# the English locale is filled afterwards, exactly as an editor would switch locale in the admin
curl -s -o /dev/null -X PATCH "$BASE/api/media/$MEDIA_ID?locale=en" -H "Authorization: JWT $SUPER_TOKEN" \
  -H 'Content-Type: application/json' -d '{"alt":"English social card","caption":"English caption"}'

AR_ALT=$(curl -s -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/media/$MEDIA_ID?locale=ar" | python3 -c "import sys,json;print(json.load(sys.stdin).get('alt') or '')")
EN_ALT=$(curl -s -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/media/$MEDIA_ID?locale=en" | python3 -c "import sys,json;print(json.load(sys.stdin).get('alt') or '')")
check "بطاقة مشاركة بالعربية" "$AR_ALT" "Arabic alt is stored and returned"
check "English social card" "$EN_ALT" "English alt is stored and returned"

# an Arabic-only document must NOT surface Arabic to English readers (amendment #2)
AR_ONLY=$(curl -s -X POST "$BASE/api/media?locale=ar" -H "Authorization: JWT $SUPER_TOKEN" \
  -F "file=@$SOURCE;type=image/png" -F '_payload={"alt":"عربي فقط"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('doc',d).get('id'))")
EN_OF_AR_ONLY=$(curl -s -H "Authorization: JWT $SUPER_TOKEN" "$BASE/api/media/$AR_ONLY?locale=en" | python3 -c "import sys,json;print(json.load(sys.stdin).get('alt') or '')")
check "" "$EN_OF_AR_ONLY" "no visible AR→EN fallback: English reads empty"
curl -s -o /dev/null -X DELETE "$BASE/api/media/$AR_ONLY" -H "Authorization: JWT $SUPER_TOKEN"

check 403 "$(code "$BASE/api/media/file/og-ar.png")" "anonymous cannot fetch the file endpoint"
check 403 "$(code "$BASE/api/media/file/og-ar-400x300.png")" "anonymous cannot fetch a derivative"

EDITOR_TOKEN="$(token_of 'verify+editor@sevenlands.test' "$FIXTURE_PASS")"
check 201 "$(code -X POST "$BASE/api/media?locale=ar" -H "Authorization: JWT $EDITOR_TOKEN" \
  -F "file=@$SOURCE;type=image/png" -F '_payload={"alt":"محرر"}')" "editor may upload (media.upload)"
check 403 "$(code -X POST "$BASE/api/media?locale=ar" -H "Authorization: JWT $VIEWER_TOKEN" \
  -F "file=@$SOURCE;type=image/png" -F '_payload={"alt":"مشاهد"}')" "viewer may not upload"
check 403 "$(code -X DELETE "$BASE/api/media/$MEDIA_ID" -H "Authorization: JWT $EDITOR_TOKEN")" "editor may not delete (media.delete withheld from ADMIN)"
check 200 "$(code -X DELETE "$BASE/api/media/$MEDIA_ID" -H "Authorization: JWT $SUPER_TOKEN")" "Super Admin may delete"

echo "── 7 · GraphQL lockdown in production ──────────────────────────────"
PG=$(code "$BASE/api/graphql-playground")
printf "   /api/graphql-playground → %s\n" "$PG"
INTRO=$(curl -s -X POST "$BASE/api/graphql" -H 'Content-Type: application/json' \
  -d '{"query":"query { __schema { types { name } } }"}')
printf "   introspection response: %s\n" "$(printf '%s' "$INTRO" | head -c 120)"
printf '%s' "$INTRO" | grep -qi "introspection\|disabled\|not allowed\|غير مسموح\|Query root type" \
  && { printf "   ✅ introspection is refused in the production build\n"; pass=$((pass+1)); } \
  || { printf "   ❌ introspection appears to be enabled\n"; fail=$((fail+1)); }

echo
printf "════════ SUMMARY: %d passed, %d failed ════════\n" "$pass" "$fail"
[ "$fail" -eq 0 ] && echo "PHASE_B_LIVE_ENFORCEMENT = PASS" || echo "PHASE_B_LIVE_ENFORCEMENT = FAIL"
exit "$fail"
