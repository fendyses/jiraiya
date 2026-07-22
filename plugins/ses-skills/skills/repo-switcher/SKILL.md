---
name: repo-switcher
description: "List registered repositories, switch the active working repo, and register new repos in the JIRAIYA repo registry. Use when the user types '/repo', 'switch repo', 'change repo', 'list repos', or 'add repo [name] [path]'."
---

# Repo Switcher

Owns `main/repos.md` — the repo registry and the **Active Repo** pointer that
`recall`, `save-diary`, and the CR log step all read.

## Trigger Words
- `/repo` — list registered repos and switch
- `"switch repo"` / `"change repo"` / `"list repos"`
- `"add repo [name] [path]"` — register a new repo

## Ownership Boundary
- **This skill** is the only one that writes the Active Repo pointer
- **recall** reads the pointer; it never changes it
- **save-diary** reads the pointer to decide whether the CR log step applies

## Protocol

### Step 1 — Read the registry
Read `main/repos.md`. It holds a numbered table of registered repos and an
**Active Repo** block (Name / Path / Switched date).

### Step 2 — Branch on the request

**`/repo` with no argument** — list and ask:

```
=== Registered Repos ===
 1. Jiraiya          /Applications/Sites/jiraiya
 2. Nilam            /Applications/Sites/nilam
 ...

Active: [name] ([path]) — switched [date]

Nak switch ke mana? (nombor atau nama)
```

Wait for the choice. Do not switch without one.

**`/repo [number|name]`** — resolve directly and go to Step 3.

**`add repo [name] [path]`** — verify the path exists on disk first
(`ls -d <path>`). If it does not exist, report that and stop — do not add a
broken row. If it exists, append a row to the table with the next number and
confirm. Adding does **not** switch the active repo unless asked.

### Step 3 — Verify before switching
Confirm the target path exists on disk. A registry row is not proof — paths go
stale. If missing, tell the user which row is wrong and offer to fix it rather
than switching to nothing.

### Step 4 — Update the pointer
Rewrite the **Active Repo** block in `main/repos.md`:

```markdown
## Active Repo
- **Name**: [name]
- **Path**: [path]
- **Switched**: [YYYY-MM-DD from the real system clock]
```

Read the clock — never guess or increment the date.

### Step 5 — Note it in session context
Append a line to `main/current-session.md` recording the switch, so the next
session starts pointed at the right place.

### Step 6 — Confirm
```
Active repo → [name] ([path])
```

Then offer `/recall` if the user may want the memory sweep for that repo.

## Mandatory Rules
- Never switch to a path that does not exist on disk
- Never edit registry rows the user did not ask you to touch
- Always use the real system date for the `Switched` field
- The registry is memory — confirm before removing any row

## Companion Skills
- `recall` → reads the active repo, sweeps its memory
- `save-diary` → reads the active repo for the CR log step
- `session-briefing` → surfaces the active repo at session start

## Level History
- **Lv.1** — Base: registry listing, verified switching, active-pointer write,
  `add repo` registration with on-disk verification. (Origin: skill was
  referenced by `CLAUDE.md` and `master-memory.md` but the file never existed —
  authored to close the dangling `/repo` reference, 2026-07-22)
