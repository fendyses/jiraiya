# Current Session Memory - 2026-09-14
*Active working memory for MyAlumniCard*

## Session Context
**Session Type**: Work
**Current Project**: MyAlumniCard (`/Applications/Sites/myalumni-angular`) — UiTM
**Status**: Complete — all work committed, tree clean
**Time**: Afternoon session, diary written 16:22 GMT+8

## Current Focus
- **Primary Task**: Restore `ng serve`, diagnose broken production benefit images, restructure the `/admin` Hot Seat Count table.
- **Technical Context**: Angular 18, Node v24.18.1, Firebase Hosting + Cloud Functions (v1, Node 20), Firestore, Chrome Private Network Access, nginx CDN at UiTM.
- **Progress**: All three done. Table rebuild shipped in `7fff3b5`; budget fix in `8e4f3bd`.

## Working Memory

### Active Context
- **Current Topic**: `/admin` Hot Seat Count table, and the unresolved CDN image question.
- **Immediate Goals**: Confirm benefit banner hostnames; verify the rebuilt table against live data.
- **Recent Progress**:
  - `ng serve` was broken because `jspdf`, `html2canvas`, and `@ng-select/ng-select` were in `package.json` and the lockfile but missing from `node_modules` (left by `13b721d` and `bdd8dca`). `npm install` fixed it.
  - Diagnosed the broken production images as split-horizon DNS + Chrome PNA, **not** an app bug. `cdn.uitm.edu.my` → `10.0.21.69` internally, `202.58.84.29` publicly. Off-campus users are unaffected.
  - Confirmed the nginx `/media/` preflight returns a bare `204` with no `Access-Control-Allow-Private-Network` and no `Access-Control-Allow-Origin`.
  - Rebuilt the Hot Seat table: three duplicated `<table>` blocks → one loop over `venue.columns`; `splitLargeLocations()` → `buildHotSeatVenues()`; typed `HotSeatRow` / `HotSeatVenue`; totals via `reduce`.
  - Added per-venue subtotal row, full-height column divider, mobile-stacked border, and `table-layout: fixed` column alignment.
  - Fixed `.hs-badge` being nested inside `.hs-table` (subtotal badges rendered unstyled), added figure captions and the `number` pipe.
  - Raised the `anyComponentStyle` budget from 4kB/4kB to 6kB/8kB after the production build failed.

### Important Decisions
- Do **not** treat the broken images as a production outage — the failure is specific to viewing the public production origin from inside the UiTM network.
- Prefer a same-origin proxy (Hosting rewrite → Cloud Function) over asking UiTM infra to fix the nginx `/media/` preflight, since it needs no coordination. Not implemented pending hostname confirmation.
- Make hot seat column splitting row-count based for all venues rather than hardcoding DATC — this is what allowed the three duplicated tables to collapse into one.
- Raise the CSS budget rather than delete the new subtotal row; the file was already at 98.4% of the old ceiling.

## Session Recap (For AI Restart)
- **Previous Session Summary**: 11 Sep fixed the registration Verify flow (Angular proxy for localhost, `ngsw-bypass` for production, `alumnai` token).
- **Where We Left Off**: All work committed (`1ec7d93`, `7fff3b5`, `8e4f3bd`), working tree clean, production build passes with no warnings.
- **Important Context**: The CDN image issue is diagnosed but unfixed by choice. The proxy design is ready to implement if wanted. The Chrome extension was never connected this session, so nothing was verified visually by JIRAIYA — Fendy checked every change in the browser himself.
- **User's Current State**: Fendy tests against live data on `localhost:4200` and commits quickly as changes land.

## Session Achievements
- ✅ Restored `ng serve` by installing three dependencies missing from `node_modules`.
- ✅ Identified that ~100 `NG8001` template errors were downstream noise from three unresolved imports.
- ✅ Proved split-horizon DNS on `cdn.uitm.edu.my` using the local resolver, DNS-over-HTTPS, and an external fetch.
- ✅ Established that off-campus alumni see the benefit images correctly.
- ✅ Confirmed the nginx `/media/` preflight is missing both PNA and CORS headers.
- ✅ Collapsed three duplicated table blocks into one template loop.
- ✅ Removed the hardcoded venue name from the data path; replaced with named constants.
- ✅ Added per-venue subtotals, column alignment, full-height divider, and mobile-correct stacking.
- ✅ Fixed the unstyled subtotal badges caused by SCSS nesting scope.
- ✅ Restored a passing production build and gave the CSS budget real headroom.

## Quick Context for Next Session
- **Where We Left Off**: Hot Seat table shipped; CDN image fix designed but not built.
- **What's Working**: `ng serve`, production build with no warnings, the rebuilt Hot Seat table.
- **What Needs Attention**: Benefit banner hostnames; whether all-venue splitting is wanted or DATC-only; bearer tokens still shipping in the public bundle; `main/repos.md` still points at NRHome.

---
*Session updated: 2026-09-14 16:22*
