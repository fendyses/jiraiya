---
name: recall
description: "Recall everything JIRAIYA remembers about the repository currently in use — resolve the active repo path, then sweep the JIRAIYA memory core (repo registry, repo instructions, current session, diary, decisions, post-mortems, reminders, todo, CR log) for entries about that repo and deliver a compact briefing. Use when the user types '/recall', 'recall repo', 'recall this repo', or asks what JIRAIYA remembers about the repo/app currently being worked on."
---

# 🧠 /recall — Active Repo Memory Recall

## Skill Name
Recall (Repo Memory Recall)

## Trigger Words
- `/recall` (primary)
- `"recall repo"` / `"recall this repo"` / `"recall project"`
- `"apa kau ingat pasal repo ni"`
- `"what do you remember about this repo"`

## Ownership Boundary
- **jiraiya-recall** owns generic deep workspace recall ("JIRAIYA", "recall")
- **/recall** is repo-scoped: it answers *"what do I remember about the app repo currently in use"*
- **session-briefing** owns the automatic startup brief — do not duplicate it
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
`"Repo ni belum register — nak aku 'add repo [name] [path]'?"`

If the path does not exist on disk, flag it (repo may have moved).

### Step 2 — Sweep the Memory Core
Search JIRAIYA memory for the repo **name**, any **aliases**, and the **path basename**
(e.g. `MyAlumniCard`, `myalumni-angular`, `myalumni`). Case-insensitive.

| Source | What to pull |
|--------|--------------|
| `main/repos.md` | Registered name, path, last switch date |
| `Repo-instruction/<repo>.md` | Repo-specific working instructions (read in full if it exists) |
| `main/current-session.md` | Last session context touching this repo |
| `main/todo.md` | Open items under `## Ongoing` tagged to this repo |
| `main/reminders.md` | Open/overdue reminders for this repo |
| `main/decisions.md` | Decisions made for this repo (newest first) |
| `main/post-mortems.md` | Past failures + fixes for this repo |
| `daily-diary/current/*.md` | Recent sessions mentioning this repo (last 5 hits) |
| `daily-diary/archived/**/*.md` | Older sessions — only if `current/` yields nothing |
| `CR/*.md` | CR entries (UiTM repos only) |
| `plans/`, `library/`, `Feature/` | Saved plans or library items scoped to this repo |

Use a single recursive grep over the JIRAIYA root for the search terms rather than
opening every file, then read only the files that hit.

### Step 3 — Deliver the Recall

```
=== /recall — [Repo Name] ===
📁 [/absolute/path]  ·  [registered ✅ | unregistered ⚠️ | path missing ❌]

Apa ini: [1-line what the repo is, from instructions/diary]

Sesi terakhir: [date] — [what was done]

Keputusan penting:
- [decision + date]

Open items:
- [todo / reminder]

Jangan ulang: [post-mortem lesson, if any]

Arah seterusnya: [suggested continuation]
```

Rules:
- **Skip empty sections silently** — never print a header with "none".
- Cap the whole output at ~15 lines; depth on request (`/recall full`).
- Always show absolute paths so they are clickable.
- Newest information first within each section.
- Quote memory as-is — do not invent context that is not in the files.
- If nothing at all is found: say plainly `"Takde memory pasal repo ni lagi."` and
  suggest saving a diary/decision entry after this session.

### Step 4 — Offer Next Move
If continuation is unclear, ask one short question:
`"Nak sambung [option A] atau [option B]?"`

## Companion Skills
- `repo-switcher` → owns `main/repos.md` and the active repo pointer
- `jiraiya-recall` → generic deep workspace recall
- `session-briefing` → startup brief
- `save-diary` → writes the memory this skill reads back

## Level History
- **Lv.1** — Base: active-repo resolution from `main/repos.md` (arg → active → cwd), memory-core sweep across registry, repo instructions, session RAM, todo, reminders, decisions, post-mortems, diary, CR and plans, compact repo-scoped briefing with skip-empty rules. (Origin: Fendy requested `/recall` for the repo currently in use, 2026-07-21)
