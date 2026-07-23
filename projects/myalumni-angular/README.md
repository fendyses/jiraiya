# MyAlumniCard — Repo Memory

**Path:** `/Applications/Sites/myalumni-angular`
**Aliases:** MyAlumniCard, myalumni-angular, myalumni
**What it is:** UiTM alumni card / registration app (Angular). Registers alumni against UiTM upstream; attendance flow is a sibling.

## Current open thread
🟢 **`tarikh_create` gap fixed — deployed 22 Jul, verified working 23 Jul.** Register flow runs on a `myatp` token instead of `alumnai`, so UiTM stops stamping `tarikh_create`. Historical 15,819 records backfilled 21 Jul; new-record gap now closed by the deployed Firebase Function `stampTarikhCreate`, which fills `tarikh_create` from the doc `createTime` when upstream doesn't stamp (CR logged 22 Jul). Verified 23 Jul: 33 stamped since deploy / 9 today (was 0 pre-deploy); logs confirm the function firing on live registrations, not upstream recovering. **Upstream root cause still live** — proper fix is an `alumnai`-issued register token from Integrasi (open, no longer urgent). See `post-mortems.md`, `reminders.md`, `todo.md`, `decisions.md`.

## This folder
- `session.md` — last session recap
- `decisions.md` · `post-mortems.md` · `reminders.md` · `todo.md`
