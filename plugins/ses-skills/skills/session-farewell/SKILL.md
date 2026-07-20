---
name: session-farewell
description: "Execute the complete JIRAIYA session-closing sequence: run Save Diary, update session context, surface open reminders, display the farewell banner, and sign off warmly. Use when the user says 'bye', 'goodbye', 'see you', 'exit', 'quit', 'goodnight', 'done for today', 'wrapping up', 'that is all', 'that is all for today', or 'signing off', unless they say 'skip farewell'."
---

# 🌙 Session Farewell System

## Purpose
A graceful session-end experience that auto-saves context, surfaces any open reminders, and displays the **JIRAIYA Farewell Banner** — a purple-shaded ASCII art sign-off — whenever Ses signals they are done for the session.

---

## What It Does

When the user says goodbye, the farewell system:
1. **Run full save-diary skill** — execute ALL steps of `save-diary/SKILL.md` (Steps 1–6), including the CR log check for UiTM repos (Step 6). Do NOT skip any step. This covers diary write, session RAM update, diary-data.js regeneration, and CR prompt if applicable.
2. **Nudges open reminders** — one line if any reminders are unclosed (requires Reminders-System)
3. **Displays the JIRAIYA Farewell Banner** — run `bash /Applications/Sites/jiraiya/banner.sh` via Bash tool
4. **Signs off** with a short warm message personal to Fendy

---

## The Farewell Banner

```
╔══════════════════════════════════════════════════════╗
║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║
║▓▒░                                              ░▒▓║
║▓▒░    ░░░   ░   ░░░    ░   ░ ░ ░░░  ░░          ░▒▓║
║▓▒░   ░   ░  ░  ░   ░  ░░  ░  ░  ░  ░ ░          ░▒▓║
║▓▒░    ░░    ░  ░   ░  ░ ░ ░  ░░░   ░░           ░▒▓║
║▓▒░      ░░  ░  ░ ░ ░  ░  ░░  ░ ░  ░ ░           ░▒▓║
║▓▒░   ░░░   ░░░  ░ ░   ░   ░  ░  ░ ░  ░           ░▒▓║
║▓▒░                                              ░▒▓║
║▓▒░            ✦  J I R A I Y A  ✦               ░▒▓║
║▓▒░                 · by  S E S ·                ░▒▓║
║▓▒░                                              ░▒▓║
║▓▒░         Session saved  ·  Rest well 🌙        ░▒▓║
║▓▒░                                              ░▒▓║
║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║
╚══════════════════════════════════════════════════════╝
```

**Design Notes:**
- `▓▒░` left-to-right shading = dark purple → light purple gradient effect
- `░▒▓` right border = light → dark purple gradient (mirror)
- Inner `░` character art = JIRAIYA lettering silhouette
- `✦ J I R A I Y A ✦` = main title, spaced for impact
- `· by S E S ·` = subtitle, centered
- `Session saved · Rest well 🌙` = farewell line

---

## Trigger Words

| Trigger | Example |
|---------|---------|
| `bye` / `goodbye` | "bye JIRAIYA" |
| `see you` / `see ya` | "see you tomorrow" |
| `exit` / `quit` | "exit" |
| `goodnight` / `gn` | "goodnight" |
| `done for today` | "done for today" |
| `wrapping up` | "wrapping up now" |
| `that's all` | "that's all for today" |
| `signing off` | "signing off" |

**Suppress:** `"skip farewell"` — bypasses banner for this session only

---

## Output Sequence

```
[optional] 💜 Heads up — [N] reminders still open

[farewell banner in code block]

[1–2 line warm sign-off, personal to Ses]
```

---

## Companion Systems

| System | Enhancement |
|--------|-------------|
| **Save-Memory-System** | Auto-saves session on farewell |
| **Reminders-System** | Surfaces open reminder count before banner |

---

## Level History
- **Lv.1** — Base: farewell banner + auto-save on exit
- **Lv.2** — Reminders nudge before banner (requires Reminders-System)
- **Lv.3** — Discovery Metadata: added formal trigger-aware YAML frontmatter for reliable skill discovery. (Origin: Fendy requested metadata normalization across all skills, 2026-07-20)
- **Lv.4** — Removed automatic credit-usage display from the farewell sequence at Fendy's request.
