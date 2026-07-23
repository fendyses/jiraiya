# Nilam — Decision Log
*Non-obvious decisions for this repo. Append-only.*

---

## 2026-07-23 — Fix "Pending LPU Approval" at the source, not by matching the log
**Context**: 96 notify-only apps (`lpu_approval=0`) show status 13 ("Pending LPU Approval") instead of 12 ("Submitted for LPU Notification"). Caused by a global `ApplicationStatusLog::created` hook propagating the placeholder status that `LpuApprovalController::meeting()` always logs.
**Decision**: Fix the source — `meeting()` will log/apply the per-app status (13 for `lpu_approval=1`, 12 for `lpu_approval=0`) — rather than "make the record match the log". Then backfill the 96 affected rows to status 12 (dry-run count first). Not yet applied.
**Rationale**: The log was the thing that was wrong; the record was correct until the hook overwrote it. Making the record follow a wrong log is what caused the bug, so correcting the record to 12 and fixing the logger is the real fix. Keeping the global sync hook is acceptable *only* once every logger writes the correct status.
