# Nilam — Post-Mortems
*Failures + lessons for this repo. Append-only.*

---

## 2026-06-05 → 2026-07-23 — "Pending LPU Approval" overwrote LPU-notification status on 96 apps

**Detected:** 2026-07-23 by the MEU Secretariat (~7 weeks after onset). Analysed same day.
**Status:** Root cause confirmed against live DB. Fix + backfill designed, NOT yet applied.

### What happened
On the Approved MEU page, every application showed status "Pending LPU Approval" (id 13), including applications the MEU had decided were **LPU notification only** (`lpu_approval = 0`), which should read "Submitted for LPU Notification" (id 12). 96 rows were mislabelled across 5 MEU meetings, all under LPU meeting #29.

### Root cause
Regression in commit `427649b` ("bug - renewal mou", 5 Jun 2026), from two combined changes:
1. A new global model hook in `app/ApplicationStatusLog.php:53` — `static::created` forces `applications.application_status_id` to match every newly-created status-log row.
2. `LpuApprovalController::meeting()` has always **logged** status 13 for *every* app in the assignment batch (including notify-only ones). Previously harmless because the real status field was only set to 13 for `lpu_approval=1`; notify apps kept status 12.

Combined, the hook propagated the placeholder log value (13) onto the record, overwriting the correct 12. The same commit then flattened `meeting()` to always set 13, cementing it.

### Why it hid so long
Every LPU listing page renders `lpu_approval == 1 ? status->name : 'LPU Notified'`, so notify apps read "LPU Notified" there regardless of the underlying status. Only the Approved MEU page prints the raw `application_statuses.name`, so only the MEU Secretariat saw it.

### Lessons
1. **A "sync record to log" hook is only safe if every logger already writes the correct status.** `meeting()` logged a placeholder (13) for all apps — the hook turned that placeholder into truth.
2. **Fixing "make the record match the log" is wrong when the log itself is wrong.** The commit's comment "so the status stays consistent with the log" points at the reasoning error — it should have fixed the *source* (log the per-app status).
3. **A field rendered raw on one page and overridden on another hides divergence** until someone looks at the raw page.

### Preventive action
- `meeting()` must log/apply the per-app status: 13 for `lpu_approval=1`, 12 for `lpu_approval=0` (unused `$approvedByLpu` var at line 352 was meant for this).
- Backfill the 96 rows (`lpu_approval=0 AND application_status_id=13`) → status 12; dry-run count first.
- Consider whether any global "sync to latest log" hook should exist at all, or be scoped.

### Caveat
Fix and backfill are designed but unapplied as of 2026-07-23. Verify the 96-row count again immediately before backfilling (it grows as new apps are assigned to LPU meetings under the buggy code).
