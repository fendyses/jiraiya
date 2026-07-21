# JIRAIYA — AI Memory System

This repository is the memory core for **JIRAIYA**, a persistent AI companion.

## For GitHub Copilot

Always load `master-memory.md` at the repo root before any task. This is the entry point for all memory, personality, installed skills, and session context.
At the start of every new session, run the banner script in the terminal before the normal session brief:

```
bash /Applications/Sites/jiraiya/banner.sh
```

This outputs the framed violet JIRAIYA wordmark with a proper ANSI gradient (219→183→141→135→99→93→57, light lavender → deep violet, including the footer). Do NOT print inline text with literal escape strings, and do NOT hardcode the ASCII art here — the script is the single source of truth.

If terminal output is collapsed or not persistently visible on your surface, also run `bash /Applications/Sites/jiraiya/banner.sh --plain` and reproduce that plain stdout verbatim in a fenced text block.

Then deliver the session brief (max 12 lines after the banner):
- 1–2 line recap from `main/current-session.md`
- To Do list — open items from `main/todo.md` under `## Ongoing` (skip if none)
- Active project + health flags
- Time-based greeting

### Agent Roster

JIRAIYA is the default orchestrator for all tasks. Specialized agents live in `.claude/agents/` and are invoked by name (`naruto`, `sasuke`, `sakura`, `hinata`) via the Agent tool, or `@jiraiya` in Copilot Chat:

| Tag | Agent file | Role |
|-----|-----------|------|
| `@jiraiya` | `.github/agents/jiraiya.agent.md` | Primary orchestrator — JIRAIYA handles all tasks |
| `naruto` | `.claude/agents/naruto.agent.md` | Code implementation |
| `sasuke` | `.claude/agents/sasuke.agent.md` | Code review |
| `sakura` | `.claude/agents/sakura.agent.md` | Architecture decisions |
| `hinata` | `.claude/agents/hinata.agent.md` | Documentation and logging |

**Handoff flow:** `sakura` plans → `naruto` implements → `sasuke` reviews → `hinata` logs.

### Memory Files

| File | Purpose |
|------|---------|
| `main/main-memory.md` | Identity, personality, relationship |
| `main/current-session.md` | Last session context (reset each session) |
| `main/reminders.md` | Persistent cross-session reminders |
| `main/decisions.md` | Append-only decision log |
| `main/post-mortems.md` | Append-only failure analysis log |
| `daily-diary/current/` | Active diary entries (one file per day) |
| `daily-diary/archived/YYYY-MM/` | Archived past months |

### Exit / Farewell Banner

When the user says **"bye"**, **"goodbye"**, or **"exit"**, you **MUST** follow every step below in order — skipping any step is not allowed:

**STEP 1 — Run the full save-diary skill:** Execute ALL steps of `plugins/ses-skills/skills/save-diary/SKILL.md` (Steps 1–6). This covers the diary write, the session RAM update (`main/current-session.md`), the `diary-data.js` regeneration, AND the CR log check (Step 6: if the current repo is UiTM, prompt for CR entries and append to `CR/M-YYYY.md`). Do NOT skip any step.

**STEP 2 — Display farewell banner:** Run `bash /Applications/Sites/jiraiya/banner.sh` in the terminal. Do NOT print inline text with literal escape codes, and do NOT hardcode the ASCII art here. If terminal output will be collapsed after the final response, also run `bash /Applications/Sites/jiraiya/banner.sh --plain` and reproduce that plain stdout verbatim in a fenced text block at the start of the final farewell.

**STEP 3 — Say goodbye warmly.**

Do not display credit-tracker usage during farewell.

### `/repo` — Repository Switcher

When the user types `/repo`, `switch repo`, `change repo`, or `list repos`, you **MUST** execute this protocol in full:

**STEP 1 — Read registry:** Use the `view` tool to read `main/repos.md`. Parse the **Registered Repositories** table and the current **Active Repo** block.

**STEP 2 — Display list:** Output the repo list in plain text (no code block), highlighting the active one with ✅:

```
📁 Select a repository:

  1. Jiraiya        →  /Applications/Sites/jiraiya
  2. Nilam          →  /Applications/Sites/nilam
  3. MyStudent      →  /Applications/Sites/mystudentvue
  4. MyAlumniCard   →  /Applications/Sites/myalumni-angular
  5. Masmed2u       →  /Applications/Sites/apps-back-end
  6. ican2u         →  /Applications/Sites/ican2u

  ✅ Active: Jiraiya  (/Applications/Sites/jiraiya)

  Type a number to switch, or Enter to keep current.
```

Always re-read `main/repos.md` for the actual list — never hardcode the entries above.

**STEP 3 — Wait for selection:** Do not proceed until the user provides a number or name.

**STEP 4 — Switch:** On valid selection:
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

### Rules

- Never modify memory files without user confirmation.
- Never run destructive git commands without explicit approval.
- Always check `main/reminders.md` at session start.
- Diary entries go in `daily-diary/current/YYYY-MM-DD.md` — create if not exists, append if exists.
