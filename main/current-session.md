# Current Session — Global Pointer
*Latest session across all repos. Per-repo recaps live in `projects/<slug>/session.md`.*

> Session RAM is now per repo. This file just points to the most recent one.
> See `projects/REPO-MEMORY-PROTOCOL.md`.

## Latest session
- **Repo:** Nilam (`projects/nilam/`)
- **Date:** 2026-08-19
- **Summary:** Two Nilam bugs. (AM) Approval letter PDFs showed "Image not found or type unknown" over the Hijri month name and Jawi graphics — disproved the expired-cert theory, real cause is the production server failing outbound HTTPS; fixed by rendering images from local copies (`ed52517`). (PM) LPU list said "LPU Notified" while the view page said "Approved by LPU" — my first two fixes were wrong (stripped an intentional mask, then blanked the column); the July diary revealed the mask is deliberate, so the real fix was one line in `show.blade.php` (`ba17f3d`). Neither commit pushed or deployed. Open: whether the notify path needs its own terminal status instead of borrowing "Approved by LPU".
- **Full recap:** `projects/nilam/session.md`

## Recent per-repo sessions
- Nilam → `projects/nilam/session.md` (2026-08-19)
- MyStudent → `projects/mystudentvue/session.md` (2026-08-12)
- ForexPulse → `projects/forexpulse/session.md` (2026-07-27)
- MyAlumniCard → `projects/myalumni-angular/session.md` (2026-07-22)

---
*Updated: 2026-08-19 15:52*
