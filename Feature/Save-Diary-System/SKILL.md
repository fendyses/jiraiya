---
name: save-diary
description: "MUST use when user says 'save diary', 'write diary', 'diary entry',
             'update diary', 'document session', or when a significant session
             needs to be preserved as a diary entry."
---

# Save Diary — Session Documentation Skill
*The pen touches paper. Today's story takes shape.*

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

### Step 4: Update Session Memory
- [ ] Update `main/current-session.md` with:
  - Session recap and key achievements
  - Current working state for continuity
  - Next steps identified
- [ ] Confirm diary entry saved with timestamp

### Step 5: Regenerate Dashboard Diary Snapshot (MANDATORY — never skip)
- [ ] Run `python3 daily-diary/regenerate-diary-data.py` from the repo root
- [ ] This rebuilds `daily-diary/diary-data.js` from every `current/*.md` + `archived/*/*.md` file
- [ ] Required because `agents/dashboard.html`'s in-game diary book reads only this generated snapshot, never the `.md` files directly — skipping this step leaves the book showing stale/wrong content (including old timestamps) even after the `.md` file is fixed

## Mandatory Rules
1. **Always APPEND** — never overwrite existing diary entries
2. **One file per day** — multiple entries separated by `---`
3. **Use real timestamps — never estimate or guess.** Before writing ANY `🕐 HH:MM GMT+8` or `Logged by ... ~HH:MM GMT+8` line, run the actual system clock command (`date +"%H:%M"` on bash, `Get-Date` on PowerShell, `time /T` on CMD) and use that output verbatim. Do this separately for every entry in a session — never reuse or increment a time from an earlier entry, and never write a time that is later than what the clock just returned. The laptop's clock is already Malaysia time (GMT+8), so no conversion is needed — just read it and use it.
4. **Archive first** — run monthly archive check before every write
5. **Evidence-based** — document actual session content, not generic summaries
6. **Follow existing protocol** — use `daily-diary/daily-diary-protocol.md` for entry structure
7. **Always regenerate `diary-data.js` after writing or editing any diary `.md` file** — run `python3 daily-diary/regenerate-diary-data.py`. This applies to new entries, corrections, and archival moves alike.

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
