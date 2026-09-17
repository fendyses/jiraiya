# Current Session Memory - 2026-09-17
*Active working memory for MyAlumniCard*

## Session Context
**Session Type**: Work — support investigation + small UI change
**Current Project**: MyAlumniCard (`/Applications/Sites/myalumni-angular`) — UiTM
**Status**: UI change committed; null-ID investigation paused waiting on two inputs from Fendy
**Time**: Morning session, diary written 09:18 GMT+8

## Current Focus
- **Primary Task**: Explain why graduate 1335627 saved `father_alumni_id = null` after adding father (alumni 1298578) on `/attendance`; add a Borang Jubah timing notice on `/convocation`.
- **Technical Context**: Angular 18, Firestore `graduates/<alumni_id>`; `/attendance` Semak button calls `GET https://api.uitm.edu.my/alumni/semakV2?nokp=<IC>&email=<graduate email>` with a hardcoded integrasi bearer token (staff 261852, exp 2027-09-26) in `src/app/attendance/attendance.component.ts`.
- **Progress**: Notice shipped (`0c67ed5`). Investigation has a clear code-path explanation but no live reproduction yet.

## Working Memory

### Active Context
- **Current Topic**: semakV2 returning `alumni_id: null` and the frontend saving it unguarded.
- **Immediate Goals**: Run the exact semakV2 request with the real father nokp + graduate email; confirm the raw response.
- **Recent Progress**:
  - Traced `check()` → `patchValue({ father_alumni_id: response.data.alumni_id })` with no null guard and no `Validators.required` on `father_alumni_id` / `mother_alumni_id`.
  - Null (not empty string) in Firestore implies the `alumni:'y', registered:'y'` branch ran with a null id from integrasi.
  - Impersonating the father only shows his Firestore profile; it does not exercise semakV2.
  - `fastapi.uitm.edu.my/alumnai/semak/id/1298578` confirms the father exists but returns no nokp/email.
  - Firestore REST read blocked: gcloud token needs `gcloud auth login`; Firebase CLI has no document get.
  - Added boxed `bg-light-primary` info card under the convocation action buttons: "Borang Jubah akan dijana setiap 2 jam selepas graduan membuat pengesahan kehadiran." Shown when `convocation.pengesahan_kehadiran` is true. Dev build passes.
- **Next Steps**: Get father nokp + graduate email from Fendy → curl semakV2 → decide integrasi fix vs frontend guard → optionally repair `graduates/1335627`.

### Important Decisions
- Do not add the frontend guard/validators yet; confirm the API behaviour first so the fix targets the real cause.
- Notice styled as a mat-card (same pattern as attendance notices) rather than plain text, per Fendy's request.
- Diary saves go through the JIRAIYA protocol; the stray `DIARY.md` created in the alumni repo was removed.

## Session Recap (For AI Restart)
- **Previous Session Summary**: 14 Sep restored `ng serve`, diagnosed split-horizon CDN images, rebuilt the admin Hot Seat table, raised CSS budget.
- **Where We Left Off**: Notice committed by Fendy (`0c67ed5`). Null father_alumni_id explained in code; waiting for the father's IC and the graduate's email to reproduce via semakV2.
- **Important Context**: semakV2 token ≠ fastapi token; both hardcoded in the public bundle. `father_alumni_id` has no validator, so a null from the API is saved silently.
- **User's Current State**: Fendy is handling a support case for graduate 1335627 and tested by impersonating the father.

## Session Achievements
- ✅ Located the exact API URL and bearer token used by the `/attendance` Semak button and decoded the token's issuer/expiry.
- ✅ Identified the unguarded `patchValue` + missing validator as the path that lets a null alumni_id reach Firestore.
- ✅ Clarified that impersonation does not test the integrasi lookup.
- ✅ Confirmed alumni 1298578 exists via fastapi.
- ✅ Shipped the Borang Jubah notice as a boxed info card (`0c67ed5`), dev build green.
- ✅ Diary saved via the JIRAIYA protocol after correction.

## Quick Context for Next Session
- **Where We Left Off**: Awaiting father nokp + graduate email to run semakV2.
- **What's Working**: Convocation notice live in code; build passes; tree clean apart from `.firebase` cache.
- **What Needs Attention**: semakV2 null-id confirmation; frontend guard + validators; `gcloud auth login`; bearer tokens in bundle; `main/repos.md` still says NRHome.

---
*Session updated: 2026-09-17 09:18*
