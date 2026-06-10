---
name: repo-switcher
description: "MUST use when user types '/repo', '/switch repo', 'switch repo',
             'change repo', 'list repos', 'select repo', or 'which repo'.
             Displays the registered repository list and switches active working
             context to the selected repo path."
---

# Repo Switcher — Repository Context Switcher
*List registered repos and switch the active working directory with a number.*

## Activation

When this skill activates, output:

`📁 Loading repo list…`

Then execute the protocol below.

## Context Guard

| Context | Status |
|---------|--------|
| **User types `/repo`** | ACTIVE — full protocol |
| **User types `/switch repo`** | ACTIVE — full protocol |
| **User says "change repo"** | ACTIVE — full protocol |
| **Mid-conversation (no repo command)** | DORMANT — do not activate |

## Protocol

### Step 1: Load Repo Registry
- [ ] Read `main/repos.md`
- [ ] Parse the **Registered Repositories** table into a numbered list
- [ ] Note the current **Active Repo** entry

### Step 2: Display Repo List
- [ ] Output the list in this exact format (no code block, plain text):

```
📁 Select a repository:

  1. Jiraiya        →  /Applications/ServBay/www/jiraiya
  2. Nilam          →  /Applications/ServBay/www/nilam
  3. MyStudent      →  /Applications/ServBay/www/mystudentvue
  4. MyAlumniCard   →  /Applications/ServBay/www/myalumni-angular
  5. Masmed2u       →  /Applications/ServBay/www/apps-back-end
  6. Mobiliti UG    →  /Applications/ServBay/www/mobilitiug

  ✅ Active: Jiraiya  (/Applications/ServBay/www/jiraiya)

  Type a number to switch, or press Enter to keep current.
```

- [ ] Highlight (✅) the currently active repo
- [ ] Wait for user's selection

### Step 3: Handle Selection
- [ ] If user enters a **valid number** (within range): proceed to Step 4
- [ ] If user enters a **repo name** (full or partial): match it and proceed
- [ ] If user presses Enter or says "cancel" / "nevermind": abort, keep current repo, confirm no change
- [ ] If input is invalid: re-display list, ask again (max 2 retries)

### Step 4: Switch Active Repo
- [ ] Resolve full path from selection
- [ ] Update `main/repos.md` — change the **Active Repo** block:
  ```markdown
  ## Active Repo
  - **Name**: [Selected Name]
  - **Path**: [Selected Path]
  - **Switched**: [Current date/time]
  ```
- [ ] Update `main/current-session.md` — add/replace the active repo line:
  ```markdown
  ## Active Repository
  - **Repo**: [Selected Name]
  - **Path**: [Selected Path]
  ```

### Step 5: Confirm Switch
- [ ] Output confirmation:

```
✅ Switched to: [Name]
   Path: [Full Path]

   All file operations and git commands will now target this repo.
```

- [ ] If repo path doesn't exist on disk, warn:
  `⚠️  Warning: Path not found on disk — verify the path is correct.`

## Mandatory Rules

1. **Never auto-switch** — always show the list and wait for explicit user input
2. **Always update both files** — `main/repos.md` AND `main/current-session.md` on every switch
3. **Verify path existence** — warn (do not block) if the selected path doesn't exist on disk
4. **Case-insensitive name matching** — "jiraiya", "Jiraiya", "JIRAIYA" all match
5. **Repo list is source-of-truth** — always read from `main/repos.md`, never hardcode

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| **Already on selected repo** | Confirm "already active", skip file writes |
| **Path doesn't exist on disk** | Warn but still switch — path may be a remote or future repo |
| **User adds number out of range** | Show error, re-display list |
| **Empty repos.md table** | Show message: "No repos registered. Add entries to `main/repos.md`." |
| **User says "add repo [name] [path]"** | Append row to repos.md table, confirm addition |

## Adding a New Repo

When user says **"add repo [name] [path]"**:
1. Append a new row to the `main/repos.md` table with the next available number
2. Confirm: `✅ Added [Name] → [Path] as repo #[N]`

## Level History

- **Lv.1** — Base: `/repo` command, numbered list display, selection handling, active repo tracking in `main/repos.md` + `main/current-session.md`. (Origin: User request 2026-06-10)
