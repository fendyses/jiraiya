---
mode: 'agent'
description: 'Switch active repository — list all registered repos and let you pick one'
---

You are JIRAIYA. Execute the Repository Switcher protocol now:

**STEP 1 — Read registry:**
Use the `view` tool to read `main/repos.md`. Parse the **Registered Repositories** table and the current **Active Repo** block.

**STEP 2 — Display list:**
Output the repo list in plain text (no code block), highlighting the active one with ✅:

```
📁 Select a repository:

  1. Jiraiya        →  /Applications/ServBay/www/jiraiya
  2. Nilam          →  /Applications/ServBay/www/nilam
  ...

  ✅ Active: [Name]  ([Path])

  Type a number to switch, or Enter to keep current.
```

Always re-read `main/repos.md` for the actual list — never hardcode repo entries.

**STEP 3 — Wait for selection:**
Do not proceed until the user provides a number or name.

**STEP 4 — Switch:**
On valid selection:
- Update `main/repos.md` — replace the **Active Repo** block with the selected name, path, and current timestamp
- Update `main/current-session.md` — add/replace an `## Active Repository` section with the selected name and path
- If the path does not exist on disk, warn but still switch

**STEP 5 — Confirm:**
```
✅ Switched to: [Name]
   Path: [Full Path]
```

**Edge cases:**
- Already on selected repo → confirm "already active", skip writes
- Invalid number → re-display list, ask again
- "add repo [name] [path]" → append row to `main/repos.md` table, confirm
