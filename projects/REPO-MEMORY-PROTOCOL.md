# 📁 Per-Repo Memory Protocol
*Each repository owns a folder under `projects/`. `/recall` reads it; the writer skills write into it.*

## Why
Repo memory used to live in shared global files (`main/decisions.md`, `main/reminders.md`, …) and was found by grepping the repo name. That works but mixes every repo together. This protocol gives **each repo its own folder** so recall is precise and everything for one repo lives in one place.

## Canonical slug
A repo's folder name is the **path basename**, lowercased:

| Repo (registry name) | Path | Folder |
|---|---|---|
| Nilam | /Applications/Sites/nilam | `projects/nilam/` |
| MyAlumniCard | /Applications/Sites/myalumni-angular | `projects/myalumni-angular/` |
| ican2u | /Applications/Sites/ican2u | `projects/ican2u/` |

Resolve the active repo from `main/repos.md` (`## Active Repo`), then use its path basename.

## Folder layout
```text
projects/
├── REPO-MEMORY-PROTOCOL.md      # this file
└── <repo-slug>/
    ├── README.md                # what the repo is (1 screen), path, stack, status
    ├── instruction.md           # working instructions for the repo (stack, commands, arch)
    ├── session.md               # last-session recap for THIS repo (overwritten each session)
    ├── diary.md                 # repo-scoped diary entries, newest first (append-only)
    ├── decisions.md             # non-obvious decisions for this repo (append-only)
    ├── post-mortems.md          # failures + lessons for this repo (append-only)
    ├── reminders.md             # open/completed follow-ups for this repo
    └── todo.md                  # ongoing/completed tasks for this repo
```

Create a file only when there is something to put in it; an empty section is skipped, not stubbed.

## What stays global (in `main/`)
Cross-cutting memory that is NOT about one repo:
- `main/identity-core.md`, `main/relationship-memory.md` — who JIRAIYA and Fendy are
- `main/decisions.md` — **company/JIRAIYA-level** decisions only (SES Creative, roadmap, skill architecture)
- `main/post-mortems.md` — failures not tied to a single repo
- `main/repos.md` — the repo registry + active pointer (owned by `repo-switcher`)
- `main/credit-tracker.md`, `main/todo.md` (global/unassigned tasks)

Rule of thumb: **is this about one specific app/repo?** → per-repo folder. **Is it about JIRAIYA, the company, or cross-repo process?** → `main/`.

## Read side — `/recall`
1. Resolve active repo → slug.
2. If `projects/<slug>/` exists, read its files directly (primary source).
3. Also grep the global memory core for the repo name as a **fallback** (covers repos not migrated yet, and the global daily-diary journal).

## Write side — writer skills
When a write is **repo-scoped**, target `projects/<active-slug>/…`:

| Skill | Repo-scoped target | Global target (unchanged) |
|---|---|---|
| `save-diary` | append to `projects/<slug>/diary.md` **and** overwrite `projects/<slug>/session.md`; still append to global `daily-diary/current/` journal + regenerate `diary-data.js` | — |
| `log-decision` | `projects/<slug>/decisions.md` | `main/decisions.md` for company/JIRAIYA decisions |
| `post-mortem` | `projects/<slug>/post-mortems.md` | `main/post-mortems.md` for non-repo failures |
| `check-reminders` | `projects/<slug>/reminders.md` | — |
| `todo` (dashboard) | `projects/<slug>/todo.md` | `main/todo.md` for unassigned tasks |

If no repo is active or the item isn't repo-scoped, fall back to the `main/` file.

## Diary: generated index, never a copy
The global `daily-diary/` journal is the **single source of truth** for diary content —
chronological, one copy, with tooling (`diary-data.js`, dashboard book) built on it. Do
**not** copy or split journal entries into repo folders (they are date-based and mostly
multi-repo — copying causes duplication, drift, and off-topic noise).

Instead, `projects/<slug>/diary.md` is an **auto-generated index**: for each journal day
that mentions the repo, a line with the date, entry title, one-line outcome, and a link
to the journal file. Newest first.

- Generator: `daily-diary/regenerate-repo-diaries.py` (curated repo→alias map; ambiguous
  words like `credit` that collide with JIRAIYA features are excluded to avoid false hits).
- Regenerated automatically in `save-diary` Step 5, alongside `regenerate-diary-data.py`.
- `/recall` reads the index for the list and opens a linked journal file only when the
  full text of a specific day is needed.
- The **durable, repo-specific** knowledge lives in the structured per-repo files
  (`session.md`, `decisions.md`, `post-mortems.md`, `reminders.md`, `todo.md`), which are
  authored per-repo — the diary index is just a chronological pointer layer on top.

## Dashboard (agents/)
The dashboard todo widget + `agents/todo.php` are **per-repo aware** (Option A, 2026-07-23):
- They aggregate `## Ongoing`/`## Completed` across **all** `projects/*/todo.md` plus `main/todo.md` (shown as `global`), tagging each item with its repo.
- "Add task" writes to the repo picked in the `#todoRepo` selector, defaulting to the **active repo** (`main/repos.md` → `## Active Repo`).
- Diary view (`daily-diary/diary-data.js`) and CR List (`cr.php` → `CR/*.md`) are unchanged and unaffected.

## Notes
- The global `daily-diary/` chronological journal and its tooling (`diary-data.js`, `regenerate-diary-data.py`, in-game book) stay intact. The per-repo `diary.md` is a repo-scoped mirror/digest, not a replacement for the journal.
- `Repo-instruction/<repo>.md` is superseded by `projects/<slug>/instruction.md`. Old files kept as pointers during transition.
