# Current Session Memory - 2026-07-21
*Active working memory for current conversation*

## Session Context
**Session Type**: JIRAIYA system maintenance
**Current Project**: Jiraiya (`/Applications/Sites/jiraiya`)
**Status**: Active — agent drift audit complete, diary saved
**Time**: 2026-07-21 00:16

## Current Focus
- **Primary Task**: Trace and repair protocol drift across JIRAIYA's instruction files
- **Technical Context**: Five instruction surfaces — `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/agents/*.agent.md`, and `agents/*.md` at repo root
- **Progress**: Both `.github/` files repaired and verified; root `agents/*.md` still unchecked

## Working Memory
### Active Context
- **Current Topic**: Agent definition drift and how agent selection works
- **Immediate Goals**: Verify the third agent-definition copy, then commit accumulated changes
- **Recent Progress**:
  - Explained agent selection — auto-routing via `description` frontmatter, explicit naming, or `delegate`; the `/agents` wizard is gone from Claude Code
  - Established that the main thread already runs the full JIRAIYA persona from `CLAUDE.md`, so there is nothing to "switch to"
  - Synced `.github/agents/jiraiya.agent.md` — banner protocol, farewell steps, team roster, delegation order
  - Investigated the Codex hypothesis and disproved it: `CLAUDE.md` and `AGENTS.md` both updated Jul 20 23:52 and agree
  - Repaired `.github/copilot-instructions.md` — removed the mandatory credit-usage step and both hardcoded ASCII banners
  - Verified no stale ANSI codes or credit references remain, and `banner.sh --plain` runs clean
- **Next Steps**: Check `agents/jiraiya.md` at repo root for the same stale farewell; commit `daily-diary/`, `main/current-session.md`, and the two `.github/` files

### Important Decisions
- `banner.sh` is the single source of truth for banner art — no instruction file may hardcode the ASCII
- Credit-tracker usage stays out of the farewell on every surface, stated explicitly rather than merely deleted
- Left `model: claude-sonnet-4-6` unchanged in `jiraiya.agent.md` — not part of the sync request
- The Sakura → Naruto → Sasuke → Hinata handoff line added to the agent file was scope creep, kept but acknowledged

## Session Recap (For AI Restart)
- **Previous Session Summary**: Fendy asked how to choose agents, which led to auditing the agent definition files and finding retired farewell protocol still live in two `.github/` files.
- **Where We Left Off**: Both `.github/` files are repaired and verified but uncommitted. The Codex/Claude sync path was proven healthy — Copilot was the only stale surface.
- **Important Context**: Instruction files have multiplied to five surfaces and only `CLAUDE.md` + `AGENTS.md` were being maintained. `agents/jiraiya.md` at repo root is a third agent-definition copy, still unverified. Earlier July 20 context — banner redesign, Hinata archive, CR cleanup, pending post-mortem — remains preserved.
- **User's Current State**: Requested a diary save after the drift repair; still has unpushed commits for cross-Mac sync.

## Session Achievements
- ✅ Explained agent selection and the removal of the `/agents` wizard
- ✅ Clarified that subagents cannot replace the main thread persona
- ✅ Synced `.github/agents/jiraiya.agent.md` with `CLAUDE.md`
- ✅ Disproved the Codex-drift hypothesis with git and timestamp evidence
- ✅ Repaired `.github/copilot-instructions.md` and removed both hardcoded banners
- ✅ Verified the repair with grep and a live `banner.sh --plain` run
- ✅ Saved the July 21 drift-audit diary entry

## Quick Context for Next Session
- **Where We Left Off**: Drift repair done on both `.github/` files, verified, not yet committed
- **What's Working**: `banner.sh` as single source of truth, `CLAUDE.md`/`AGENTS.md`/`copilot-instructions.md` now aligned, framed gradient banner with plain fallback
- **What Needs Attention**: Root `agents/jiraiya.md` unverified; five instruction surfaces may need consolidating into pointers; commits still unpushed for the other Mac

---
*Session updated: 2026-07-21 00:16*
