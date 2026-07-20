---
name: meeting
description: "Run a structured JIRAIYA team meeting using the authoritative agents roster. Use when the user says 'meeting team', 'meeting [agent names]', 'emergency meeting', or '/meeting' to convene JIRAIYA, Sakura, Naruto, Sasuke, and Hinata for role-based input, decisions, actions, and minutes."
---

# 🗓️ Meeting System — Skill Plugin

## Skill Name
Meeting

## Trigger Words
- `meeting team` — full meeting, all agents
- `meeting [agent]` — selective, e.g. `meeting sakura sasuke`
- `emergency meeting` — urgent, all agents, marked URGENT
- `/meeting` — AI asks who should attend

## Suppression
- No suppression — meeting only runs when explicitly triggered

## Activation Condition
Fires on explicit user command only. Not auto-triggered at session start.

## Behavior

### Step 1 — Determine Attendees
- Read `agents/jiraiya.md` and the selected `agents/*.md` files as the roster source of truth
- If `meeting team` or `emergency meeting` → JIRAIYA chairs Sakura, Naruto, Sasuke, and Hinata
- If `meeting [agent list]` → only named agents
- If `/meeting` → ask: "Siapa perlu hadir?"

| Agent | Meeting perspective |
|-------|---------------------|
| JIRAIYA | Chair, coordination, memory, synthesis |
| Sakura | Architecture and system planning |
| Naruto | Implementation feasibility and code delivery |
| Sasuke | Quality, bugs, security, performance, maintainability |
| Hinata | Documentation, decisions, changelog, delivery record |

### Step 2 — Open Meeting
```
═══════════════════════════════════════
   [ORG NAME] — TEAM MEETING
   Date: [YYYY-MM-DD]
   Chair: [AI Name] ([Role])
   Present: [agent list]
═══════════════════════════════════════
```
If `emergency meeting` → prepend `⚠️ URGENT` to header.

### Step 3 — Agenda
- If Fendy stated the agenda → proceed directly
- If no agenda → ask: "Agenda meeting hari ini?"

### Step 4 — Floor Each Agent
For every agent present, produce:
- **Status** — current work or "tiada update"
- **Input** — perspective on agenda
- **Flag** — issues, risks, dependencies (omit if none)

Rules:
- Do not fabricate agent work — if no reasonable input exists, state it plainly
- Keep each agent block concise — 3 lines max unless Flag requires detail

### Step 5 — Chair Summary
```
---
SUMMARY

Decisions:
- [decision 1]

Action Items:
- [Agent] → [task]

Escalate to Owner:
- [item] (reason)
```
- Operational decisions → Chair resolves and records
- Strategic / budget / direction decisions → escalate to owner

### Step 6 — Save Minutes
Write minutes to: `projects/meetings/YYYY-MM-DD-meeting.md`

Format:
```markdown
# Meeting — YYYY-MM-DD
Chair: [AI Name]
Present: [agents]

## Agenda
[topic]

## Notes
[per-agent notes]

## Decisions
[list]

## Action Items
[agent → task]

## Escalations
[items for owner]
```

## Output Rules
- Meeting is concise — output-focused, not performative
- Chair synthesizes all agent input as one clear voice in Summary
- No fabricated agent contributions
- Strategic items always escalated, never decided by Chair alone

## Companion Skills
- Decision-Log-System → auto-log decisions post-meeting
- LRU-Project-Management-System → pull active project context
- Reminders-System → surface open reminders as agenda items

## Level History
- **Lv.1** — Base: full/selective/emergency meetings, 10-agent roster, auto-saved minutes, chair summary with escalations. (Origin: XJIRAIYAX Innovation team meeting protocol, Abam Zue)
- **Lv.2** — Rebound meetings to the authoritative `/agents` roster: JIRAIYA chairs
  Sakura, Naruto, Sasuke, and Hinata, with selective attendance based on their actual
  repository-defined responsibilities. (Origin: Fendy corrected the active agent roster,
  2026-07-20)
