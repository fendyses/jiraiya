# 📖 Daily Diary Protocol
*Structured session diary with active and archived date-based entries*

## Core Philosophy

The daily diary is optional. When installed, it acts as a curated session log: concise, searchable, and designed for continuity rather than verbatim chat storage.

## Directory Structure

```text
daily-diary/
├── current/                 # Active entries for the current month
│   ├── YYYY-MM-DD.md
│   └── YYYY-MM-DD.md
├── archived/                # Previous months grouped by month
│   └── YYYY-MM/
│       ├── YYYY-MM-DD.md
│       └── YYYY-MM-DD.md
├── daily-diary-protocol.md  # This protocol
└── Daily-Diary-001.md       # Legacy numbering-based format reference
```

## Naming Rules

- **Active entries**: `daily-diary/current/YYYY-MM-DD.md`
- **Archived entries**: `daily-diary/archived/YYYY-MM/YYYY-MM-DD.md`
- **Archive boundary**: Move previous-month files out of `current/` before writing a new entry for the current month

## Entry Format

Each diary file is append-only and can contain multiple entries for the same day.

```markdown
# Session Diary - 2026-05-19

---

## 2026-05-19 (Morning - 9:30 AM) - Session Title

### Session Summary
- Type: Work
- Focus: [Primary task]
- Outcome: [Result]

### Main Topics Discussed
1. [Topic and key progress]
2. [Topic and key progress]

### Key Insights & Learning
- [What changed, was learned, or clarified]

### Looking Forward
- [Next step or follow-up]

---
```

## Write Protocol

Before writing a new entry:

1. Check `daily-diary/current/` for files from previous months.
2. For each previous-month file, create `daily-diary/archived/YYYY-MM/` if needed.
3. Move that file into the matching month folder under `archived/`.
4. Append the new entry to `daily-diary/current/YYYY-MM-DD.md`, or create the file if it does not exist yet.

## Auto-Archive Rules

- `daily-diary/current/` should contain only the current month's files.
- Previous-month entries must live under `daily-diary/archived/YYYY-MM/`.
- If a daily file grows too large for comfortable use, archive it within the same monthly structure instead of creating numbered diary files.

## Review Protocol

- **Recent recall**: Search `daily-diary/current/` first.
- **Historical recall**: Search `daily-diary/archived/` when the current month has no relevant match.
- **Continuity**: Reflect major outcomes in `main/current-session.md` when they matter for the next working session.

## Legacy Note

Older documentation referenced `Daily-Diary-001.md` and an `archive/` directory. The installed diary system now uses `current/` and `archived/` with date-based files, and those paths are the canonical structure for this repository.
