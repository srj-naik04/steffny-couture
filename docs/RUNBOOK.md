# Runbook

Operational procedures for the Steffny Couture app. When something needs doing in production, find it here.

## Daily checks (passive)

- Supabase dashboard → check error rate is < 1% on Edge Functions
- Email log (SMTP provider) → confirm last 24h sends > 0 (silence = something broke)
- Expo dashboard → check no spike in JS crashes

## Reset demo data

```bash
# Wipes ALL bookings, customers, history. Use only on dev / staging.
npm run seed:reset

# Or step by step:
npx supabase db reset --local      # wipes local DB
npm run seed                        # repopulates fresh demo data
```

Never run `seed:reset` against production. Project-level safeguard: the seed script checks `process.env.SUPABASE_URL` and aborts if it contains the production project ref.

## Rotate SMTP credentials

If Gmail flags abuse, or you migrate to a dedicated SMTP provider:

1. Generate new credentials in the provider's dashboard
2. Update Supabase secrets:
```bash
supabase secrets set SMTP_HOST=<new-host> SMTP_PORT=587 SMTP_USER=<new-user> SMTP_PASS=<new-pass>
```
3. Redeploy the affected Edge Function:
```bash
supabase functions deploy send-email
```
4. Send a test:
```bash
curl -X POST <project>.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","to":"you@example.com"}'
```
5. Update `/docs/DECISIONS.md` if the provider changed.

## Restore a database backup

Supabase keeps automatic point-in-time backups on the paid plan. On free plan, daily snapshots.

1. Supabase dashboard → Database → Backups
2. Pick the snapshot (closest to "before things broke")
3. Click "Restore" — creates a new project from the snapshot
4. Verify data integrity in the new project
5. Update the app's `SUPABASE_URL` / `SUPABASE_ANON_KEY` env vars
6. Push a small update via EAS Update so apps pick up new env

In emergency, communicate with Steffi/Bunty before doing this — bookings made after the snapshot will be lost.

## Push notification debugging

Customer reports they aren't getting notifications:

1. Check their `push_tokens` row exists in DB and is `is_active = true`
2. Try sending a manual push via Expo's tool:
```bash
curl -H "Content-Type: application/json" \
     -X POST "https://exp.host/--/api/v2/push/send" \
     -d '{"to":"<their-expo-token>","title":"Test","body":"From runbook"}'
```
3. If Expo returns OK but device doesn't receive — usually OS-level permission revoked. Ask them to check Settings → Notifications → Steffny Couture
4. If iOS specifically: verify your APNs key is uploaded to Expo dashboard and not expired (Apple keys expire after rotation)
5. If Android specifically: verify FCM credentials uploaded to Expo

## Rollback a production deploy

### App side (EAS Update channel)

If the latest OTA update is bad:
```bash
# List recent updates
eas update:list --channel production

# Republish a known-good earlier update to the production channel
eas update:republish --group <group-id> --channel production
```

Users get the previous version on next app launch — no App Store re-review needed.

### App side (native binary)

If the bad change is in a native binary release (not OTA), submit a hotfix build via EAS. Apple expedited review can take ~24-48 hours; mention in the submission notes "critical bug affecting production users".

### Backend side

Migrations are forward-only in production. To revert:
1. Write a new "fix" migration that reverses the bad change
2. Deploy via `npx supabase db push`
3. Never edit/delete a committed migration in `/supabase/migrations/`

## Adding a new staff member

1. Sign them up via the app (or via Supabase Auth dashboard)
2. In the SQL editor, set their role:
```sql
update public.profiles
set role = 'tailor'   -- or 'manager'
where id = '<their-user-id>';
```
3. They sign out and back in — staff dashboard appears
4. (Future: build a manager-only "Staff" screen for this)

## Removing a customer (GDPR right to be forgotten)

```sql
-- Customer requests deletion under UK GDPR
-- 1) Anonymise bookings (preserve audit trail without PII)
update public.bookings
set
  guest_email = null,
  guest_phone = null,
  guest_name = null,
  customer_id = null,
  notes = '[removed]'
where customer_id = '<user-id>' or guest_email = '<email>';

-- 2) Delete profile and auth user
delete from public.profiles where id = '<user-id>';
delete from auth.users where id = '<user-id>';

-- 3) Delete their storage objects
-- (do via Supabase dashboard → Storage → search by their folder)
```

Document the request, who actioned it, and when, in a private compliance log.

## Common errors and what they mean

| Error / symptom | Likely cause | Fix |
|---|---|---|
| Customer can't see their own booking | RLS policy mismatch on `guest_email` casing | Check `auth.jwt() ->> 'email'` matches stored value; consider normalising on insert |
| Edge Function 500 | Look at function logs in Supabase dashboard | Common: SMTP credentials wrong, or react-email render failed on missing prop |
| Push not arriving on iOS | APNs key expired | Re-upload key in Expo dashboard |
| App crashes on cold start | Often: stale TanStack Query persisted cache with shape mismatch | Bump query cache version key to invalidate persisted cache |
| Build fails on EAS | Native module incompatibility after Expo SDK upgrade | Check release notes for the module; may need version bump |

## Emergency contacts

- **Anthropic (Claude Code issues):** support@anthropic.com
- **Supabase:** dashboard → Support
- **Expo:** dashboard → Support
- **Apple Developer:** developer.apple.com/support
- **Google Play:** support.google.com/googleplay/android-developer

## Quarterly maintenance

- [ ] Update Expo SDK if a new major dropped (test thoroughly first)
- [ ] Rotate any SMTP / API keys that have aged > 12 months
- [ ] Review Supabase Advisor warnings
- [ ] Check Apple Developer membership renewal status ($99/yr)
- [ ] Verify domain registration not lapsing
- [ ] Review and prune unused storage objects (cost saving)
- [ ] Renew DNS records if any are expiring (SPF, DKIM, DMARC TXT)
