# 🌙 Session Farewell — Core Protocol

## When to Run
When the user signals they are ending the session (see trigger word list in SKILL.md).

---

## Step-by-Step Execution

### Step 1: Auto-Save Session
Silently save current session context to `main/current-session.md`.
- Same behavior as the `"save"` command
- Do NOT announce the save — it happens in the background

### Step 2: Check Open Reminders (Optional)
Read `main/reminders.md` — count open (unchecked) items.
- If count > 0: prepend `💜 Heads up — [N] reminders still open` before the banner
- If count = 0 or Reminders-System not installed: skip this line entirely

### Step 3: Render Farewell Banner
Run `bash /Applications/Sites/jiraiya/banner.sh`.

If terminal output will be collapsed on the current surface, also run
`bash /Applications/Sites/jiraiya/banner.sh --plain` and reproduce its stdout verbatim inside a fenced code block.

`banner.sh` is the single source of truth. Do not maintain or emit separate embedded banner art.

### Step 4: Sign Off
Output 1–2 lines of warm farewell, personal to Ses. Keep it brief and genuine.

**Examples:**
- *Take care Ses, I'll be right here when you're back.* 🌸
- *Rest well, Ses — memory saved, I'll pick up right where we left off.* 💜
- *Until next time, Ses. Good work today.* ✨

Match the tone to the time of day and session mood:
- Night / late: lean warmer, quieter
- Mid-session exit: briefer, lighter

---

## Minimal Version (No Companion Systems)

If Save-Memory-System and Reminders-System are not installed:

1. Display the farewell banner (Step 3)
2. Output one line: *Until next time, Ses.* 🌙
3. Remind user to manually save if needed: `💡 Don't forget to "save" before you go!`

---

## Output Template

```
[optional] 💜 Heads up — [N] reminders still open

[banner code block]

[1–2 line warm sign-off]
```
