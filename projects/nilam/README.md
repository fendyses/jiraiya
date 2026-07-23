# Nilam — Repo Memory

**Path:** `/Applications/Sites/nilam`
**Stack:** Laravel 8.x · PHP · MySQL · Bootstrap 4 (Skote theme)
**What it is:** MOU/MOA agreement lifecycle management system for UiTM.
**UiTM repo:** yes (CR log applies — see `CR/`).

## Workflow
`Application` → vetting → **MEU** committee approval (`MeuApprovalController`) → **LPU** board approval/notification (`LpuApprovalController`) → signing → activity monitoring. Tracked via `application_status_id` / `document_status_id`.

## This folder
- `instruction.md` — full working instructions (stack, commands, architecture)
- `session.md` — last session recap
- `diary.md` — repo-scoped diary entries
- `decisions.md` · `post-mortems.md` · `reminders.md` · `todo.md`

## Current open thread
🔴 **"Pending LPU Approval" status bug** — notify-only apps mislabelled. Fix + backfill pending. See `post-mortems.md`, `reminders.md`, `todo.md`, and diary entry 2026-07-23.
