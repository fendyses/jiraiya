# Nilam — Repo Diary Index
*Auto-generated from the global `daily-diary/` journal (the source of truth). Do not edit by hand — regenerate with `daily-diary/regenerate-repo-diaries.py`.*

- **2026-08-20** — [Tracing the Student Photo Pipeline in MyStudent; Nilam: Renewal Dates Surfaced, and a Certificate That Broke the Jawi Calendar](../../daily-diary/current/2026-08-20.md)
  - Outcome: Two distinct image pipelines identified and mapped end to end. Read-only session; no code changed, working tree clean.
- **2026-08-19** — [Nilam: Approval Letter Missing Jawi/Hijri Images; Nilam: LPU status display — a fix I got wrong twice before getting it right](../../daily-diary/current/2026-08-19.md)
  - Outcome: Root cause identified (outbound HTTPS fetch failing on production server, **not** an expired certificate), fixed in code by removing the network dependency entirely. Verified across the whole database and **committed by Fendy as `ed52517`** at 10:33.
- **2026-08-13** — [PUU Monitoring UX Completion and Operational Clarity](../../daily-diary/current/2026-08-13.md)
- **2026-08-09** — [PUU Monitoring Module: Design, Build, Install; PUU Individual User Report and Print-Safe Visuals](../../daily-diary/current/2026-08-09.md)
  - Outcome: Module built, installed to `nilamsdev`, verified. Uncommitted.
- **2026-07-31** — [NILAM Department-Code Source Correction; NILAM LPU Draft Page 404 Investigation; MyStudent Medical Form Token-Renewal Fix](../../daily-diary/archived/2026-07/2026-07-31.md)
  - Outcome: The earlier LPU query workaround was reverted; live Digital Campus ingestion now reads `kodjabatan`, and Fendy manually committed the reviewed fix
- **2026-07-29** — [NILAM: LPU letter editing + the 9 survivors of the meeting-#29 backfill](../../daily-diary/archived/2026-07/2026-07-29.md)
  - Outcome: 9 preliminary letters reworded to "meluluskan" via direct URL; deliberately **not** re-sent. Discovered these 9 are the only rows in LPU meeting #29 that the 88-row backfill missed. Classification (Notify vs Approval) still undecided. No code changed.
- **2026-07-28** — [NILAM: JUU Approval Letter download for admin (Manage Legal Documents)](../../daily-diary/archived/2026-07/2026-07-28.md)
  - Outcome: Done and verified on `development` (uncommitted). 3 files added, no existing shared views modified. Not committed — user remembered they hadn't pulled git yet.
- **2026-07-27** — [NILAM Application 8329 Workflow Investigation; ForexPulse Smart Analysis and iPhone Deployment; ForexPulse Live Rates, Charts, and Visual Analysis](../../daily-diary/archived/2026-07/2026-07-27.md)
  - Outcome: Confirmed that the July MEU resubmission is carrying stale February MEU meeting and letter data; supplied a targeted SQL reset and the correct Secretariat workflow.
- **2026-07-24** — [NILAM: "Pending LPU Approval" fix applied + report](../../daily-diary/archived/2026-07/2026-07-24.md)
  - Outcome: Source code fixed and lint-clean (uncommitted on `development`). Backfill handed off as SQL (DB access is read-only). PDF report generated.
- **2026-07-23** — [NILAM: "Pending LPU Approval" status bug investigation](../../daily-diary/archived/2026-07/2026-07-23.md)
  - Outcome: Root cause found and confirmed against live DB. Fix proposed but NOT yet applied.
- **2026-07-15** — [Installed Codex CLI, Wired It to the JIRAIYA Memory Core](../../daily-diary/archived/2026-07/2026-07-15.md)
  - Outcome: Done — Codex installed globally, `AGENTS.md` created at both global (`~/.codex/`) and repo level, `main/repos.md` registry paths corrected for all 6 repos
- **2026-06-22** — [Black-Screen Fix & The "New Worlds" Roadmap; Farewell Protocol Fix; Quick Check-In; Dashboard CR System & Sharingan Windmill; MyStudent Vue Session Start](../../daily-diary/archived/2026-06/2026-06-22.md)
  - Outcome: Black screen fixed (Fendy committed it). Landed a clear roadmap for new worlds (MP4-first hybrid) and logged it to `todo.md`. No big build tonight — mostly thinking it through properly.
- **2026-06-16** — [Session: Dashboard — Drag-and-Drop for Characters & Pets](../../daily-diary/archived/2026-06/2026-06-16.md)
- **2026-06-15** — [Session: NILAM — PDF Re-upload & MEU Approval Auto-tick](../../daily-diary/archived/2026-06/2026-06-15.md)
- **2026-06-12** — [NILAM: LPU Status Re-routing Feature](../../daily-diary/archived/2026-06/2026-06-12.md)
- **2026-06-05** — [(session)](../../daily-diary/archived/2026-06/2026-06-05.md)
