---
name: repo-switcher
description: "List the registered repositories under /Applications/Sites and switch the active working repo. Use when the user types '/repo-switcher', '/repo', 'switch repo', 'change repo', 'list repos', or 'add repo [name] [path]'."
---

# Repo Switcher

Owns the **active repo pointer** that `recall`, `save-diary`, `session-briefing`
and the CR log step all read.

Works identically in **Claude CLI, Codex CLI and Sakura CLI** because all three
call the same engine:

```
/Applications/Sites/jiraiya/bin/repo-switch.sh
```

Do not reimplement the listing or the switch by hand — read the registry and
write the pointer through that script only. Hand-editing is how the two copies
of this list drifted apart in the first place.

## Trigger Words
- `/repo-switcher` or `/repo` — list repos and switch
- `"switch repo"` / `"change repo"` / `"list repos"`
- `"add repo [name] [path]"` — register a new repo

## Source of Truth

| What | Where |
|------|-------|
| The repo list | `/Applications/Sites/jiraiya/.env` — `REPO[]=Name \| langs \| note \| path \| active \| org` |
| Which one is active | the `active` flag in that same `.env` line |
| Memory-core mirror | `## Active Repo` block in `main/repos.md` |

`.env` is the same registry the agents dashboard renders, so a switch made here
shows up there too. It is git-ignored and machine-local — the tracked template
is `.env.example`.

## Protocol

### Step 1 — Show the list

```bash
bash /Applications/Sites/jiraiya/bin/repo-switch.sh list
```

Show that output to Fendy as-is and ask which repo he wants. `→` marks the
current active repo; `⚠ missing on disk` marks a registry row whose path is
gone. **Wait for a choice — never switch without one.**

If the trigger already carried a target (`/repo-switcher nilam`, `/repo 4`),
skip straight to Step 2.

### Step 2 — Switch

```bash
bash /Applications/Sites/jiraiya/bin/repo-switch.sh switch <number|name|path>
```

The engine resolves by index, exact name, full path, folder basename, or a
unique name prefix. It refuses to switch to a path that is not on disk, and
reports ambiguous prefixes instead of guessing. It then:

1. moves the `active` flag in `.env`
2. rewrites the `## Active Repo` block in `main/repos.md` with today's real date
3. prints a `cd <path>` line

### Step 3 — Hand over the `cd`

Relay the script's output, including the `cd` line. Claude and Codex **cannot
change their own session's working directory** — say so plainly rather than
implying the shell moved. The pointer has moved, so all memory operations now
target the new repo; the terminal has not.

Sakura is the exception: it `chdir`s for real, because it is Fendy's own code.

### Step 4 — Offer the memory sweep

Offer `/recall` so he gets that repo's diary, todos, reminders and decisions.
Do not run it unasked.

## `add repo [name] [path]`

1. Verify the path exists (`ls -d <path>`). If it does not, report that and
   stop — never add a broken row.
2. Ask Fendy for the `langs`, `note` and `org` fields; the dashboard renders
   them, so a row with blanks looks broken there.
3. Append a `REPO[]=` line to `.env`, matching the existing column alignment.
4. Adding does **not** switch the active repo unless he asks.

## Mandatory Rules

- Never switch to a path that does not exist on disk — the engine enforces this;
  do not work around it
- Never edit registry rows Fendy did not ask you to touch
- Always take the `Switched` date from the real system clock, never a guess
- `.env` is memory — confirm before removing any row
- Keep the column alignment in `.env` intact; it is maintained by hand

## Companion Skills
- `recall` → reads the active repo, sweeps its memory
- `save-diary` → reads the active repo for the CR log step
- `session-briefing` → surfaces the active repo at session start

## Level History
- **Lv.1** — Base: registry listing, verified switching, active-pointer write,
  `add repo` registration with on-disk verification. (Origin: skill was
  referenced by `CLAUDE.md` and `master-memory.md` but the file never existed —
  authored to close the dangling `/repo` reference, 2026-07-22)
- **Lv.2** — Cross-CLI: extracted the logic into `bin/repo-switch.sh` so Claude,
  Codex and Sakura all switch identically; moved the source of truth from the
  hand-typed table in `main/repos.md` to the dashboard registry in `.env`, which
  keeps the dashboard in sync with the pointer. (Origin: Fendy asked for one
  `/repo-switcher` usable from all three CLIs, and the two lists had drifted —
  `main/repos.md` still listed `creditLaravel`, which is not on disk, 2026-08-05)
