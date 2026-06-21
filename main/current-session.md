# Current Session Memory - 2026-06-22
*Active working memory for current conversation*

## Session Context
**Session Type**: Bug Fix / Design Discussion / Planning
**Current Project**: JIRAIYA (`/Applications/Sites/jiraiya`) — dashboard
**Status**: Dashboard complete & stable. New-worlds plan logged to todo; nothing built tonight beyond the black-screen fix.
**Time**: 2026-06-22 ~00:59 GMT+8

## Current Focus
- **Primary Task**: Fixed the Lite-mode black screen, then a long honest design discussion about giving the dashboard multiple "worlds" and how Claude could build them. Landed a roadmap, logged it.
- **Technical Context**: ServBay-hosted `jiraiya.es`; Three.js village + Phaser agents; Tailwind precompiled; Lite mode + visibility pause in place.
- **Progress**: Black screen fixed & committed by Fendy. Roadmap in `main/todo.md`. No 3D build started.

## Working Memory
### Active Context
- **Current Topic**: New-worlds roadmap (MP4 hybrid) + screenshot-harness plan
- **Immediate Goals**: None active — roadmap parked for "when in the mood to build big"
- **Recent Progress**:
  - Lite-mode black screen fixed: dropped `localStorage` persistence → every load starts Live (scene paints before any freeze). Fendy committed it.
  - Declared the dashboard complete (engineering now matches the visuals).
  - Rejected mini-game + re-adding agent card (both deliberately cut before).
  - Designed MP4-first world selector (sketch only, not built).
  - Wrote 3 world-building items to `main/todo.md`.

### Important Decisions
- **New worlds = MP4-first hybrid.** Looping MP4s (day+night, clock-crossfaded) for cheap pretty worlds with NO agents; the **3D village stays the one living world** where agents inhabit it. Selector switches between them. Video layer pauses on Lite/hidden.
- **A JPEG/AI render is concept art, not a buildable/animatable asset** — real motion needs 3D geometry or an MP4.
- **Claude's 3D bottleneck is blindness, not coding.** Fix = a screenshot harness (`preview.html` no-auth + `shot.js` headless capture) → render/screenshot/Read/adjust loop. Browser-automation MCP works but is noticeably slow (Fendy's office experience). Build the harness only when a real 3D world starts.

## Session Recap (For AI Restart)
- **This session (06-22, just past midnight)**: Fixed the Lite-mode black screen (removed persistence so it always boots Live), then a long honest planning chat about multiple dashboard "worlds." Conclusion: MP4-first hybrid — cheap day/night video worlds via a selector, with the 3D village staying the one living, agent-inhabited world. Frank discussion that Claude can build a 3D world but is slow/blind without a screenshot harness, which we'll set up when world-building actually begins. Roadmap logged to `todo.md`.
- **Where We Left Off**: Dashboard complete & stable. No code pending beyond what Fendy already committed. The worlds project is a future "big build," not active.
- **Note**: Rebuild `css/tailwind.css` after any new Tailwind class. Concept image: a ChatGPT-generated purple-castle island = north star for a future world.

## Session Achievements
- ✅ Fixed Lite-mode black-screen (no more freeze-before-first-paint)
- ✅ Honest "is it complete" assessment — dashboard declared done
- ✅ Designed the MP4-first world-selector architecture (sketch)
- ✅ Logged the new-worlds roadmap to `main/todo.md`

---
*Session updated: 2026-06-22 00:59*
