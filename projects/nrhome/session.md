# NRHome — Session Memory
*Per-repo session RAM. Overwritten on each diary save.*

---

## Session Context
**Session Type**: Work / Debug / UI overhaul
**Current Project**: NRHome (slug: `nrhome`) — `/Applications/Sites/nrhome` — UiTM
**Status**: 11 commits pushed to `origin/main` (`a7183f1`). CI/CD triggered.
**Time**: Afternoon session, ended 17:00 GMT+8

## Current Focus
Started as a Quasar 1 → 2 upgrade evaluation. The upgrade was fully built and
verified, then called off by Fendy. The session pivoted to fixing real
production defects surfaced along the way, plus a full UI/UX modernisation of
the shell, both house forms, the login screen and the search/filter panel.

## Working Memory

### Active Context
- **The API is `https://api.uitm.edu.my`** — NOT `digitalcampus.uitm.edu.my/api`.
  The `.env` value is STALE: digitalcampus returns 403 "Not authenticated"
  because it still demands the `TOKEN_API_INTEGRASI` service token removed in
  August. `public/env.js` holds the correct value.
- **API CORS allowlist contains the production origin only.** localhost is not
  on it — that is why `devServer.proxy` exists in `quasar.conf.js`. Without it
  every API call from `quasar dev` is blocked and the login screen falls back
  to username/password.
- **Local dev needs two things**: `npm ci --ignore-scripts` (electron@9 has no
  Apple Silicon build) and `NODE_OPTIONS=--openssl-legacy-provider npx quasar dev`
  (webpack 4 vs OpenSSL 3).
- **The gateway is a separate repo** (`nrent-turbo-gateway`) and is NOT on this
  machine. Three defects there are documented and blocking further work.

### Recent Progress
- Quasar 2 upgrade built + verified, then reverted; branch `upgrade/quasar-2`
  preserved at `0690a49`
- Fixed `is_available` string/boolean mismatch that broke ALL house saves
- Added photo upload directly to the add-house form (was a two-screen flow)
- Redesigned login, shell, both house forms, search/filter, notification
  banner, account menu, uploader
- Fixed map pin broken on 54% of houses (two separate copies of the logic)
- Rent fields: only one of three now required; Utilities hidden when Unfurnished

### Important Decisions
- **Do not upgrade to Quasar 2 for now** (Fendy, this session). Work preserved
  on branch, not deleted.
- **SPA sends `is_available` as `'1'`/`'0'`** as a temporary workaround. Verified
  against production. MUST be removed when the gateway accepts `bool`.
- **Do not add client-side filtering** — the listing is server-paginated
  (488 records, 8/page, no page-size parameter).
- **Do not add zone filters until the gateway stores zone data** — 0 of 184
  records have any.

## Session Recap (For AI Restart)
NRHome is now on `a7183f1` with 11 commits deployed. Everything committed and
pushed; working tree clean. Three gateway defects block further progress and are
written up in a published ticket. One production test record (id 625) still
needs deleting — it is marked unavailable and absent from all public pages, but
it exists.

## Session Achievements
- ✅ Quasar 2 upgrade fully built and verified (then reverted on request)
- ✅ Fixed the 422 that made saving/updating any house impossible
- ✅ Proved `zone`/`zone_campus` data loss across 184 live records
- ✅ Fixed map pin for plain-text and coordinate values (54% of houses)
- ✅ Caught 2 further bugs in a pre-push review (string truthiness, CSS leak)
- ✅ Made local development possible on Apple Silicon + Node 24
- ✅ Full UI/UX pass: glass design system, rebuilt form grids, standard filters
- ✅ Published gateway defect ticket with production evidence

## Open Items / Next Session
1. **Delete test record 625** — `DELETE /nrent/rumah/625`
2. **Send the gateway ticket** — https://claude.ai/code/artifact/c6255fe3-8091-48a2-82b7-10a37394d432
3. **Verify CI/CD deployed** `a7183f1` and the pin fix is live on production
4. Remove the `'1'`/`'0'` workaround once the gateway accepts `bool`
5. Five Saring filters designed but unbuilt — blocked on gateway query params
6. Integrasi to whitelist `http://localhost:8080/#/mydigitalid/callback`
   on Keycloak client `uitm-nrhome`
7. `.env.contoh` regained a service token + signkey earlier today; it is back to
   the clean committed state, but worth understanding how that happened

---
*Session updated: 2026-09-09 17:00*
