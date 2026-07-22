# MyAlumniCard — Repo Instructions

**Path**: `/Applications/Sites/myalumni-angular`
**Registry name**: MyAlumniCard (registry #4)
**Aliases to match on recall**: `MyAlumniCard`, `myalumni-angular`, `myalumni`, `alumni`
**Org**: UiTM · **Stack**: Angular · **Backend**: Firebase / Firestore

## What it is
Angular app for UiTM alumni — registration, alumni card, attendance, graduate records.
Alumni data lives in the Firebase `alumni` collection (286,207 documents as of Jul 2026).

## Integrations
- `fastapi.uitm.edu.my/alumnai/semak` — IC verification on registration. Called from
  `register.component.ts`, with a **hardcoded JWT bearer token** at line 175.
- Attendance uses a **separate** token in `attendance.component.ts:102`.

## ⚠️ Standing rule — API tokens
Tokens are hardcoded and expire. When replacing one, **decode the old and new token and
compare the `user` / `app` / `scope` claims.** A token that authorises is not necessarily
equivalent — upstream gates behaviour on app identity.

Register flow must use a token issued to the **`alumnai`** app, matching attendance.
A `myatp` token authorises fine but upstream stops stamping `tarikh_create`.

See: post-mortem `2026-04-20 → 2026-07-21`, decision `2026-07-21`.

## Known open issue
`tarikh_create` has not been stamped on any record created since 17 Apr 2026 —
15,819 records and counting. Cause is the `myatp` token above. **Unfixed.**
Blocked on Integrasi issuing an `alumnai` register token. Backfill source is
Firestore `createTime` (exact to the second). Report: `~/Desktop/tarikh_create-incident-report.pdf`.

## Notes for future work
- `tarikh_create` is written entirely by UiTM upstream — the app never writes or reads it,
  which is why its failure produced no error for three months.
- Registration records only `formData.register = 1` (`profile.service.ts:218`) — a flag, no date.
- Firestore work here has been read-only via authenticated `gcloud` CLI. Keep it that way
  unless Fendy explicitly authorises a write.
