# MyAlumniCard — Reminders
*Persistent cross-session follow-ups for this repo.*

## Open

- **Request `alumnai`-issued register token from Integrasi** (opened 2026-07-21; downgraded from urgent 2026-07-23): The register flow runs on a `myatp` token since 20 Apr 2026, so UiTM stops stamping `tarikh_create`. The daily gap is now **mitigated** by the deployed `stampTarikhCreate` function (22 Jul) — so this is no longer urgent, but the `alumnai` token remains the proper root-cause fix. Ask Integrasi for a register-flow token issued to the **`alumnai`** app (matching `attendance.component.ts:102`) and confirm that stamping is gated on app identity. See post-mortem 2026-04-20 → 2026-07-21.

## Completed

- ~~**Deploy `stampTarikhCreate` Firebase Function**~~ — **DONE 2026-07-22 by Fendy.** Deployed to write `tarikh_create` from the doc `createTime` when upstream doesn't stamp; self-limits to docs missing the field. CR logged `CR/7-2026.md` (22-07-2026).
- ~~**Backfill 15,819 missing `tarikh_create`**~~ — **DONE 2026-07-21 by Fendy.** Verified 2026-07-22: 16,788 records now carry `tarikh_create` at or after 17 Apr, all genuine Firestore `Timestamp`s, zero written as strings. Remaining 16,472 gaps are the separate pre-April background ~6%, deliberately untouched.
