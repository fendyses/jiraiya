# Current Session Memory - 2026-06-21
*Active working memory for current conversation*

## Session Context
**Session Type**: Feature / Refactor / Performance / Polish
**Current Project**: JIRAIYA (`/Applications/Sites/jiraiya`) — dashboard hardening
**Status**: Complete — most pieces committed to `main` by Fendy; Lite mode + boot split + Tailwind rebuild still uncommitted
**Time**: 2026-06-21 ~23:59 GMT+8

## Current Focus
- **Primary Task**: A long evening pass on the dashboard — `.env` repo registry, repo-panel layout fix, console cleanup, no-audio, Tailwind precompile, visibility pause, and a Lite-mode battery toggle. Plus extracting the inline boot script.
- **Technical Context**: ServBay (nginx + php-fpm 8.3) serving `jiraiya.es`; Three.js village + Phaser layer; Tailwind now precompiled (no Play CDN).
- **Progress**: All done and lint-clean.

## Working Memory
### Active Context
- **Current Topic**: Lite mode + boot.js extraction + Tailwind rebuild caveat
- **Immediate Goals**: None outstanding
- **Recent Progress**:
  - Repos load from `/.env` (parsed in `dashboard.php` → `LANG`/`REPO_SYS`); `repos.js` deleted; `.env` gitignored + tracked `.env.example`; PHP tag colour `#00b3ff`
  - Repo panel: removed footer, synced panel height to game window via JS/ResizeObserver (fixed the black-void stretch from `items-stretch`)
  - Console: narrow `console.warn` filter (Tailwind + GLTFLoader KHR), Phaser `banner:false`, `[3D char]` log gated behind `window.JIRAIYA_DEBUG`
  - Audio: Phaser `audio:{noAudio:true}` (nothing ever played sound)
  - Tailwind precompiled → `css/tailwind.css` (v3.4.18 CLI); `vendor/tailwindcss.js` deleted
  - Perf: Three.js loop + stats poll pause when tab hidden
  - Lite mode: header `◉ LIVE/◌ LITE` toggle freezes village + Phaser, gauges stay live; `window.LiteMode` pub/sub + localStorage
  - Extracted inline boot script → `js/boot.js`

### Important Decisions
- **Precompiled Tailwind needs a rebuild for any NEW class** — `gap-7` did nothing until rebuilt. Rebuild cmd: `cd agents && npx tailwindcss@3.4.18 -c tailwind.config.js -i css/tailwind.input.css -o css/tailwind.css --minify`
- **Lite mode** composes with the tab-hidden pause: village runs only when `!hidden && !lite`.
- **Repo panel height** synced to `#game-wrap` via JS (not `items-stretch`, which stretched the game and caused the black void).

## Session Recap (For AI Restart)
- **This session (06-21, afternoon → late night)**: Big dashboard hardening pass. Externalized repos to `.env`, fixed the repo-panel layout/black-void, quieted the console, removed audio, precompiled Tailwind (dropped the Play CDN), and made it lighter on the machine — tab-hidden pause plus a header Lite-mode battery toggle that freezes the village/game while gauges stay live. Extracted the boot script into `js/boot.js`.
- **Where We Left Off**: All lint-clean. Fendy committed several pieces to `main` directly; the latest batch (Lite mode, boot.js split, Tailwind rebuild for `gap-7`) is uncommitted. Offered a `--watch` Tailwind script for future class edits.
- **Note**: After adding any new Tailwind class, REBUILD `css/tailwind.css` or it won't apply. `shell_exec` must stay enabled in ServBay PHP for gadgets.

## Session Achievements
- ✅ `.env` repository registry + parser; dead `repos.js` removed
- ✅ Repo panel height synced to game window (black-void fixed)
- ✅ Console cleanup (narrow warn filter, Phaser banner off, debug-gated logs)
- ✅ Audio disabled (Phaser noAudio)
- ✅ Tailwind precompiled; Play CDN runtime deleted
- ✅ Visibility pause (render loop + stats poll)
- ✅ Lite-mode battery toggle (freezes village + game, gauges live, persisted)
- ✅ Boot script extracted to `js/boot.js`

---
*Session updated: 2026-06-21 23:59*
