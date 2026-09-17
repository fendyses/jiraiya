# Nilam — Session Memory
*Last updated: 2026-09-17*

## Session Context
**Session Type**: Support investigation → module review and rebuild → data-fix handoffs
**Current Project**: Nilam (slug: `nilam`) — `/Applications/Sites/nilam` — UiTM
**Status**: PUU Monitoring work complete on `development` but unstaged by request; LPU re-route fix staged; two production SQL handoffs pending
**Time**: 10–17 Sep session, closed 14:36 GMT+8 on 17 Sep

## Current Focus
PUU Monitoring module: performance fix (calendar prefix sum), management dashboard rebuilt (no ApexCharts), document-movement track redesigned, re-assign-vetter panel, review findings implemented, production install SQL prepared. Plus two production support cases: 9044/8522 MEU letter flag, and 8615 LPU re-route from Pending LPU Approval.

## Working Memory

### Active Context
- **Staged**: only `ApplicationController::update()` LPU-flag hunks + `applications/edit.blade.php` (re-route modal from status 13). Not committed.
- **Unstaged/untracked**: everything PUU (`PuuMonitoringController`, `Services/Puu/*`, `puumonitorings/*` views, `WorkingDayCalendar` prefix sum, `SlaCalculator` first-assignment guard, routes, `assign()` note/guard in `ApplicationController`, `applications/create.blade.php` confirm).
- **Local `.env` is pointed at PRODUCTION** (`antartika`/`nilams`); `effendy` is SELECT-only there. Switch back to `nilamsdev` before dev tests. Use `DB_HOST=… DB_DATABASE=nilamsdev … php artisan …` overrides if needed.
- Dev doc 3492 was accidentally re-assigned via a browser preview and restored (Dr. Mohd Hairy, return-for-amendment); zero "Re-assigned" notes remain in dev.
- View-model cache: built and **reverted** on request (design: key = scope + version + date; bump on status log / assignment / holiday / SLA-config writes; delete old version's keys on bump).

### Production facts (checked 11–17 Sep)
- 9044 (Signatory Setup) and 8522 (Approved by LPU): `meu_drafted_letter=1` with letter present; fix is `SET meu_drafted_letter=0` — safe, nothing downstream reads it; needs DBA account.
- 8615: Pending LPU Approval (13), `lpu_approval=1`, LPU meeting #30, no notice sent, MEU released. Wants Notification-only: after deploy use the re-route modal; before deploy, SQL (`lpu_approval=0`, status 12, log row).
- `puu:verify` on prod: slugs OK, invariants OK on 2,988 in-flight docs, 0 vetters missing assignment logs (no backfill), 3 tables + 5 permissions missing → `database/sql/puu_monitoring_install.sql` (updated with PIC thresholds + fixed holidays, dev-tested).
- Prod office-wide hydration 4.3 s (dev 1 s) — needs cache or query-side date filter before go-live.

### Important Decisions
- Stage 1 breaches at 15 wd (14 is within cap), Stage 2 at 22 — user-confirmed.
- All monitoring pages default to "this year"; All time carried explicitly as `period=all`.
- Reminder throttle: a document already reminded twice in 5 minutes is skipped; skips listed in a warning flash.
- Health threshold unified at ≥ 90 % (rings and badges).
- Stage 2 "On Track" tile not added (user: not required).
- Management dashboard row 2 in workflow order (Stage 1 queue → Stage 2 bands → PIC → missing), tiles Stage 1 → Stage 2 → paused → data quality.
- `resolveAssignment()` uses the FIRST assignment after the latest arrival, so re-assignments never move Stage 1 timing.

## Session Recap (For AI Restart)
The MEU letter for 9044 is hidden only by `meu_drafted_letter=1` because `MeuApprovalController::store()` (since d199f6bd) advances status at draft time and the Approve click became optional. PUU Monitoring got a full review; 12 accepted findings implemented; dashboards 4× faster via a prefix-sum working-day calendar; management page rebuilt from a mock-up; re-assign panel with modal; two of my own bugs (form spanning two `<td>`s; global preloader on intercepted submits) found and fixed. Two LPU re-route defects fixed for 8615 and staged alone.

## Quick Context for Next Session
- **Where We Left Off**: LPU fix staged; PUU tree unstaged; SQL handoffs for 9044/8522 and 8615 with the DBA; install SQL ready for prod.
- **What's Working**: all monitoring pages render 200 on dev; `puu:verify` invariants pass on prod data.
- **What Needs Attention**: (a) commit the staged LPU fix; (b) decide when to stage/push PUU; (c) `.env` back to dev; (d) prod install SQL + moving holidays; (e) speed for 2,988 docs; (f) proper `array_filter()` fix in `ApplicationController::update()`.

---
*Session updated: 2026-09-17 14:36*
