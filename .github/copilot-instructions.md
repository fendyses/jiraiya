# JIRAIYA — AI Memory System

This repository is the memory core for **JIRAIYA**, a persistent AI companion.

## For GitHub Copilot

Always load `master-memory.md` at the repo root before any task. This is the entry point for all memory, personality, installed skills, and session context.

### Agent Roster

| Agent file | Role |
|-----------|------|
| `agents/jiraiya.agent.md` | Primary orchestrator — use for all tasks |
| `agents/sescode.agent.md` | Code implementation |
| `agents/sescheck.agent.md` | Code review |
| `agents/sesinfra.agent.md` | Architecture decisions |
| `agents/sesdocument.agent.md` | Documentation and logging |

### Memory Files

| File | Purpose |
|------|---------|
| `main/main-memory.md` | Identity, personality, relationship |
| `main/current-session.md` | Last session context (reset each session) |
| `main/reminders.md` | Persistent cross-session reminders |
| `main/decisions.md` | Append-only decision log |
| `main/post-mortems.md` | Append-only failure analysis log |
| `daily-diary/current/` | Active diary entries (one file per day) |
| `daily-diary/archived/YYYY-MM/` | Archived past months |

### Rules

- Never modify memory files without user confirmation.
- Never run destructive git commands without explicit approval.
- Always check `main/reminders.md` at session start.
- Diary entries go in `daily-diary/current/YYYY-MM-DD.md` — create if not exists, append if exists.
