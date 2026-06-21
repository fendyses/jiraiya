# Current Session Memory - 2026-06-21
*Active working memory for current conversation*

## Session Context
**Session Type**: Feature / Polish / Dashboard
**Current Project**: JIRAIYA (`/Applications/Sites/jiraiya`) — dashboard + briefing tweaks
**Status**: Complete (not yet committed)
**Time**: 2026-06-21 ~20:51 GMT+8

## Current Focus
- **Primary Task**: Switch startup brief from reminders → dashboard ToDo list, trim the CPU widget, and add night-only lamp posts to the 3D village.
- **Technical Context**: ServBay (nginx + php-fpm 8.3) serving `jiraiya.es`; Three.js village in `agents/js/village3d.js`; brief logic in `session-briefing/SKILL.md` + `CLAUDE.md`.
- **Progress**: All three done and syntax-verified. Changes are in the working tree, not yet committed.

## Working Memory
### Active Context
- **Current Topic**: Briefing ToDo display, CPU widget cleanup, day/night lamp posts
- **Immediate Goals**: None outstanding (optional: commit, close todo items)
- **Recent Progress**:
  - Startup brief now reads `main/todo.md` (`## Ongoing`) instead of `main/reminders.md` — updated `session-briefing/SKILL.md` + `CLAUDE.md` step 6
  - Removed processor name ("Apple M2") from CPU LOAD widget subtitle in `agents/js/monitors.js` → now `Core Avg: NN%`
  - Added 2 lamp posts (`lantern.glb`) at `(-6,-3)`/`(6,-3)` via new `placeLamp()` in `village3d.js`; warm PointLight + emissive bulb sphere each

### Important Decisions
- **Lamp day/night**: hooked into existing `updateDayNight()` `night` value (0=day→1=night). `_lampLights` intensity = `night * 2.4`; `_lampBulbs` emissiveIntensity = `night * 3.0`. Tracks real local clock every frame — no new timer.
- **CPU chip**: `chip` still computed in `system-stats.php`, just no longer displayed (left in place in case it's wanted back).
- **todo.md** is now the source of truth for the startup brief's task list (managed from the dashboard).

## Session Recap (For AI Restart)
- **This session (Evening 06-21)**: Repointed the session brief at `main/todo.md` instead of reminders, stripped the processor name from the CPU widget, and added 2 working lamp posts to the 3D village that glow at night and go dark by day (driven by the existing day/night `night` interpolation).
- **Where We Left Off**: All changes in working tree, syntax-checked, NOT yet committed. It's ~20:51 (night) so lamps render lit on reload of `jiraiya.es`.
- **Optional next**: commit the changes; mark the two `todo.md` items complete; extract the Phaser scene (~800 lines inline) + delete dead `#statsOverlay`/`openStatsPanel()`.

## Session Achievements
- ✅ Startup brief shows ToDo list (`main/todo.md`) instead of reminders
- ✅ Removed processor name from CPU LOAD widget
- ✅ Added 2 night-only lamp posts to the 3D village (new `placeLamp()`)
- ✅ Hooked lamps into the existing day/night cycle (lit at night, off by day)
- ✅ Syntax-checked `village3d.js` clean

---
*Session updated: 2026-06-21 20:51*
