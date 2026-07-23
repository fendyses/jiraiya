---
name: recall
description: "Recall everything JIRAIYA remembers about the repository currently in use — resolve the active repo, read its per-repo memory folder `projects/<slug>/` (README, instruction, session, decisions, post-mortems, reminders, todo, diary), and fall back to a grep sweep of the global memory core for repos not yet migrated. Deliver a compact briefing. Use when the user types '/recall', 'recall repo', 'recall this repo', or asks what JIRAIYA remembers about the repo/app currently being worked on."
---

# 🧠 /recall — Active Repo Memory Recall

## Skill Name
Recall (Repo Memory Recall)

## Trigger Words
- `/recall` (primary)
- `"recall repo"` / `"recall this repo"` / `"recall project"`
- `"apa kau ingat pasal repo ni"`
- `"what do you remember about this repo"`
- `"recall"` / `"ingat semula"` / `"do you remember"` (generic deep recall)

## Ownership Boundary
- **/recall** owns all on-demand recall — repo-scoped by default, answering
  *"what do I remember about the app repo currently in use"*. When the trigger is
  generic (`"recall"`, `"ingat semula"`), resolve the repo from the active
  pointer and run the same sweep.
- **session-briefing** owns the automatic startup brief — do not duplicate it
- **master-memory.md** owns the `"JIRAIYA"` Instant Restoration Protocol
- **check-reminders** owns reminder-specific operations
- **repo-switcher** owns changing the active repo; this skill only reads it

## Activation Condition
Fires on explicit trigger. Read-only — never writes to memory files.

## Behavior

### Step 1 — Resolve the Active Repo
Determine name + path in this order (first match wins):

1. If the user passed an argument (`/recall Nilam` / `/recall /Applications/Sites/nilam`), resolve that against `main/repos.md`.
2. Read `main/repos.md` → `## Active Repo` block (Name + Path).
3. Fall back to the current working directory, matched against the registry table.

If the resolved path is not in the registry, say so plainly and offer:
`"This repo isn't registered yet — want me to 'add repo [name] [path]'?"`

If the path does not exist on disk, flag it (repo may have moved).

**Derive the slug**: the repo's folder name is its **path basename**, lowercased
(e.g. `/Applications/Sites/nilam` → `nilam`, `/Applications/Sites/myalumni-angular`
→ `myalumni-angular`). This is the per-repo memory folder `projects/<slug>/`.

### Step 2 — Read the Per-Repo Folder (primary)
If `projects/<slug>/` exists, it is the **primary source** — read it directly
instead of guessing from scattered global files:

| File | What to pull |
|------|--------------|
| `projects/<slug>/README.md` | What the repo is + current open thread |
| `projects/<slug>/instruction.md` | Working instructions (read in full if present) |
| `projects/<slug>/session.md` | Last session recap for this repo |
| `projects/<slug>/todo.md` | Open items under `## Ongoing` |
| `projects/<slug>/reminders.md` | Open/overdue reminders |
| `projects/<slug>/decisions.md` | Decisions (newest first) |
| `projects/<slug>/post-mortems.md` | Past failures + fixes |
| `projects/<slug>/diary.md` | Generated **index** of journal entries (date · title · outcome · link). Read it for the list; open a linked `daily-diary/…` file only when the user wants the full text of a specific day. |

See `projects/REPO-MEMORY-PROTOCOL.md` for the full layout.

### Step 2b — Fallback Sweep (repos not yet migrated, plus the global journal)
If `projects/<slug>/` does **not** exist, or to catch anything outside it, grep the
global memory core for the repo **name**, **aliases**, and **path basename**
(e.g. `MyAlumniCard`, `myalumni-angular`, `myalumni`). Case-insensitive.

| Source | What to pull |
|--------|--------------|
| `main/repos.md` | Registered name, path, last switch date |
| `Repo-instruction/<repo>.md` | Legacy working instructions (superseded by `projects/<slug>/instruction.md`) |
| `main/current-session.md` | Latest global session pointer |
| `daily-diary/current/*.md` | Recent journal entries mentioning this repo (last 5 hits) |
| `daily-diary/archived/**/*.md` | Older journal entries — only if `current/` yields nothing |
| `CR/*.md` | CR entries (UiTM repos only) |
| `plans/`, `library/`, `Feature/` | Saved plans or library items scoped to this repo |

Use a single recursive grep over the JIRAIYA root for the search terms rather than
opening every file, then read only the files that hit. When the per-repo folder
already answered a section, do not duplicate it from the fallback.

### Step 3 — Deliver the Recall

```
=== /recall — [Repo Name] ===
📁 [/absolute/path]  ·  [registered ✅ | unregistered ⚠️ | path missing ❌]

What it is: [1-line what the repo is, from instructions/diary]

Last session: [date] — [what was done]

Key decisions:
- [decision + date]

Open items:
- [todo / reminder]

Don't repeat: [post-mortem lesson, if any]

Next step: [suggested continuation]
```

Rules:
- **Always reply in English** — the whole `/recall` output, including prompts and
  follow-up questions. Malay trigger phrases are accepted as input, but the
  briefing itself is always English.
- **Skip empty sections silently** — never print a header with "none".
- Cap the whole output at ~15 lines; depth on request (`/recall full`).
- Always show absolute paths so they are clickable.
- Newest information first within each section.
- Quote memory as-is — do not invent context that is not in the files.
- If nothing at all is found: say plainly `"No memory about this repo yet."` and
  suggest saving a diary/decision entry after this session.

### Step 4 — Offer Next Move
If continuation is unclear, ask one short question:
`"Continue with [option A] or [option B]?"`

## Companion Skills
- `repo-switcher` → owns `main/repos.md` and the active repo pointer
- `session-briefing` → startup brief
- `save-diary` → writes the memory this skill reads back

## Level History
- **Lv.4** — Per-repo folders: recall now reads `projects/<slug>/` (slug = path basename) as the primary source, with the old name-grep sweep kept as a fallback for un-migrated repos and the global daily-diary journal. Structure defined in `projects/REPO-MEMORY-PROTOCOL.md`. (Origin: Fendy asked for a dedicated folder per repo that `/recall` reads, 2026-07-23)
- **Lv.3** — Absorbed JIRAIYA Recall: merged the `jiraiya-recall` skill into this one. That skill read only `current-session.md` + `reminders.md` — a strict subset of this sweep — while competing for the same `"recall"` trigger. Generic recall phrases now route here; the `"JIRAIYA"` Instant Restoration Protocol stays owned by `master-memory.md`. (Origin: Fendy's skill-redundancy audit, 2026-07-22)
- **Lv.2** — English output: all briefing labels, prompts and follow-up questions
  are English; Malay trigger phrases still accepted as input. (Origin: Fendy asked
  for all `/recall` replies in English, 2026-07-22)
- **Lv.1** — Base: active-repo resolution from `main/repos.md` (arg → active → cwd), memory-core sweep across registry, repo instructions, session RAM, todo, reminders, decisions, post-mortems, diary, CR and plans, compact repo-scoped briefing with skip-empty rules. (Origin: Fendy requested `/recall` for the repo currently in use, 2026-07-21)
