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
Upstream stopped stamping `tarikh_create` on 17 Apr 2026. Cause is the `myatp` token above.

- **Backfill: done 21 Jul 2026 by Fendy.** 16,788 records at/after 17 Apr now carry the
  field, all genuine Firestore `Timestamp`s, zero strings (verified 22 Jul).
- **Root cause: still live.** Zero records stamped on 22 Jul against ~24/day expected —
  the gap reopens every day. Blocked on Integrasi issuing an `alumnai` register token.
- **Mitigation**: `stampTarikhCreate` in `functions/src/index.ts` fills the field from
  the document's own `createTime` when upstream doesn't. Written 22 Jul, **not yet deployed**.
  It only writes when the field is absent, so it self-disables once upstream recovers.
- The ~16,472 gaps before Apr 2026 are a separate ~6% background issue, cause never
  established, deliberately left alone.

Report: `~/Desktop/tarikh_create-incident-report.pdf`

## Querying Firestore
Read-only counts via `gcloud auth print-access-token` + the Firestore REST
`:runAggregationQuery` endpoint on project `alumniuitmapp`. Note `createTime` is not a
queryable field — filter on `tarikh_create` with a `timestampValue` range instead, and
compare against a `stringValue` range to detect type contamination.

## Notes for future work
- `tarikh_create` is written entirely by UiTM upstream — the app never writes or reads it,
  which is why its failure produced no error for three months.
- Registration records only `formData.register = 1` (`profile.service.ts:218`) — a flag, no date.
- Firestore work here has been read-only via authenticated `gcloud` CLI. Keep it that way
  unless Fendy explicitly authorises a write.
