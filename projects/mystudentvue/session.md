# Current Session Memory - 2026-08-20
*Active working memory — MyStudent (mystudentvue)*

## Session Context
**Session Type**: Work (UiTM)
**Current Project**: MyStudent — `/Applications/Sites/mystudentvue`
**Status**: Wrapping up
**Time**: Afternoon session, ~16:15 GMT+8

## Current Focus
- **Primary Task**: Trace where the app gets the student image it displays.
- **Technical Context**: Two separate pipelines — (1) profile avatar `currentUser.picture`, a URL field on Firestore `pelajar/{studentid}@student.uitm.edu.my`, read once at login and cached in localStorage; (2) medical-form photo, field `medicalform` on the same doc, uploaded to the UiTM CDN.
- **Progress**: Both pipelines mapped with file/line references. Read-only session — no code changed, working tree clean at `8fd446e`.

## Working Memory
### Active Context
- **Current Topic**: Origin of student imagery in the SPA.
- **Immediate Goals**: Identify the fetch site and the upstream source of the avatar.
- **Recent Progress**: Confirmed `picture` is read only in `src/services/auth.service.js:44`, cached via `localStorage.setItem('user', ...)` (line 56), hydrated by `src/store/auth.modules.js:7`, and rendered in ~15 views. Nothing in the repo writes it — students update it at `https://kad.uitm.edu.my` (per the `Gambar` blocking message at `HomePage.vue:322`).
- **Next Steps**: None pending. Nothing to commit or deploy.

### Important Decisions
- No code change made — the question was investigative and the answer did not reveal a defect.
- No CR raised: no work product this session, and the only commit since the last CR (`8fd446e`, 12-08) is already logged under `## 12-08-2026`.

## Session Recap (For AI Restart)
- **Previous Session Summary**: 2026-08-12 — fixed the Result Kolej Rayuan leak (`getResultCategory` check-order bug), committed as `update fix rayuan leak` and deployed manually.
- **Where We Left Off**: Read-only investigation of the student photo pipeline, fully answered. Repo untouched.
- **Important Context**: The avatar is a **login-time snapshot**. The whole `pelajar` doc is frozen into localStorage during `AuthService.login()`, so a photo updated at kad.uitm.edu.my will not appear until the student logs in again. Firebase Storage is not used for any student imagery — all images are external URLs.
- **User's Current State**: Asking scoped diagnostic questions about the codebase, not requesting changes.

## Session Achievements
- ✅ Located the avatar source: Firestore `pelajar/{studentid}@student.uitm.edu.my` → field `picture`
- ✅ Traced the full chain: `auth.service.js:44` → localStorage `user` → `auth.modules.js:7` → `state.auth.user.picture` → ~15 view templates
- ✅ Confirmed nothing in the repo writes `picture`; upstream source is `kad.uitm.edu.my`
- ✅ Mapped the separate medical-form image pipeline (`medicalform` field ← `POST https://api.uitm.edu.my/convid19/cdn/upload/medicalform`, `MedicalForm.vue:280/530/548`)
- ✅ Identified the stale-avatar consequence of login-time caching

## Quick Context for Next Session
- **Where We Left Off**: Investigation complete, no code touched.
- **What's Working**: Result Kolej rayuan fix from 12-08 is live; repo clean at `8fd446e`.
- **What Needs Attention**: Optional — a boot-time re-read of `picture` if stale avatars are ever reported. Still open from 12-08: re-enable Keputusan Kolej page with `rayuan_flag: false`.

---
*Session updated: 2026-08-20 16:15*
