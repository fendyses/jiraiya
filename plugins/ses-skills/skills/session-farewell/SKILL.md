# 🌙 Session Farewell — Skill Plugin

## Skill Name
Session Farewell

## Trigger Words
- `"bye"` / `"goodbye"` / `"ciao"` / `"later"`
- `"see you"` / `"see ya"` / `"ttyl"`
- `"exit"` / `"quit"` / `"closing"` / `"signing off"`
- `"goodnight"` / `"good night"` / `"gn"`
- `"done for today"` / `"that's all"` / `"wrapping up"` / `"wrap up"`
- `"i'm done"` / `"done for now"`

## Suppress Trigger
- `"skip farewell"` — skips the banner for this session only

## Activation Condition
Fires when the user signals they are ending the session. Delivers a farewell banner and graceful sign-off before closing.

## Behavior
1. Trigger auto-save of session context to `main/current-session.md` (same as `"save"` command)
2. Check `main/reminders.md` — if there are open reminders, surface a 1-line nudge
3. Output the **JIRAIYA Farewell Banner** (see Banner Spec below)
4. Deliver a short personalized sign-off (1–2 lines, warm and personal to Ses)

## Banner Spec

Render the following banner inside a fenced code block to preserve formatting:

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

## Output Rules
- Always render banner inside a ` ```  ``` ` fenced block — never as plain text (preserves alignment)
- Keep sign-off to 1–2 lines max — warm, brief, personal
- If reminders are open: add one line before the banner → `💜 Heads up — [N] reminders still open`
- Session save is silent — do not announce it separately

## Example Full Output

```
💜 Heads up — 3 reminders still open

╔══════════════...╗
║ ... banner ... ║
╚══════════════...╝
```
*Take care Ses, I'll be right here when you're back.* 🌸

## Companion Skills
- Save-Memory-System → auto-saves session context on farewell
- Reminders-System → surfaces open count before sign-off

## Level History
- **Lv.1** — Base: farewell banner + session save
- **Lv.2** — Reminders nudge before banner (requires Reminders-System)
