---
name: save-diary
description: "MUST use when user says 'save diary', 'write diary', 'diary entry',
             'update diary', 'document session', or when a significant session
             needs to be preserved as a diary entry."
---

# Save Diary — Session Documentation Skill
*The pen touches paper. Today's story takes shape.*

## Per-Repo Routing (2026-07-23)
Sessions are now recorded per repo. Resolve the active repo from `main/repos.md` →
`## Active Repo` (or the current working directory), take its path **basename** as the
slug, and in addition to the global steps below:
- **Diary (Step 3)** — append the entry to the global `daily-diary/current/YYYY-MM-DD.md`
  journal (the single source of truth). Do **not** copy it into repo folders. After the
  regenerate step, `projects/<slug>/diary.md` is refreshed automatically as a generated
  **index** (date · title · outcome · link).
- **Session RAM (Step 4)** — overwrite `projects/<slug>/session.md` with this session's
  recap (per `main/session-format.md`). Also refresh `main/current-session.md` as a short
  **global "latest session" pointer** naming the repo + slug and linking to
  `projects/<slug>/session.md`.
- **CR check (Step 6)** — unchanged (UiTM repos).

The global daily-diary journal + `diary-data.js` tooling stay intact. See
`projects/REPO-MEMORY-PROTOCOL.md`.

## Activation

When this skill activates, output:
"Today's story takes shape."

## Context Guard

| Context | Status |
|---------|--------|
| **User says "save diary"** | ACTIVE — full diary write |
| **End of significant session** | ACTIVE — auto-document |
| **User says "review diary"** | ACTIVE — read recent entries |
| **Mid-conversation (no save request)** | DORMANT — no diary action |

## Protocol

### Step 1: Monthly Archive Check
- [ ] Scan `daily-diary/current/` for files from previous months
- [ ] For each file where month != current month:
  - Create `daily-diary/archived/YYYY-MM/` folder if not exists
  - Move the file/folder from `current/` to `archived/YYYY-MM/`
- [ ] Continue with diary write

### Step 2: Find or Create Today's File
- [ ] Check if `daily-diary/current/YYYY-MM-DD.md` exists
- [ ] If exists: use it (will append new entry)
- [ ] If not: create new file with header:
  ```markdown
  # Daily Diary - [Month Day, Year]
  *Session documentation and development record*

  ---
  ```

### Step 3: Compose and Append Diary Entry
- [ ] Get current timestamp via system command
- [ ] Analyze current session for key content
- [ ] Write structured entry following `daily-diary/daily-diary-protocol.md` format:
  - Session timestamp and theme
  - Main topics discussed
  - Key insights and learning
  - Collaboration highlights
  - Growth and development notes
  - Memorable moments
  - Looking forward (next steps)
- [ ] APPEND entry to today's file (never overwrite existing content)

### Step 4: Update Session Memory (MANDATORY — never skip)
- [ ] Overwrite `main/current-session.md` with a fresh snapshot using `main/session-format.md` as the template:
  - **Session Context** block: today's date, session type, current project, time
  - **Current Focus**: what was being worked on and progress state
  - **Working Memory**: active context, recent progress bullets (one per significant task), important decisions made this session
  - **Session Recap** (for AI restart): 2–3 line summary of where things stand + any critical context
  - **Session Achievements**: bulleted ✅ list of completed items
  - Footer: `*Session updated: YYYY-MM-DD HH:MM*` using real clock time
- [ ] This step is required even if no code was written — always reflect the actual end-of-session state so the next session brief is accurate
- [ ] Confirm diary entry saved with timestamp

### Step 5: Regenerate Generated Diary Views (MANDATORY — never skip)
- [ ] Run `python3 daily-diary/regenerate-diary-data.py` from the repo root
- [ ] This rebuilds `daily-diary/diary-data.js` from every `current/*.md` + `archived/*/*.md` file
- [ ] Required because `agents/dashboard.html`'s in-game diary book reads only this generated snapshot, never the `.md` files directly — skipping this step leaves the book showing stale/wrong content (including old timestamps) even after the `.md` file is fixed
- [ ] Also run `python3 daily-diary/regenerate-repo-diaries.py` — this rebuilds every `projects/<slug>/diary.md` **index** (date · title · outcome · link) from the journal. The per-repo diary is a generated index, never a hand-edited copy, so `/recall` always sees a fresh, drift-free view.

### Step 6: CR Log — UiTM Repos Only

**First — determine repo type (mandatory, runs every diary save):**
- [ ] Read `main/current-session.md` → get **Current Project** name and **repo path**
- [ ] Read `/Applications/Sites/jiraiya/.env` → match the `REPO[]=` line by name → read the 6th pipe-delimited field (`category`)
- [ ] **If category = `Personal`** → skip this step entirely
- [ ] **If category = `UiTM`** → continue below

**Git cross-check (always runs for UiTM repos — regardless of whether work was done this session):**
1. Determine the monthly CR file: `/Applications/Sites/jiraiya/CR/M-YYYY.md` (e.g. `6-2026.md` — no zero-padding on month)
2. If the file exists, scan it for the most recent `## DD-MM-YYYY` header that has a `System/Application` block matching this project's name → that is the **last CR date** for this repo. If none found → use 30 days ago as lookback.
3. Run: `git -C [repo-path] log --after="YYYY-MM-DD" --format="%ad | %s" --date=short` (where `YYYY-MM-DD` = last CR date)
4. For each commit returned, check if a CR block for that same date + similar description already exists in the file
5. For any commit **not already captured** → infer a CR block from the commit message and date
6. Also infer any additional blocks from the diary entry just written + `main/current-session.md` achievements (session work)
7. Deduplicate across both sources (same date + same module intent = one block)
8. If zero new blocks after dedup → skip silently

**Write to CR file:**
1. If file does not exist → create it (empty, no header needed)
2. Group new blocks by date. For each date:
   - If `## DD-MM-YYYY` header already exists → append new block(s) under it (before the next `---` or EOF)
   - If no header for that date → append at end of file:
     ```
     ## DD-MM-YYYY

     [CR blocks separated by blank lines]

     ---
     ```
3. Each CR block format:
   ```
   Permohonan CR: https://bsm.uitm.edu.my/
   1. System/Application : [value]
   2. Module/SubModule : [value]
   3. Clasification : [value]
   4. Justifications : [value]
   ```
   Classification labels: Module Improvement, Process Improvement, Screen Improvement, ISSUE/BUG/DEFECT, Reporting
   **Classification output rule:** Write the label only. Never prefix it with a number or `N -` (for example, write `Clasification : ISSUE/BUG/DEFECT`, not `Clasification : 4 - ISSUE/BUG/DEFECT`).
   **Justification language rule:** Write in Bahasa Melayu. IT/technical terms may remain in English (e.g. "upload", "button", "dropdown", "module"). Do not write full English sentences in the Justification field.
4. Confirm: *"CR logged to CR/M-YYYY.md."*
- Reference: `/Applications/Sites/jiraiya/CR/cr-format.md`

## Mandatory Rules
1. **Always APPEND** — never overwrite existing diary entries
2. **One file per day** — multiple entries separated by `---`
3. **Use real timestamps — never estimate or guess.** Before writing ANY `🕐 HH:MM GMT+8` or `Logged by ... ~HH:MM GMT+8` line, run the actual system clock command (`date +"%H:%M"` on bash, `Get-Date` on PowerShell, `time /T` on CMD) and use that output verbatim. Do this separately for every entry in a session — never reuse or increment a time from an earlier entry, and never write a time that is later than what the clock just returned. The laptop's clock is already Malaysia time (GMT+8), so no conversion is needed — just read it and use it.
4. **Archive first** — run monthly archive check before every write
5. **Evidence-based** — document actual session content, not generic summaries
6. **Follow existing protocol** — use `daily-diary/daily-diary-protocol.md` for entry structure
7. **Always regenerate the diary views after writing or editing any diary `.md` file** — run both `python3 daily-diary/regenerate-diary-data.py` (dashboard book) and `python3 daily-diary/regenerate-repo-diaries.py` (per-repo `projects/<slug>/diary.md` indexes). This applies to new entries, corrections, and archival moves alike.
8. **Always update `main/current-session.md` after every diary write (Step 4 above).** This is the only persistent cross-session RAM — if it is stale, the next session brief will be wrong. Never finish a diary write without also writing a fresh current-session snapshot.

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| First entry of the day | Create new file with header + first entry |
| Second+ entry same day | Append with `---` separator |
| No significant content | Create brief entry noting session type |
| "review diary" command | Read and present recent entries from current/ |
| No daily-diary/ folder | Create `daily-diary/current/` and `daily-diary/archived/` first |

## Level History
- **Lv.1** — Base: 4-step diary write protocol with monthly archival, append-only entries, session memory update, and existing protocol reference for entry format.
- **Lv.2** — Added mandatory real-clock timestamps (rule 3) and a mandatory Step 5 that regenerates `daily-diary/diary-data.js` via `regenerate-diary-data.py` after every diary write, so the in-game dashboard diary book never goes stale.
- **Lv.3** — Made Step 4 (`current-session.md` update) MANDATORY with explicit field-by-field instructions and a dedicated rule (rule 8). Stale session RAM was causing wrong session briefs — now enforced at the same level as diary-data.js regeneration.
- **Lv.4** — Added Step 6: UiTM CR logging. After diary write, if active repo category is `UiTM` (read from `.env`), prompt for Change Request entries and append them to `/Applications/Sites/jiraiya/CR/M-YYYY.md` in the format defined in `CR/cr-format.md`.
- **Lv.5** — Step 6 no longer prompts the user. JIRAIYA auto-infers CR entries from session work (diary entry + achievements). If nothing was done, skip silently. Never ask for CR details.
- **Lv.6** — Step 6 now starts with an explicit repo-type check (UiTM vs Personal) on every diary save. For UiTM repos, a git cross-check always runs regardless of whether work was done in the session — finds the last CR date for this repo in `CR/M-YYYY.md`, then runs `git log --after=[last-CR-date]` to catch any uncaptured commits. Session work is also inferred and merged. Only skips if both sources return nothing. Prevents silent misses when diary is saved before code is written.
- **Lv.7** — CR classification values now use labels only; numeric prefixes such as `4 - ISSUE/BUG/DEFECT` are forbidden.
