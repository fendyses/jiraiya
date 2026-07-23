# Nilam — Reminders
*Persistent cross-session follow-ups for this repo.*

## Open

- **Fix `LpuApprovalController::meeting()` per-app status** (opened 2026-07-23): set/log status 13 only for `lpu_approval=1`, status 12 (`submit-for-lpu-notified`) for `lpu_approval=0`. Unused `$approvedByLpu` var at line 352 was meant for this. See post-mortem 2026-06-05 → 2026-07-23.
- **Backfill 96 mislabelled rows** (opened 2026-07-23): `lpu_approval=0 AND application_status_id=13` → status 12. Dry-run the count first (it grows daily under the buggy code). All currently under LPU meeting #29.
- **Decide on status-log history correction** (opened 2026-07-23): whether the placeholder "13" rows already written to `application_status_logs` for notify-only apps should also be corrected.

## Completed

_(none yet)_
