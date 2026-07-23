# MyAlumniCard — Repo Memory

**Path:** `/Applications/Sites/myalumni-angular`
**Aliases:** MyAlumniCard, myalumni-angular, myalumni
**What it is:** UiTM alumni card / registration app (Angular). Registers alumni against UiTM upstream; attendance flow is a sibling.

## Current open thread
🔴 **`tarikh_create` not stamped since 20 Apr 2026.** Register flow runs on a `myatp` token instead of `alumnai`, so UiTM stops stamping `tarikh_create`. Historical 15,819 records backfilled 21 Jul; **root cause still live** — new records stamped zero. Mitigation `stampTarikhCreate` written, not deployed. See `post-mortems.md`, `reminders.md`, `todo.md`, `decisions.md`.

## This folder
- `session.md` — last session recap
- `decisions.md` · `post-mortems.md` · `reminders.md` · `todo.md`
