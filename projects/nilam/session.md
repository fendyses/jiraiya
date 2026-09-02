# Nilam — Session Memory
*Last updated: 2026-09-02*

## Session Context
**Session Type**: Work
**Current Project**: Nilam (slug: `nilam`) — `/Applications/Sites/nilam` — UiTM
**Status**: Complete, awaiting testing and deploy
**Time**: Morning session, 10:36–11:33 GMT+8

## Current Focus
Began as a MinIO TLS diagnosis, became a bug hunt through the application draft flow.
All work committed and merged with origin/development. Nothing pushed. Nothing tested.

## Working Memory

### Active Context
- Branch `development`, 3 ahead of origin (2 fixes + 1 merge commit), 0 behind.
- `config/services.php` remains modified and deliberately unstaged — never stage it.
- Local `.env` points at the PRODUCTION database (`antartika.uitm.edu.my`), and the
  mysql connection uses a **`tbl_` table prefix** (`config/database.php:57`).
  Tables are `tbl_applications`, `tbl_supporting_documents`.
- Local `.env` has no `MINIO_*` keys, so MinIO paths are inert locally.
  `APP_URL` is the stale `https://nilams.es`; production is `nilams.uitm.edu.my`.

### Recent Progress
- Added read-only `/minio-check` (commit `eb09e52`): MinIO health GET, S3-client
  HEAD probe, and outbound letter-image probes reporting cert issuer and expiry.
- Fixed the draft save deadlock and 8 related bugs (commit `3f4be2f`).
- Merged 5 incoming commits from origin/development with no conflicts (`8e876f5`).

### Important Decisions
- **Draft requires name + category.** Category stays required because
  `edit.blade.php` had it disabled; later resolved by unlocking that field while
  the application is still a draft, so `store()` now allows name-only drafts.
- **MinIO is a best-effort backup, not a gate.** All 12 `putFileAs` calls write
  locally first inside try/catch. An outage now logs a warning instead of
  aborting the submission.
- **Partner lookup takes the first entry present**, not a fixed index — because
  `deletePartner` now truly removes rows, which makes index gaps possible.

## Session Recap (For AI Restart)
Nine bugs fixed across the draft, partner, and upload paths in `MyApplicationController`,
`ApplicationController`, and the myapplications create/edit views. Two commits merged
cleanly with five remote commits. None of it has been executed — no test suite exists
beyond stock Laravel examples.
The original question is still open: whether the SSL.com TLS RSA Root CA 2022 fix landed
on the Nilam VM's CA bundle. Confirming it needs a deploy then a visit to
`https://nilams.uitm.edu.my/minio-check`, or a real supporting-document upload.

## Session Achievements
- ✅ Root-caused the draft deadlock: validation ran before the `btnDraft` branch, and
  `#btnPartner` was only enabled by `select2:select`, which never fires on redisplay
- ✅ Closed the validation gap Fendy spotted — `update()` had no `areas` rule and
  hardcoded `activities` to nullable, previously masked by `store()`
- ✅ Fixed 2 fatal null `reference_no` crashes and a main-document gate that made
  drafts permanently unsavable
- ✅ Traced partner indexing end to end; aligned the 0-based fallback serialiser with
  the 1-based modal path and made `deletePartner` actually remove rows
- ✅ Reordered all 12 `putFileAs` calls to local-first with best-effort MinIO
- ✅ Found `File($path)` called as an undefined function — a production-only fatal
- ✅ Extended `/minio-check` with letter-image host probes derived from production data
  (`nilams.uitm.edu.my` 6764 refs, `cdn.uitm.edu.my` 3479 refs)
- ✅ Merged 5 remote commits with no conflicts; verified all changes survived

## Open Items
- Deploy and confirm TLS via `/minio-check`; the `cainfo` line names the bundle to patch
- Walk 3 untested paths: draft create/resume/submit, partner add/delete, file upload
- Remove `/minio-check` and close the `/info` phpinfo route once TLS is confirmed
- `ApplicationController::store` has no partners rule even on submit — unresolved
- Files uploaded during the outage have no MinIO backup; reconciliation command not written

---
*Session updated: 2026-09-02 11:33*
