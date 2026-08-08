# Current Session Memory - 2026-08-09
*Active working memory for current conversation*

## Session Context
**Session Type**: Architecture design + full-stack implementation
**Current Project**: Nilam
**Repo Path**: `/Applications/Sites/nilam`
**Branch**: `development`
**Status**: Built, installed to `nilamsdev`, verified — **uncommitted**
**Time**: 00:11 MYT (session ran from ~22:05 on 8 Aug)

## Current Focus
- **Primary Task**: Build the Legal Advisor's Office (PUU) Monitoring Module — two SLA stages, RBAC, dashboards, periodic reporting.
- **Technical Context**: Nilam is Laravel 8 + Blade + Bootstrap 4 (Skote) + DataTables + ApexCharts. The module stores almost nothing: both SLA clocks and the movement tracker are derived from `application_status_logs`, which Nilam already writes on every transition.
- **Progress**: Complete and verified. 20 new files, 6 existing files touched. Nothing committed.

## Working Memory

### Active Context
- **Current Topic**: Module finished; awaiting commit and Fendy's re-login to see the menu.
- **Immediate Goals**: Commit on `development`; Fendy logs out/in so Spatie reloads permissions.
- **Recent Progress**:
  - Designed the module against the live schema (design artifact Rev. B).
  - Corrected the brief: no React/Tailwind in Nilam — built on Blade + Bootstrap 4.
  - Abandoned migrations mid-build on Fendy's instruction (CI/CD has them disabled) → raw SQL + `puu:install` Artisan command.
  - Applied SQL to `nilamsdev` via Laravel PDO (mysql CLI rejected the shell-mangled password).
  - Built two SLA stages: assignment (14 wd, LA) and feedback (21 wd, vetter).
  - Added `view_assignmentmonitorings` so the LA sees their own performance.
  - Fixed the Work Monitoring table — DataTables Responsive had collapsed all 9 columns into hidden child rows.
  - Cut that page from 2,082,831 → 724,276 bytes by removing Blade indentation.
- **Next Steps**: Commit; then decide on the open config questions below.

### Important Decisions
- Resolve "has this reached Executed Document" from **history**, never `applications.application_status_id` — a boot hook overwrites that column, hiding 124 of 143 executions.
- Outstanding excludes terminal statuses by default → **853** in flight, not 1,383.
- Separate **breached** (actionably late) from **abandoned** (>90 working days, excluded from all averages). Breached 99 → 10; team health 68% → 98.6%.
- All durations in **working days**; weekends never counted, holiday table supported.
- RBAC scoping is **intent-based**, not permission-based: `visibleTo($user, $selfOnly)`, because 7 of 13 vetters also hold Admin.
- Group assignment performance by **who actually assigned**, not by role — 8 assigners, only 4 hold Legal Advisor.
- Ship schema as raw SQL + Artisan seeding, never migrations.

## Session Recap (For AI Restart)
- **Previous Session Summary**: Last Nilam session (31 Jul) fixed the LPU 404 department-code mapping, committed as `33e8366`. Historical `department_code` repair for user 71 was left pending and is still pending.
- **Where We Left Off**: PUU Monitoring Module fully built and installed to `nilamsdev`, all checks passing, but **not committed**. Fendy needs to log out and back in for the sidebar to appear.
- **Important Context**: `tbl_` table prefix applies to raw SQL but not Eloquent. Status slugs do not match their display names — status 1 "Application Withdrawn" has the slug `new`. An unresolved slug fails silently.
- **User's Current State**: Satisfied with the build; asked for the table list, then a diary save.

## Session Achievements
- ✅ Delivered the design as a published artifact (Rev. A → Rev. B after four decisions).
- ✅ Corrected the stack assumption before writing any code.
- ✅ Built 2 support tables, 2 indexes, 0 domain tables — module is derived, not stored.
- ✅ Two first-class SLA stages with independent caps, owners and RAG.
- ✅ New `view_assignmentmonitorings` permission + "My Assignment SLA" page for the LA.
- ✅ Found and fixed 4 real bugs: guessed terminal slugs (28-document error), working>calendar on 94 documents, dual-role RBAC leak, and the 17-document stage disagreement.
- ✅ Split breached from abandoned, making compliance a usable metric.
- ✅ Fixed the collapsed Work Monitoring table and cut the page 65%.
- ✅ 13 invariants, 15 access cases, 14 unit tests, `puu:verify` all passing.
- ✅ Converted migrations to raw SQL + Artisan command per the CI/CD constraint.

## Quick Context for Next Session
- **Where We Left Off**: Everything works and is installed; nothing is committed.
- **What's Working**: All 5 pages render for both tiers with correct 403s; both SLA stages reconcile.
- **What Needs Attention**:
  - Commit the 20 new / 6 modified files on `development`.
  - Decide: is the cap 21 working days (≈29 calendar) or ~15 working days to preserve a "21 days" circular?
  - Add moving public holidays (Raya, CNY, Deepavali, Wesak, Thaipusam) from the gazette.
  - RAG bands 9/18/19 may be too loose — same-day turnaround is the norm.
  - 70 documents abandoned since 2022 need a cleanup decision.
  - 2 people hold assigned documents without the Drafter/Vetter role.
  - Still outstanding from 31 Jul: repair user 71's `department_code` → `A0644`.

---
*Session updated: 2026-08-09 00:11*
