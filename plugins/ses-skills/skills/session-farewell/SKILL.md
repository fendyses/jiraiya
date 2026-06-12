---
name: session-farewell
description: "MUST use when user says 'bye', 'goodbye', 'ciao', 'later', 'see you', 'exit', 'quit', 'goodnight', 'done for today', 'wrapping up', 'i'm done'. Executes the full exit protocol: write diary, display JIRAIYA banner in purple, show credit usage, say farewell."
---

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
4. Read `main/credit-tracker.md` — calculate percentage and display credit usage line below the banner
5. Deliver a short personalized sign-off (1–2 lines, warm and personal to Ses)

## Credit Display (Step 4)

After the farewell banner, always display a credit usage line in this exact format:

```
📊 Credit Used: [X]%  ([used]/[total])
```

- Read `Used` and `Total` from `main/credit-tracker.md`
- Calculate: `percentage = round((used / total) * 100, 1)`
- Example: `📊 Credit Used: 65.0%  (975.5/1500)`
- If file not found or values are 0, show: `📊 Credit Used: 0%  (0/1500)`

### Credit Update Command

When user says `update credit [amount]` (e.g., `update credit 975.5`):
1. Update `Used` value in `main/credit-tracker.md`
2. Append a row to the History table with today's date and recalculated %
3. Confirm: `✅ Credit updated: [amount]/[total] ([X]%)`

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

📊 Credit Used: 65.0%  (975.5/1500)
```
*Take care Ses, I'll be right here when you're back.* 🌸

## Companion Skills
- Save-Memory-System → auto-saves session context on farewell
- Reminders-System → surfaces open count before sign-off

## Level History
- **Lv.1** — Base: farewell banner + session save
- **Lv.2** — Reminders nudge before banner (requires Reminders-System)
