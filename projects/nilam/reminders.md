# Nilam — Reminders
*Persistent cross-session follow-ups for this repo.*

## Open

- **Run the MEU-letter release SQL on production** (opened 2026-09-17): `UPDATE tbl_applications SET meu_drafted_letter = 0 WHERE id IN (9044, 8522);` — needs a write-capable account (`effendy` is SELECT-only on `nilams`). Safe: nothing downstream reads the flag.
- **8615 → LPU Notification** (opened 2026-09-17): after the staged LPU fix is deployed, use the re-route modal from Pending LPU Approval; before that, SQL `lpu_approval=0, application_status_id=12` + a status-log row.
- **PUU Monitoring production install** (opened 2026-09-17): run `database/sql/puu_monitoring_install.sql` (write-capable account), add moving holidays from the gazette, then `php artisan puu:verify` on the server. No backfill needed on prod.
- **PUU speed on production** (opened 2026-09-17): 2,988 in-flight docs hydrate in 4.3 s; choose the view-model cache (reverted design in 11 Sep transcript) or a query-side received-date filter before go-live.
- **Switch local `.env` back to `nilamsdev`** (opened 2026-09-17): it is currently pointed at production.
- **Fix `array_filter()` in `ApplicationController::update()`** (opened 2026-09-17): drops every `0` in the payload (`priority`, `nominated_signatory`, …), not just `lpu_approval`; the staged fix only special-cases the LPU flag.
- **Fix `LpuApprovalController::meeting()` per-app status** (opened 2026-07-23): set/log status 13 only for `lpu_approval=1`, status 12 (`submit-for-lpu-notified`) for `lpu_approval=0`. Unused `$approvedByLpu` var at line 352 was meant for this. See post-mortem 2026-06-05 → 2026-07-23.
- **Backfill 96 mislabelled rows** (opened 2026-07-23): `lpu_approval=0 AND application_status_id=13` → status 12. Dry-run the count first (it grows daily under the buggy code). All currently under LPU meeting #29.
- **Decide on status-log history correction** (opened 2026-07-23): whether the placeholder "13" rows already written to `application_status_logs` for notify-only apps should also be corrected.

## Completed

_(none yet)_
