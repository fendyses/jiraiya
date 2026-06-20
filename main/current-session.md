# Current Session Memory - 2026-06-20
*Active working memory for current conversation*

## Session Context
**Session Type**: Visual Polish / Feature
**Current Project**: JIRAIYA Dashboard (`/Applications/Sites/jiraiya`)
**Status**: Active
**Time**: 2026-06-20 ~21:14 GMT+8

## Current Focus
- **Primary Task**: Ongoing polish of the 3D Three.js dashboard scene in `agents/dashboard.html`
- **Technical Context**: Three.js r128 (globals via CDN) 3D village behind Phaser transparent canvas; Kenney Fantasy Town Kit GLBs; 5 walking 3D agent characters
- **Progress**: Multiple rounds of polish today — characters working, buildings scaled, river upgraded, shadows overhauled, Pomodoro removed

## Working Memory
### Active Context
- **Current Topic**: `agents/dashboard.html` — 3D scene visual polish
- **Immediate Goals**: None outstanding from last session — pending final sign-off from Fendy on current visual state
- **Recent Progress (2026-06-20)**:
  - **Early morning 01:16**: Built Three.js 3D village (gazebo, windmill, sign house "Fendy SES", red-roof house, mill with water wheel + stream). Added `agents/serve.sh`. Fixed Phaser transparency (was covering 3D). Added collision zones for characters.
  - **Afternoon 12:30**: Fixed 3D mini-character coordinate mapping (Raycaster + ground plane), walking direction (baseRY:0), drag-and-drop (DOM-level + Raycaster), Jiraiya diary click, golden trail (Three.js GLB clone with gold MeshBasicMaterial), diary date format → DD-MM-YYYY.
  - **Afternoon 16:42**: All buildings scaled 1.3× via BSCALE constant + THREE.Group wrapper. Signboard changed from "All 5 agents operational" → "Fendy SES" at 66px.
  - **Evening 18:43**: River upgraded (deep blue, foam layer, AdditiveBlending, pond ripples, sparkles). Red-roof house moved back z=-14, rotated 45° (3/4 isometric). Shadow overhaul — removed fake AO circles, added invisible box shadow-casters per building, fixed noShadow bug (lost in refactor). Removed Pomodoro timer (CSS + HTML + JS IIFE).

- **2026-06-19 (Night 23:03)**: Dashboard terminal button auto-launches `claude .` via AppleScript `do script`; CLI icon switched to real `claude-logo.svg`.

### Important Decisions
- Three.js r128 loaded as global CDN scripts (importmap ES-module approach failed due to GLTFLoader path issues)
- Phaser canvas: `transparent:true` + `setBackgroundColor('rgba(0,0,0,0)')` — opaque hex `0x00000000` was silently black
- `material.visible = false` + `mesh.visible = true` = shadow-only caster in Three.js (depth pass ignores material.visible)
- BSCALE=1.3 applied via THREE.Group wrapper — async GLB pieces scale automatically as they arrive
- Collision zones for characters are eye-matched normalized coords, labelled list at top of `GameScene.create()`

## Session Recap (For AI Restart)
- **Previous Session Summary**: 2026-06-19 (23:03) — Terminal button auto-launches claude, Claude logo icon added
- **Where We Left Off**: Evening session polished river, shadows, and removed Pomodoro. Dashboard in good visual state, not yet committed.
- **Important Context**:
  - Serve via `agents/serve.sh` (localhost:8777) — GLBs fail under `file://` (CORS)
  - All work in `agents/dashboard.html` (single file)
  - Kenney GLBs: `assets/kenney_fantasy-town-kit_2.0/Models/GLB format/`
  - Characters: 5 agent NPCs walking on 3D ground via Phaser+Three.js hybrid

## Session Achievements (2026-06-20)
- ✅ Three.js 3D village scene built and working
- ✅ Character coordinate mapping fixed (Raycaster ground intersection)
- ✅ Drag-and-drop via DOM + Raycaster
- ✅ Jiraiya diary click fixed
- ✅ Golden trail: Three.js GLB clone with gold material
- ✅ Buildings scaled 1.3× via BSCALE + Group wrapper
- ✅ Signboard → "Fendy SES"
- ✅ River fully upgraded (foam, ripples, sparkles, glow)
- ✅ Shadow overhaul (invisible box casters, noShadow bug fixed)
- ✅ Red-roof house: repositioned + 45° rotation
- ✅ Pomodoro timer removed

---
*Session updated: 2026-06-20 21:14*
