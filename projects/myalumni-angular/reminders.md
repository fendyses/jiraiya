# MyAlumniCard — Reminders
*Persistent cross-session follow-ups for this repo.*

## Open

- **Follow up with Integrasi on the upstream `tarikh_create` root cause** (opened 2026-07-21; downgraded from urgent 2026-07-23): Fendy already reported it to Integrasi, but **they didn't know the cause either** — so there's no upstream fix owner yet. The daily gap is now **mitigated** by the deployed `stampTarikhCreate` function (22 Jul, verified 23 Jul), so this is no longer urgent. Proper cure remains an `alumnai`-issued register token (matching `attendance.component.ts:102`) + confirming stamping is gated on app identity. Once upstream stamps again, the function self-disables. See decision 2026-07-22 and post-mortem 2026-04-20 → 2026-07-21.

## Completed

- ~~**Deploy `stampTarikhCreate` Firebase Function**~~ — **DONE 2026-07-22 by Fendy.** Deployed to write `tarikh_create` from the doc `createTime` when upstream doesn't stamp; self-limits to docs missing the field. CR logged `CR/7-2026.md` (22-07-2026).
- ~~**Backfill 15,819 missing `tarikh_create`**~~ — **DONE 2026-07-21 by Fendy.** Verified 2026-07-22: 16,788 records now carry `tarikh_create` at or after 17 Apr, all genuine Firestore `Timestamp`s, zero written as strings. Remaining 16,472 gaps are the separate pre-April background ~6%, deliberately untouched.
