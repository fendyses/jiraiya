---
name: repo-instructions
description: Where per-repo system instructions are stored — Repo-instruction/ folder in JIRAIYA, one file per repo/system
metadata:
  type: reference
---

Per-repo system instructions (stack, architecture, commands, conventions) are stored at:

`~/Sites/jiraiya/Repo-instruction/<repo-name>.md`

## Current files

| File | Repo | Description |
|------|------|-------------|
| `nilam.md` | `~/Sites/Nilam` | Laravel 8 MOU/MOA management system for UiTM |

## Why

Repo-level instruction files (e.g. `.github/copilot-instructions.md`) don't need to be committed to git. Keeping them in JIRAIYA means they're available in every session, version-controlled in one place, and don't pollute the target repo.

## How to apply

When starting work on a repo, check if `~/Sites/jiraiya/Repo-instruction/<repo-name>.md` exists and read it for context on stack, commands, and conventions.

When creating a new instruction file, follow the same structure as `nilam.md`.
