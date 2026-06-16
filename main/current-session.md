# Current Session Memory - 2026-06-16
*Active working memory for current conversation*

## Session Context
**Session Type**: Tooling Setup
**Current Project**: JIRAIYA (`/Applications/Sites/jiraiya`)
**Status**: Active
**Time**: 2026-06-16 ~23:47 GMT+8

## Current Focus
- **Primary Task**: Wire up a local Ollama model (qwen3.5:9b) as a Claude-Code-like filesystem agent, scoped to jiraiya and other repos
- **Technical Context**: Aider (cd-and-run CLI agent) + litellm's `ollama_chat` provider, talking to the local Ollama daemon on `127.0.0.1:11434`
- **Progress**: Complete and verified — `qwen` shell function works in any repo; jiraiya auto-loads its memory files as read-only context

## Working Memory
### Active Context
- **Current Topic**: Local-LLM agentic tooling, parallel to the Claude Code workflow
- **Immediate Goals**: None outstanding — setup confirmed working end-to-end
- **Recent Progress**:
  - Installed `aider` via `pipx` (had to add Python 3.12 via brew — pipx's default 3.14 venv failed building aider's `numpy==1.24.3` dep)
  - Added `qwen` function to `~/.zshrc` (mirrors the existing `claude`/`copilot` wrapper pattern)
  - Added `jiraiya/.aider.conf.yml` (auto-loads `CLAUDE.md`, `master-memory.md`, `main/main-memory.md`) and `jiraiya/.aiderignore` (excludes `agents/assets/` — 13,939 sprite PNGs that were choking aider's repo-map)
  - Diagnosed and fixed qwen3.5's slow "thinking" mode via `--reasoning-effort none` (maps to Ollama's `think:false`)

### Important Decisions
- Claude Code's Skill/Agent/hook system is harness-specific and was explicitly NOT reimplemented for Ollama — only filesystem access + memory-file-as-context was in scope, confirmed with Fendy via clarifying question
- `qwen` wrapper defaults to `--reasoning-effort none` for speed; Fendy can override with `--reasoning-effort low/medium/high` per call for harder problems
- Ollama lifecycle clarified for Fendy: the loaded model auto-unloads after ~5 min idle (`OLLAMA_KEEP_ALIVE` controls this); the background Ollama service itself does not hibernate

## Session Recap (For AI Restart)
- **Previous Session Summary**: 2026-06-16 (earlier) — Dashboard drag-and-drop, mystudentvue/nilam fixes, JIRAIYA Guide Book PDF
- **Where We Left Off**: Ollama+aider local agentic CLI fully set up and tested; diary written
- **Important Context**:
  - Usage: `cd /path/to/any/repo && qwen` — same UX as `claude .`, backed by local qwen3.5 instead of the cloud API
  - Local inference is much slower than Claude's cloud API even with thinking disabled — hardware-bound, not a config issue

## Session Achievements
- ✅ Installed aider + compatible Python 3.12 venv via pipx
- ✅ Added `qwen` shell wrapper to `~/.zshrc`
- ✅ Added `.aider.conf.yml` + `.aiderignore` to jiraiya
- ✅ Diagnosed and fixed Ollama "thinking" mode latency
- ✅ Diagnosed and fixed repo-map slowness (sprite asset bloat)
- ✅ Verified live with real queries against the jiraiya repo
- ✅ Diary entry written

---
*Session updated: 2026-06-16*
