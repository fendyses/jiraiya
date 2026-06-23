# Current Session Memory - 2026-06-23
*Active working memory for current conversation*

## Session Context
**Session Type**: Bug Fix / UI Polish
**Current Project**: JIRAIYA dashboard (`/Applications/Sites/jiraiya`)
**Status**: Work shipped — pending live reload-and-verify.
**Time**: 2026-06-23 (afternoon, 12:34)

## Current Focus
- **Primary Task**: 3D village fixes on the agents dashboard — windmill logo swap + two overlay bugs.
- **Technical Context**: three.js 3D layer (`agents/js/village3d.js`) + Phaser 2D HUD (`agents/js/agents-scene.js`) + overlay panels (`agents/js/panels.js`). The seam between the two coordinate spaces was the source of today's bugs.
- **Progress**: All four changes applied and consistent. Not yet verified in a live browser.

## Working Memory
### Active Context
- **Current Topic**: JIRAIYA dashboard 3D village polish.
- **Immediate Goals**: Verify on Retina that the CR bubble pins onto the logo and the logo centering looks right.
- **Recent Progress**:
  - Windmill emblem: `sharingan.png` (deleted) → `uci.png` (Uchiha logo).
  - Cart-visit nametag fix: added `world3DToPhaser()`, publish `window._CART_VISIT`, `syncUI()` pins name/HP/bubble to the model while on the cart.
  - CR bubble position fix: `_bg3dProject` now returns normalized 0–1 coords; `panels.js` multiplies by CSS size — kills the devicePixelRatio halving that sent it top-left.
  - CR logo nudged right `x=-8.5 → -8.3` (signboard + `showCRBubble` anchor both updated).
- **Next Steps**: Reload dashboard, confirm bubble + centering; single-number tweaks if off.

### Important Decisions
- Normalized 0–1 coords are the standard for 3D→DOM overlays here (avoids pixel-ratio bugs).
- Logo centered at `x=-8.3` on the windmill tower.

## Session Recap (For AI Restart)
- **This session (06-23 ~12:34)**: Fixed three things on the JIRAIYA dashboard 3D village — swapped the dead `sharingan.png` windmill emblem to `uci.png`; fixed the character nametag detaching during the wheelbarrow/cart animation (2D HUD was glued to the stray logic-sprite while the 3D model hopped on the cart); and fixed the CR dialogue box landing top-left on Retina (devicePixelRatio mismatch in the 3D→screen projection). Also nudged the CR logo right to center it.
- **Where We Left Off**: All edits applied; awaiting a live reload to verify the CR bubble pins onto the logo and the centering feels right.
- **Note**: This is the JIRAIYA repo itself (the dashboard), category Personal — no CR log needed. The 2D Phaser HUD and 3D three.js layer share no coordinate space; always project explicitly and stay in normalized coords for overlays.

## Session Achievements
- ✅ Windmill emblem swapped to `uci.png`
- ✅ Cart-visit nametag now follows the 3D model onto the wheelbarrow
- ✅ CR dialogue box pins onto the logo (Retina-safe normalized projection)
- ✅ CR logo centered on the windmill tower (`x=-8.3`)
- ✅ Diary saved (2026-06-23)

---
*Session updated: 2026-06-23 12:34*
