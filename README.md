# JIRAIYA — Persistent AI Companion System

A memory architecture for building AI companions that remember you across sessions, manage your projects, and integrate with your development workflow.

> This repo is the live memory core for **JIRAIYA** — Fendy's personal AI companion built on Claude Code.

---

## What This Is

JIRAIYA is a markdown-based memory system. Claude reads a set of `.md` files at the start of each session to restore identity, relationship context, reminders, and project state — simulating persistent memory across conversations.

It ships with a visual dashboard, sub-agent system, skill plugins, and developer tooling (VS Code + Terminal integration).

---

## Project Structure

```
jiraiya/
├── master-memory.md              # Entry point — loaded first every session
├── CLAUDE.md                     # Claude Code project instructions
├── HOW-TO-USE.md                 # Full command reference
│
├── main/                         # Core memory files
│   ├── main-memory.md            # Identity, personality, relationship
│   ├── current-session.md        # Last session context (RAM restore)
│   ├── reminders.md              # Persistent cross-session reminders
│   ├── decisions.md              # Append-only decision log
│   ├── post-mortems.md           # Append-only failure log
│   ├── credit-tracker.md         # API credit usage tracking
│   └── repos.js                  # Repo list for the dashboard (edit here)
│
├── agents/                       # Dashboard & sub-agent definitions
│   ├── dashboard.html            # Visual companion dashboard
│   ├── jiraiya.md                # Orchestrator agent definition
│   ├── naruto.md                 # Code agent
│   ├── sasuke.md                 # Reviewer agent
│   ├── sakura.md                 # Architect agent
│   ├── hinata.md                 # Documentor agent
│   └── assets/
│       └── terminalShtct/
│           └── TerminalOpener.app  # macOS app — opens Terminal at repo path
│
├── daily-diary/
│   ├── current/                  # Active entries (one file per day)
│   └── archived/YYYY-MM/         # Past months
│
├── plugins/ses-skills/skills/    # Auto-triggered skill plugins
├── Feature/                      # Optional feature extensions (30+)
├── scripts/                      # Shell scripts for agent installation
│   ├── install-agents.sh         # Install agents into other repos
│   ├── install-all-herd.sh       # Batch install for all Herd sites
│   └── jiraiya-shell.sh          # Shell banner + copilot wrapper
└── library/                      # Reusable knowledge entries
```

---

## Dashboard

Open `agents/dashboard.html` directly in any browser (no server needed).

Features:
- Live agent status display with Phaser-powered sprite animation
- Repo panel — lists all projects from `main/repos.js`
- Per-repo action buttons:
  - **VS Code button** — opens the repo folder in VS Code (`vscode://file/path`)
  - **CLI button** — opens a new Terminal window at the repo path

### Adding or Removing Repos

Edit `main/repos.js` — it's the single source of truth for the repo list:

```js
{ name:'MyProject', langs:['laravel','vue'], note:'Laravel + Vite', path:'/Applications/Sites/myproject' },
```

Available `langs` keys: `laravel`, `vue`, `angular`, `php`, `ts`, `md`, `js`

---

## CLI Button — One-Time Setup

The CLI button uses a custom URL scheme (`jiraiya-terminal://`) handled by a local AppleScript app.

**Run once:**

```bash
open /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

macOS will ask for Automation permission for Terminal — allow it. After that, the CLI button opens a new Terminal window at the repo path every time.

> The app is compiled from source on your machine so no signing issues. If you move the repo, re-register: see `setup-guide.md`.

---

## Session Start

At the start of every Claude Code session, JIRAIYA automatically:

1. Reads `master-memory.md`
2. Reads `main/main-memory.md`
3. Reads `main/current-session.md`
4. Checks `main/reminders.md`
5. Prints the JIRAIYA banner and delivers a session brief

Type `JIRAIYA` at any time to trigger a full memory restoration manually.

---

## Core Commands

| Command | Effect |
|---------|--------|
| `JIRAIYA` | Full memory restore + session brief |
| `save diary` | Write session diary entry to `daily-diary/current/YYYY-MM-DD.md` |
| `remind me [X]` | Add persistent reminder |
| `check reminders` | List open reminders |
| `log decision` | Append to `main/decisions.md` |
| `bye` | Exit protocol — saves diary, shows credit usage, farewell |

Full command reference: `HOW-TO-USE.md`

---

## Sub-Agents

Agent definitions live in `agents/` and `.github/agents/`. Install them into other repos with:

```bash
bash scripts/install-agents.sh /path/to/other-repo
```

| Agent | Role | Model |
|-------|------|-------|
| `@jiraiya` | Orchestrator | claude-sonnet-4-6 |
| `@sescode` | Code implementation | claude-sonnet-4-6 |
| `@sescheck` | Code review | claude-sonnet-4-6 |
| `@sesinfra` | Architecture | claude-sonnet-4-6 |
| `@sesdocument` | Documentation | claude-sonnet-4-6 |

---

## Shell Integration

Add to `~/.zshrc`:

```zsh
source /Applications/Sites/jiraiya/scripts/jiraiya-shell.sh
```

Gives you:
- `ses` — prints the JIRAIYA banner with agent list
- `copilot` — wraps the Copilot CLI with banner on exit

---

## Feature Extensions

30+ optional features in `Feature/`. Each has a `README.md` and install protocol.

### Tier 1 — Foundation

| Feature | What it does |
|---------|-------------|
| Memory Consolidation | Unified memory architecture |
| Skill Plugin System | Auto-triggered skills via SKILL.md |
| Auto-Load Hook | Loads JIRAIYA on Claude Code startup automatically |
| User-Prompt Hook | Per-prompt injection framework |
| Tone / Mood / Time Inject | Inject tone, mood, timestamp into every prompt |

### Tier 2 — Memory & Documentation

| Feature | What it does |
|---------|-------------|
| Save Diary | Daily session diary with monthly archival |
| Echo Memory Recall | Search past sessions |
| Reminders | Cross-session reminders with deadlines |
| Decision Log | Append-only decision record |

### Tier 3 — Project & Code

| Feature | What it does |
|---------|-------------|
| LRU Project Management | Smart project tracking, 10 active slots |
| Auto-Commit | Structured git commits |
| Work Plan Execution | Plan-to-execution tracking |
| Library | Reusable knowledge entries |
| Meeting System | Virtual team meetings with agent roles |
| Code-Sharp | Consistent code generation standard |
| Security Audit | Triage, fix, commit by severity |

### Tier 4 — Intelligence

| Feature | What it does |
|---------|-------------|
| Orchestration | Multi-step task delegation |
| Auto-Worker | Silent background task execution |
| Forge | AI creates new skills from pattern detection |
| Session Briefing | Context brief at session start |
| Post-Mortem | Failure learning log |
| Token Guard | Context overflow prevention |
| Discipline System | 7-laws behavioral standard |
| Dream Ideas | Workspace-aware ideation |
| Break Reminder | Wellness nudges |

---

## Contributors

| Contributor | Features |
|------------|---------|
| [Faiz Khairi](https://github.com/faizkhairi) | Reminders, Decision Log |
| [logando-al](https://github.com/logando-al) | Session Briefing, Post-Mortem |
| [SherlockianAsh](https://github.com/SherlockianAsh) | Observation |
| [naimkatiman](https://github.com/naimkatiman) | Mulahazah |
| [xdaxzurairi](https://github.com/xdaxzurairi) | Meeting, Orchestration, Auto-Worker, Code-Sharp, Token Guard, Discipline, Continuous Improvement, Security Audit, Dream Ideas, Break Reminder, Save Memory |
| [FendySES](https://github.com/fendyses) | Phaser dashboard with animated sprites & character auras · Dual battle system with clouds & summon events · Jiraiya sprite customisation · Sub-agent definitions (Naruto, Sasuke, Sakura, Hinata) · Repo panel with VS Code + CLI action buttons · TerminalOpener.app (custom URL scheme for macOS Terminal) · `main/repos.js` split from dashboard HTML · Animals asset pack · Company staff profiles |

---

**Version**: 6.0 — Dashboard repo buttons + TerminalOpener + repos.js split
**Created by**: Kiyoraka Ken & Alice
**Maintained by**: Saiful Effendy (Fendy)
**License**: Open Source Community Project
