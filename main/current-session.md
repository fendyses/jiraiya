# Current Session Memory - 2026-06-21
*Active working memory for current conversation*

## Session Context
**Session Type**: Feature / Infrastructure / Refactor
**Current Project**: JIRAIYA (`/Applications/Sites/jiraiya`) — dashboard → ServBay app
**Status**: Complete — committed & pushed
**Time**: 2026-06-21 ~13:24 GMT+8

## Current Focus
- **Primary Task**: Turned `agents/dashboard.php` into a real ServBay-hosted app: auth login, live system-monitor gadgets, and a maintainability file split.
- **Technical Context**: ServBay (nginx + php-fpm 8.3) serving `jiraiya.es`; Three.js 3D village + Phaser 2D layer; gadgets fed by a same-origin PHP stats endpoint.
- **Progress**: All done. Pushed to `origin/main` (HEAD `6dec29e`).

## Working Memory
### Active Context
- **Current Topic**: Login gate + live CPU/RAM/storage/network gadgets + file split
- **Immediate Goals**: None outstanding
- **Recent Progress**:
  - Signboard "by Fendy SES" repositioned (bottom/right) + font tuned
  - Removed agent-box click → stats panel; removed the fake agent terminal panels
  - Replaced 5 agent cards with 4 live monitor boxes (CPU/RAM/Storage/Network) + sparklines
  - Login system: `index.php`, `logout.php`, session-gated `agents/dashboard.php` (was `.html`)
  - Same-origin stats endpoint `agents/system-stats.php`; Python `scripts/stats-server.py` kept as optional fallback
  - Split CSS + monitors JS + Three.js village into `agents/css/dashboard.css`, `agents/js/monitors.js`, `agents/js/village3d.js` (2749 → 1395 lines)

### Important Decisions
- **Credentials**: fendy / 199254 (bcrypt hash in `index.php`; change via `php -r "echo password_hash(...)"`).
- **php-fpm PATH bug**: ServBay php-fpm strips `/usr/sbin` & `/sbin`, so `sysctl`/`netstat`/`route` failed → CPU 100%, RAM "0 KB", net 0 B/s. Fixed with `putenv('PATH=/usr/sbin:/sbin:/usr/bin:/bin:/usr/local/bin')` at top of `system-stats.php`. `df` worked because it's in `/bin`.
- Stats are now same-origin PHP (ServBay) — no separate process; Python server is fallback only.
- `village3d.js` must load AFTER the main script (reads `window._npcs` at runtime); load order preserved.

## Session Recap (For AI Restart)
- **This session (Afternoon 06-21)**: Built the dashboard's login gate + live system gadgets and refactored the monolith. Headline gotcha was a php-fpm PATH that silently broke half the metrics — diagnosed by the "storage right, rest wrong" pattern and a restricted-PATH repro, verified on live `jiraiya.es`.
- **Where We Left Off**: Everything committed & pushed. Optional next: extract the Phaser scene (~800 lines still inline) and delete the dead `#statsOverlay`/`openStatsPanel()` leftovers.
- **Note**: Site is registered in ServBay as `jiraiya.es` (nginx + PHP 8.3); keep `shell_exec` enabled or gadgets go blank.

## Session Achievements
- ✅ Signboard repositioned + font tuned
- ✅ Removed agent-box stats panel + fake terminal panels
- ✅ 4 live system-monitor gadgets (CPU/RAM/storage/network) with sparklines
- ✅ PHP login system + session-gated dashboard (html → php)
- ✅ Same-origin PHP stats endpoint + php-fpm PATH fix
- ✅ Split CSS/monitors/village into separate files (49% smaller main file)
- ✅ Committed (3 commits) and pushed to origin/main

---
*Session updated: 2026-06-21 13:24*
