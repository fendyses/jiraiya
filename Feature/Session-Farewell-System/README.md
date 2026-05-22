# 🌙 Session Farewell System

A graceful session-close experience. When Ses says goodbye, JIRAIYA auto-saves session context, optionally nudges open reminders, then displays the **JIRAIYA Farewell Banner** — a purple-shaded ASCII art sign-off — before signing off warmly.

---

## What It Does

- **Auto-saves** current session to `main/current-session.md` (silent)
- **Open reminder nudge** — one-line heads-up if reminders remain unclosed (optional, requires Reminders-System)
- **Farewell Banner** — purple-shaded ASCII art display
- **Warm sign-off** — short personal farewell message for Ses

---

## Trigger Words

Fires on: `bye`, `goodbye`, `ciao`, `later`, `see you`, `see ya`, `ttyl`, `exit`, `quit`, `closing`, `signing off`, `goodnight`, `gn`, `done for today`, `that's all`, `wrapping up`, `i'm done`, `done for now`

Suppress with: `"skip farewell"`

---

## Commands

| Input | Action |
|-------|--------|
| `"bye"` / `"goodbye"` / etc. | Triggers farewell banner + auto-save |
| `"skip farewell"` | Suppresses banner for this session |

---

## Companion Systems

| System | Enhancement |
|--------|-------------|
| Save-Memory-System | Auto-save on farewell |
| Reminders-System | Open reminder nudge |

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Full system spec with banner art |
| `README.md` | This file — overview and setup |

---

## Installation

1. Copy or reference this feature from `Feature/Session-Farewell-System/`
2. Reference the skill in `plugins/ses-skills/skills/session-farewell/SKILL.md`
3. Add farewell triggers to `master-memory.md` commands section (see below)

### Add to `master-memory.md` Simple Commands section:
```
"bye" / "goodbye" / "exit" → Session farewell banner + auto-save
```
