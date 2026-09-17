# MyAlumniCard — Repo Diary Index
*Auto-generated from the global `daily-diary/` journal (the source of truth). Do not edit by hand — regenerate with `daily-diary/regenerate-repo-diaries.py`.*

- **2026-09-17** — [Nilam: LPU Re-route Check and the SEDA Partner That Became MGTC; MyAlumniCard: Null Father Alumni ID on /attendance, Borang Jubah Notice; Nilam: PUU Monitoring Redesign Week, the MEU Letter That Was Never Released, and Two LPU Flag Bugs](../../daily-diary/current/2026-09-17.md)
  - Outcome: 8898 confirmed safe to re-route through the existing modal. Partner data fully repaired by Fendy through the UI, verified against the live DB. One residual: reference number on application 9328 still needs a SQL update by a write-capable DB user. No code changed.
- **2026-09-14** — [MyAlumniCard: Serve Failure, Split-Horizon CDN, Hot Seat Table Rebuild](../../daily-diary/current/2026-09-14.md)
  - Outcome: Serve restored, production image failure fully explained (no app bug), Hot Seat table rebuilt and shipped in `7fff3b5` + `8e4f3bd`
- **2026-09-11** — [MyAlumniCard Registration API Recovery](../../daily-diary/current/2026-09-11.md)
  - Outcome: Local verification now uses an Angular same-origin proxy, production bypasses the Angular service worker for this API call, and the rejected `myatp` token was replaced with the working `alumnai` token.
- **2026-09-10** — [The Save Button Was Never the Problem; The Browser Was Never Looking at My Server](../../daily-diary/current/2026-09-10.md)
  - Outcome: Root cause found and fixed after two wrong diagnoses; four commits landed (`ae98df1`, `adf0637`, `5a60aa1`, `17536b2`); working tree clean
- **2026-07-21** — [JIRAIYA Farewell and Banner Refinement; Session Farewell; Agent Definition Drift Audit; MyAlumniCard: Why 15,819 Alumni Records Lost `tarikh_create`](../../daily-diary/archived/2026-07/2026-07-21.md)
  - Outcome: Removed the automatic credit-usage line, introduced a polished violet JIRAIYA banner, and confirmed the current macOS setup is sufficient for use on another Mac
- **2026-07-15** — [Installed Codex CLI, Wired It to the JIRAIYA Memory Core](../../daily-diary/archived/2026-07/2026-07-15.md)
  - Outcome: Done — Codex installed globally, `AGENTS.md` created at both global (`~/.codex/`) and repo level, `main/repos.md` registry paths corrected for all 6 repos
