# Current Session Memory - 2026-09-09
*Global pointer to the latest session — full recap lives in the repo snapshot*

> Note: this file previously contained unresolved git conflict markers
> (`<<<<<<< Updated upstream` / `>>>>>>> Stashed changes`) from an unfinished
> stash pop, mixing the 2026-09-08 and 2026-09-09 morning entries. Resolved
> on 2026-09-09 17:00 by replacing it with the current session snapshot.

## Session Context
**Session Type**: Work / Debug / UI overhaul
**Current Project**: **NRHome** (slug: `nrhome`) — `/Applications/Sites/nrhome` — UiTM
**Status**: 11 commits pushed to `origin/main` (`a7183f1`). Working tree clean.
**Time**: Afternoon session, ended 17:00 GMT+8

## Latest Session
➡️ **Full recap: [`projects/nrhome/session.md`](../projects/nrhome/session.md)**
➡️ Diary entry: `daily-diary/current/2026-09-09.md` (Afternoon - 5:00 PM)

## One-Line Summary
A Quasar 2 upgrade was fully built, verified, then called off — and the detour
surfaced four real production bugs instead, including a type mismatch that had
made saving any house impossible and a form field whose data has never once
reached the database.

## Session Recap (For AI Restart)
- **Where We Left Off**: Everything committed and pushed. `origin/main` and local
  `main` both at `a7183f1`; CI/CD triggered. `quasar build` passes with zero
  warnings.
- **Important Context**: The correct API is **`api.uitm.edu.my`** — the `.env`
  value pointing at `digitalcampus` is STALE and returns 403 because that host
  still demands the service token removed in August. The API's CORS allowlist
  contains the production origin ONLY, which is why `devServer.proxy` exists in
  `quasar.conf.js`. Local dev requires `npm ci --ignore-scripts` (electron@9 has
  no Apple Silicon build) and `NODE_OPTIONS=--openssl-legacy-provider`.
- **What Needs Attention**: (1) Production test record **id 625** still needs
  deleting. (2) The gateway ticket needs sending to whoever owns
  `nrent-turbo-gateway` — three defects there block the remaining filter work.
  (3) Confirm CI deployed `a7183f1` and the pin fix is live.

## Session Achievements
- ✅ Fixed the 422 (`is_available` typed as string) that broke every house save and update
- ✅ Fixed the map pin, broken on 54% of houses — logic existed in two separate copies
- ✅ Proved `zone`/`zone_campus` are silently discarded: 0 of 184 live records populated
- ✅ Full UI/UX pass — glass design system across shell, login, both house forms, filters
- ✅ Photo upload moved into the add-house form (was a two-screen flow)
- ✅ Made local development possible on Apple Silicon + Node 24
- ✅ Published gateway defect ticket backed by production evidence
- ✅ Quasar 2 upgrade built and verified, then reverted on request (branch preserved)

## Recent per-repo sessions
- NRHome → `projects/nrhome/session.md` (2026-09-09)
- Nilam → `projects/nilam/session.md` (2026-09-09)
- MyStudent → `projects/mystudentvue/session.md` (2026-08-12)
- ForexPulse → `projects/forexpulse/session.md` (2026-07-27)

---
*Session updated: 2026-09-09 17:00*
