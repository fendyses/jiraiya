# Current Session Memory - 2026-09-23
*Active working memory for MyAlumniCard*

## Session Context
**Session Type**: Work — small UI change
**Current Project**: MyAlumniCard (`/Applications/Sites/myalumni-angular`) — UiTM
**Status**: Himpunan Mesra banner staged, not committed
**Time**: Morning session, diary written 09:51 GMT+8

## Current Focus
- **Primary Task**: Add Himpunan Mesra Alumni UiTM 2026 banner to home with a registration button.
- **Technical Context**: `src/app/home/home.component.html` — new `col-12` block right after the benefits `<splide>`, before the convocation card; image `https://cdn.uitm.edu.my/media/himpunan_mesra_2026.jpg`; button links to `https://alumniuitm.my/program/pendaftaran_penyertaan_himpunan/` (new tab).
- **Progress**: Done in code; not built or browser-checked.

## Working Memory
### Active Context
- **Current Topic**: Banner button styling.
- **Recent Progress**:
  - Banner placed, visible to all users (outside the convocation condition).
  - Button overlaid at `top: 81%` (gap between "PENYERTAAN" and the organiser logos), not the bottom.
  - Button colour amber `#ffc107`, dark bold text, white border.
- **Next Steps**: Visual check at phone width → commit → deploy.

### Important Decisions
- Button label English "Register Now" (matches app's other CTAs); "Daftar Sekarang" offered as an alternative.

## Session Recap (For AI Restart)
- **Where We Left Off**: Banner + amber Register Now button staged in `home.component.html`, uncommitted.
- **Important Context**: The 17 Sep semakV2 null `father_alumni_id` investigation (graduate 1335627) is still paused — needs a live semakV2 call and `gcloud auth login`.

## Session Achievements
- ✅ Himpunan Mesra 2026 banner on home
- ✅ Register Now button over the poster, opening registration in a new window
- ✅ Button recoloured for visibility

## Quick Context for Next Session
- **Where We Left Off**: Uncommitted banner change.
- **What's Working**: Image URL live (200).
- **What Needs Attention**: Build/visual check, commit + deploy; semakV2 null-ID investigation.

---
*Session updated: 2026-09-23 09:51*
