---
name: session-briefing
description: "Deliver the automatic startup brief by restoring the last-session recap, ongoing To Do items, project health, time context, and queued inbox work in no more than twelve lines. Use at every session start unless the user says 'skip brief', and when the user says 'brief', 'session brief', 'what did we do last time', or 'where did we leave off'."
---

# 📋 Session Briefing — Skill Plugin

## Skill Name
Session Briefing

## Trigger Words
- Session start (automatic — fires before first response)
- `"brief"`
- `"session brief"`
- `"what did we do last time"`
- `"where did we leave off"`

## Suppress Trigger
- `"skip brief"` — suppresses for this session only

## Activation Condition
Fires automatically at the start of every new conversation session, before processing the user's first message.

## Behavior
0. Resolve the active repo from `main/repos.md` → `## Active Repo` (or cwd); slug = path basename. If `projects/<slug>/` exists, prefer it for steps 1–2 (see `projects/REPO-MEMORY-PROTOCOL.md`).
1. Read `projects/<slug>/session.md` (repo recap) — else `main/current-session.md` — extract last session recap (1–2 lines)
2. Read `projects/<slug>/todo.md` then `main/todo.md` — list open items under `## Ongoing` (skip section if none)
3. Read project list — identify active project + 🔴/🟡 health flags (if LRU System installed)
4. Check current time — determine time period (if Time-based-Aware System installed)
5. Read `JIRAIYA-hub/data/inbox.json` — surface queued tasks if present; ask user which to tackle first (Lv.4)
6. Compose and deliver brief (max 12 lines) before responding to user

## Ownership Boundaries (Lv.4)
- `session-briefing` owns the automatic startup brief
- `JIRAIYA-recall` handles on-demand or deep workspace recall only
- `main/todo.md` is the source of truth for the startup To Do list (managed from the dashboard)
- `session-briefing` does not orchestrate inbox tasks — surfaces them and asks user to pick

## Output Rules
- Maximum 12 lines total
- Maximum 3 attention flags — show most critical first
- Skip any section that has nothing to report
- Deliver before processing the user's first request

## Companion Skills
- Time-based-Aware-System → time period + work suggestion
- LRU-Project-Management-System → active project + health flags
- To Do list → open items from `main/todo.md` (`## Ongoing`)

## Level History
- **Lv.1** — Base: session recap + time suggestion
- **Lv.2** — Reminders integration (requires Reminders-System)
- **Lv.3** — Project health flags (requires LRU-Project-Management-System)
- **Lv.4** — Inbox integration: reads `JIRAIYA-hub/data/inbox.json` and surfaces queued tasks in brief — asks user which to tackle first. Ownership boundaries clarified: session-briefing owns startup brief, JIRAIYA-recall owns on-demand recall, check-reminders owns reminder operations. (Origin: XJIRAIYAX operator workflow, xdaxzurairi)
- **Lv.5** — Discovery Metadata: added formal trigger-aware YAML frontmatter for reliable skill discovery. (Origin: Fendy requested metadata normalization across all skills, 2026-07-20)
