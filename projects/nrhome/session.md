# Current Session Memory - 2026-09-10
*Active working memory for current conversation*

## Session Context
**Session Type**: Work
**Current Project**: NRHome (`/Applications/Sites/nrhome`) — UiTM
**Status**: Wrapping up
**Time**: 2026-09-09 evening → 2026-09-10 00:50

## Current Focus
- **Primary Task**: Fix "cannot save new house", fix role display, redesign login screen
- **Technical Context**: Quasar 1.x SPA against NRent Turbo Gateway (FastAPI/Pydantic). Dev server needs `NODE_OPTIONS=--openssl-legacy-provider`, proxies `/nrent` to `https://api.uitm.edu.my`
- **Progress**: All work committed — `ae98df1`, `adf0637`, `5a60aa1`, `17536b2`. Working tree clean

## Working Memory
### Active Context
- **Current Topic**: Diary save after a long debugging + redesign session
- **Immediate Goals**: Preserve findings, log CR entries
- **Recent Progress**: Login screen finalised (single plum panel + gold accent); logo optimised 3.5MB → 18.4KB
- **Next Steps**: Report intermittent 500 to Integration Unit; verify `negeri` persisted on rumah 628

### Important Decisions
- Kept the official white MyDigitalID button instead of the gold button from Fendy's reference — brand compliance (PP24176) and his explicit "keep my button style"
- Zon Kampus / Zon left OPTIONAL on both house forms — the gateway discards them, so making them required blocks Simpan on values that are thrown away
- `negeri` made REQUIRED on both forms even though GET does not return it — it is in the write model, so data starts accumulating now
- Client-side retry added for the listing 500s as mitigation, not a cure — the server fault still needs reporting

## Session Recap (For AI Restart)
- **Previous Session Summary**: Earlier 09-09 work (is_available string fix, map pin fix, in-form image upload, form validation, UI rebuild) was already committed and CR-logged
- **Where We Left Off**: Everything committed and verified. Diary + CR being written now
- **Important Context**: The "cannot save house" bug was `field-name="files"` — the gateway wants `fail`. Every image upload had been failing, and a house without a photo is invisible to students, which is why it read as a failed save
- **User's Current State**: Satisfied with the final login design after three rejected directions; working late

## Session Achievements
- ✅ Fixed image upload — `field-name` `files` → `fail` (every upload had been 422-ing)
- ✅ Fixed role display — gateway returns booleans, `parseInt(true)` is `NaN`; single `adaPeranan()` helper
- ✅ Closed a student access-control hole in `router-not-student.js`
- ✅ Roles now persist across reload via stored `pengguna` record + one-time backfill
- ✅ Listing retry + visible error state — fixes "empty list until I refresh"
- ✅ Token refresh hardened — no longer overwrites `refresh_token` with `undefined`
- ✅ Added required Negeri dropdown (16 states) to both house forms
- ✅ Added "Tarikh kemaskini" to house cards
- ✅ EditHouse validation aligned with NewHouse (zero rates, empty jantina, named fields)
- ✅ Image now mandatory on new house; RM replaces `$`; uploader resized; Saring button restyled
- ✅ Login screen redesigned; logo optimised 99.5%
- ✅ Created and cleaned up production test records 625, 626, 627, 628
- ✅ Wrote Integration Unit brief (artifact)

## Quick Context for Next Session
- **Where We Left Off**: Diary + CR write for a clean, fully committed tree
- **What's Working**: Save house end-to-end with images; roles correct; listing self-heals on transient 500
- **What Needs Attention**: Intermittent 500 unreported; `negeri`/`zone_campus` need gateway changes; `is_varify` toggle silently discarded

---
*Session updated: 2026-09-10 00:50*
