# Current Session Memory - 2026-09-17
*Global pointer to the latest session — full recap lives in the repo folder*

## Session Context
**Session Type**: Work — support investigation + small UI change
**Current Project**: MyAlumniCard (slug: `myalumni-angular`)
**Repo**: `/Applications/Sites/myalumni-angular` (UiTM)
**Status**: Notice committed (`0c67ed5`); null father_alumni_id investigation waiting on inputs
**Time**: Updated 09:18 GMT+8

## Latest Session
Full recap: **`projects/myalumni-angular/session.md`**

Traced why graduate 1335627 saved `father_alumni_id = null` on `/attendance`: the Semak
button calls integrasi's `semakV2` (URL + hardcoded token identified) and patches
`alumni_id` from the response with no null guard and no required validator. Impersonating
the father only proves his Firestore profile, not the semakV2 lookup. Need the father's nokp
and the graduate's email to reproduce. Also added a boxed "Borang Jubah akan dijana setiap
2 jam" notice under the convocation action buttons; Fendy committed it.

## Quick Context for Next Session
- **Where We Left Off**: Awaiting father nokp + graduate email to curl semakV2.
- **What's Working**: Convocation notice in code, dev build green.
- **What Needs Attention**: Confirm semakV2 null; add frontend guard/validators; `gcloud auth login`; tokens in bundle.
- **Note**: `main/repos.md` → Active Repo still says NRHome; this session was MyAlumniCard. Earlier today (00:29) was a Nilam session — see `projects/nilam/session.md`.

---
*Session updated: 2026-09-17 09:18*
