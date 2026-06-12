---
name: project-jiraiya
description: JIRAIYA AI Memory Core repo — architecture, Claude Code setup, and skill plugin system
metadata:
  type: project
---

This repo (`/Users/pairofspades/Sites/jiraiya`) is the JIRAIYA AI Memory Core — a markdown-based persistent AI companion system previously wired for GitHub Copilot, now also configured for Claude Code.

**Why:** User built this custom AI memory system and wanted Claude CLI integration alongside existing Copilot setup.

**How to apply:** When working in this repo, Claude Code auto-loads `CLAUDE.md` which tells it to read `master-memory.md` and behave as JIRAIYA. The skills in `plugins/ses-skills/skills/*/SKILL.md` are registered via `.claude/settings.json` with `"plugins": ["plugins/ses-skills"]`.

Key files:
- `CLAUDE.md` — Claude Code system instructions (equivalent of `.github/copilot-instructions.md`)
- `.claude/settings.json` — registers `plugins/ses-skills` plugin
- `master-memory.md` — JIRAIYA entry point, loaded at session start
- `main/main-memory.md` — unified identity + relationship memory
- `plugins/ses-skills/skills/` — 20 skills with YAML frontmatter for auto-discovery

The `.github/copilot-instructions.md` remains for Copilot; `CLAUDE.md` is the Claude Code equivalent.
