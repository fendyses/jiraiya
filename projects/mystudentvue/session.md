# Current Session Memory - 2026-09-24
*Active working memory for current conversation*

## Session Context
**Session Type**: Work
**Current Project**: MyStudent (`/Applications/Sites/mystudentvue`, slug `mystudentvue`, UiTM)
**Status**: Wrapping up (diary 24-09, CR log caught up 26-09)
**Time**: Afternoon session, diary saved 16:30

## Current Focus
- **Primary Task**: eGL (`/egl`, `src/views/kesihatan/GlPage.vue`): SML eligibility question + allow regenerating the same GL after 24h
- **Technical Context**: Vue 3 SPA + Firestore, branch `development`. GL eligibility comes from `https://digitalcampus.uitm.edu.my/api/mystudent/generate/gl` (`jumlah kelayakan`); GL history in `pelajar/{id}@student.uitm.edu.my.sejarah_gl`
- **Progress**: 24h rule committed by Fendy as `4ea23c7` ("update", 2026-09-24). Not browser-tested by Claude

## Working Memory
### Active Context
- **Current Topic**: eGL duplicate-GL rule
- **Immediate Goals**: Let students regenerate the same GL (same hospital, jenis, negeri, amounts) once the previous one is > 24h old
- **Recent Progress**: Duplicate check now blocks only if a matching `sejarah_gl` entry's `tarikh_jana` is < 24h old; message adds "GL baharu boleh dijana semula selepas 24 jam."
- **Next Steps**: Confirm SML eligibility with the digitalcampus API owner or test with one SML + one S student ID (production call — needs Fendy's go-ahead); browser-test the 24h rule; deploy

### Important Decisions
- **No study-mode gate for eGL in the frontend.** Eligibility is entirely the API's `jumlah kelayakan`; admins bypass.
- **Study-mode lists differ across the app.** Borang Perubatan `S,SA,SF,SK` (`KesehatanPage.vue:138`); ASNB `S,SA,SF,SN,SK,SML` (`ProfilePage.vue:154`, `SponsorPage.vue:406`). The medical-form list is NOT the GL rule.
- **"More than one day" = rolling 24 hours**, not next calendar day (offered to switch).

## Session Recap (For AI Restart)
- **Previous Session Summary**: Answered SML-vs-eGL (API decides), clarified study-mode lists, relaxed the duplicate-GL block to 24h.
- **Where We Left Off**: `4ea23c7` committed on `development`; `.firebase/hosting.*.cache` modified (build artefact).
- **Important Context**: Duplicate check is client-side only; any API-side duplicate block still applies. Entries without a valid `tarikh_jana` no longer block.
- **User's Current State**: Wants eGL usable for full-time extended (SML) students; expects CR entries logged with every diary save.

## Session Achievements
- ✅ Traced eGL eligibility to the digitalcampus `generate/gl` API
- ✅ Mapped all study-mode allow-lists in the app
- ✅ Implemented 24h duplicate-GL window in `GlPage.vue` (committed as `4ea23c7`)
- ✅ Diary entry `daily-diary/current/2026-09-24.md`
- ✅ CR log caught up: 04-09 (3 blocks) and 24-09 (1 block) in `CR/9-2026.md`

## Quick Context for Next Session
- **Where We Left Off**: eGL 24h rule committed, untested in browser
- **What's Working**: Eligibility/menu unchanged; only duplicate window relaxed
- **What Needs Attention**: SML eligibility confirmation from the API side; deploy

---
*Session updated: 2026-09-26 14:29*
