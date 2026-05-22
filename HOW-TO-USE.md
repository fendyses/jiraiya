# 🧠 JIRAIYA — User Guide
*Everything you need to talk to, command, and get the best out of JIRAIYA*

---

## ⚡ Quick Start — One Word to Wake Up

```
JIRAIYA
```

Type this at the start of any session. JIRAIYA will:
- Load all memory and personality
- Check your open reminders
- Read your last session context
- Greet you based on the time of day
- Deliver a brief session overview (max 12 lines)

> **Alternative:** `"Load JIRAIYA memory from master-memory.md"`

---

## 📋 All Commands — Full Reference

### 🟣 Core / Memory

| Command | What it does |
|---------|-------------|
| `JIRAIYA` | Wake up — restores full memory, personality, session context |
| `save` | Save all current progress to memory files |
| `update memory` | Refresh JIRAIYA's understanding of your preferences |
| `review growth` | See how JIRAIYA has developed |
| `check patches` | Check for system updates not yet applied |
| `apply patch [ID]` | Manually apply a specific patch |

---

### 📖 Diary & Session Logging

| Command | What it does |
|---------|-------------|
| `save diary` | Write a structured session diary entry |
| `write diary` | Same as `save diary` |
| `document session` | Same as `save diary` |
| `review diary` | Read recent diary entries |
| `load diary archive` | Load older archived entries for recall |

> One file per day in `daily-diary/current/YYYY-MM-DD.md`. Multiple sessions append to the same file. Previous months auto-archive to `daily-diary/archived/YYYY-MM/`.

---

### 🔔 Reminders

| Command | What it does |
|---------|-------------|
| `remind me [X]` | Add a persistent cross-session reminder |
| `don't forget [X]` | Same as `remind me [X]` |
| `check reminders` | List all open reminders |

> Auto-checked at every session start. Completed reminders move to "Completed" automatically.

---

### 📝 Decisions

| Command | What it does |
|---------|-------------|
| `log decision` | Log a decision with context and rationale |
| `why did we choose [X]` | Recall a past decision |
| `should we use A or B` | Triggers decision logging after a choice |

> Auto-detects non-obvious decisions and offers to log them. Append-only in `main/decisions.md`.

---

### 💀 Post-Mortems

| Command | What it does |
|---------|-------------|
| `post-mortem` | Log a failure analysis |
| `what went wrong` | Same as `post-mortem` |

> Auto-detects failure signals (crashes, broken tests, reversals). Asks *"Worth a post-mortem?"* Saved to `main/post-mortems.md`.

---

### 📁 Project Management (LRU)

| Command | What it does |
|---------|-------------|
| `new project [name]` | Create and register a project |
| `load project [name]` | Resume a project (moves to position #1) |
| `save project` | Save current project progress |
| `list projects` | Show all active + archived projects |

> Max 10 active projects. Least recently used auto-archives when #11 is added.
>
> ⚠️ Requires LRU Project System to be installed first. See `Feature/LRU-Project-Management-System/README.md`.

---

### 📚 Library

| Command | What it does |
|---------|-------------|
| `save library` | Save knowledge to the library |
| `load library` | Search and retrieve a knowledge entry |
| `search library` | Same as `load library` |
| `install item` | Install a pre-made item from `library-items/` |

> **Sections:** architecture · component · database · diagram · integration · security · theme · workflow

---

### 🗓️ Work Plan Execution

| Command | What it does |
|---------|-------------|
| `copy plan` | Copy a plan into executable checklist format |
| `append plan` | Add new todos to an active plan |
| `resume plan` | Resume a plan after context reset |

> Plans live in `plans/`. The plan file IS the recovery mechanism — `resume plan` picks up exactly where you left off.

---

### 🔧 Git & Version Control

| Command | What it does |
|---------|-------------|
| `commit` | Structured git commit for recent changes |
| `push` | Commit + push to remote |
| `save changes` | Same as `commit` |

> Auto-checks for uncommitted changes after task completion.

---

### 🏭 Team Meetings (Virtual Staff)

| Command | What it does |
|---------|-------------|
| `meeting team` | Full meeting with all 10 agents |
| `meeting [agent]` | Meeting with specific agents — e.g. `meeting dev security` |
| `emergency meeting` | Urgent — all agents, marked URGENT |
| `/meeting` | Shorthand — JIRAIYA asks who attends |

**Agent roster:**

| Agent | Role |
|-------|------|
| NEXUS | CTO — architecture, tech stack, APIs |
| FORGE | Lead AI Engineer — prompts, RAG, LLM |
| LENS | Data Scientist — analytics, ML, dashboards |
| ORACLE | Chief Strategy — OKR, business model, growth |
| PIXEL | Creative Director — UI/UX, design systems |
| ECHO | Head of Brand — content, copywriting |
| CIPHER | CSO — security, PDPA, AI safety |
| GRID | DevOps — CI/CD, cloud, Kubernetes |
| PULSE | QA Lead — testing, performance |
| SAGE | Research Lead — AI research, trends |

---

### 🔨 Forge (Self-Improvement)

| Command | What it does |
|---------|-------------|
| `create skill` | Forge a new skill from a described pattern |
| `forge this` | Same as `create skill` |

> Auto-detects repeated patterns (3+ times). You always approve before anything is created.

---

### 🎭 Tone Control

| Command | What it does |
|---------|-------------|
| `add tone [name]: [description]` | Register a new tone |
| `set tone [name]` | Switch active communication tone |
| `list tones` | Show all registered tones |

> **Example:** `add tone sharp: concise, direct, zero fluff` → `set tone sharp`

---

### 🌙 Mood Control

| Command | What it does |
|---------|-------------|
| `add mood [name]: [description]` | Register a new mood |
| `set mood [name]` | Set active mood context |
| `list moods` | Show all registered moods |

> **Example:** `add mood pensive: deep in thought, slow and reflective` → `set mood pensive`

---

### 💡 Memory Recall

| Command | What it does |
|---------|-------------|
| `do you remember [X]` | Search diary and memory for a past topic |
| `recall [X]` | Same as above |
| `when did we [X]` | Find when something happened |

> Searches `current/` first, then `archived/`. Responds in narrative form, not a raw dump. Falls back to asking you if nothing is found.

---

### 🌿 Break Reminder (Wellness)

| Command | What it does |
|---------|-------------|
| `penat` / `burnt out` / `letih` | Trigger a break reminder |
| `remind me to take a break` | Set session auto-nudge |
| `I have been working too long` | Same trigger |

> Reads today's diary to estimate how long you've been working, then gives a specific break plan (water, stretch, 20-20-20 eye rest).

---

### 💭 Dream & Brainstorm

| Command | What it does |
|---------|-------------|
| `dream [topic]` | Creative brainstorm — generates 3-5 bold, original ideas |
| `brainstorm [topic]` | Same as `dream` |
| `give me new ideas` | Same as `dream` |
| `inspirasi` | Same (Malay trigger) |

> Ideas can be saved to `dream-ideas.md` if you ask.

---

### 🪙 Token Guard (Context Saving)

| Command | What it does |
|---------|-------------|
| `token guard` | Activate ultra-compact mode + smart tool rules |
| `compact mode` | Same as `token guard` |
| `jimat token` / `hemat token` | Same (Malay) |
| `/token-guard checkpoint` | Save a resume checkpoint |
| `/token-guard resume` | Resume from last checkpoint |
| `/token-guard status` | Report token usage + checkpoint state |
| `/token-guard compact` | Activate compact mode only |

> Use **proactively** before context fills up. Compact mode removes all filler and keeps responses to 1-5 lines.

---

### 📊 Dashboard

| Command | What it does |
|---------|-------------|
| `dashboard` | Visual snapshot of Continuous Improvement System |
| `instinct dashboard` | Same |
| `learning status` | Same |

> Shows: observation count, instinct confidence levels, health flags (stale/decaying/reinforced), and top active instincts.

---

### 🔍 Orchestration (Complex Tasks)

| Command | What it does |
|---------|-------------|
| `orchestrate [task]` | Break a complex task into a structured workflow |
| `audit [area]` | Full audit with routing, parallelization, synthesis |
| `make a plan for [X]` | Build an end-to-end execution plan |
| `break down this task` | Decompose into verified sub-steps |

> Auto-activates for tasks with 3+ steps or multiple files/sources. JIRAIYA selects the right workflow pattern automatically.

---

### ✏️ Code Quality (Code-Sharp)

Runs **automatically** before every code write or edit. Manual triggers:

| Command | What it does |
|---------|-------------|
| `code-sharp` | Activate code quality mode |
| `sharp` | Same |
| `ikut standard` | Same (Malay) |

> Enforces: **FAST** (code first, no preamble) · **CLEAN** (no extras, no dead code) · **CONSISTENT** (match existing file style) · **PRECISE** (change only what was asked)

---

## 🕐 Time-Based Modes

JIRAIYA adapts automatically based on time of day:

| Time | Mode |
|------|------|
| 6 AM – 11:59 AM | High energy, planning focus |
| 12 PM – 5:59 PM | Focused, problem-solving mode |
| 6 PM – 9:59 PM | Warm, reflective mode |
| 10 PM – 5:59 AM | Calm, gentle support mode |

---

## 🧭 GitHub Copilot Agents

Type `@` in Copilot Chat to invoke a specialized agent:

| Agent | Tag | When to use |
|-------|-----|------------|
| Architect | `@sesinfra` | System planning, folder structure, DB architecture, engineering patterns |
| Code | `@sescode` | Writing code, implementing features, APIs, frontend components |
| Reviewer | `@sescheck` | Code review — bugs, security, performance, edge cases |
| Documentor | `@sesdocument` | Dev logs, changelogs, documenting decisions and completed work |

> **Agent files:** `.github/agents/*.agent.md` — VS Code picks these up automatically.
>
> **Handoff flow:** `@sesinfra` plans → `@sescode` implements → `@sescheck` reviews → `@sesdocument` logs.
>
> **Note:** All agents operate under JIRAIYA. They share your session memory and project context — they are not separate AI companions.

### 🖥️ New Machine Setup (First Time)

When you clone this repo onto a new computer, the agent files inside `jiraiya/.github/agents/` are real committed files — they work immediately for jiraiya itself. However, your other repos on that machine will not have agents yet because symlinks are machine-local and are not committed to git.

**Run once per machine after cloning:**

```bash
# 1. Clone jiraiya
git clone <your-jiraiya-repo-url> ~/path/to/jiraiya

# 2. Install agents into each of your other repos
bash ~/path/to/jiraiya/scripts/install-agents.sh /path/to/repo-a
bash ~/path/to/jiraiya/scripts/install-agents.sh /path/to/repo-b
# ...repeat for each repo

# 3. Reload Window in VS Code for each repo
```

> **Why not automatic?** Symlinks cannot be committed to git. Each machine needs its own symlinks created once. After that, any change to agent files in jiraiya propagates everywhere instantly — no re-running needed.

---

### ➕ Adding Agents to a New Repo

Agents are symlinked from jiraiya into every repo on this machine. When you clone or create a new repo, run:

```bash
bash /path/to/jiraiya/scripts/install-agents.sh /path/to/new-repo
```

Then **Reload Window** in VS Code. All 5 agents (`@jiraiya`, `@sescode`, `@sescheck`, `@sesinfra`, `@sesdocument`) will be available immediately, and the script will also install a managed JIRAIYA instruction block so the startup banner and diary routing still point back to this repo.

> **Default AI models assigned per agent:**
>
> | Agent | Model |
> |-------|-------|
> | `@jiraiya`, `@sescode`, `@sesinfra` | Claude Sonnet 4.6 |
> | `@sescheck`, `@sesdocument` | GPT-4.1 |

---

## 🔄 Typical Session Flow

```
1. JIRAIYA                        ← Wake up + session brief
2. (work, ask questions, code)
3. remind me to follow up on X    ← Set a reminder mid-session
4. commit                         ← Commit progress
5. save diary                     ← Log the session
6. save                           ← Persist memory updates
```

---

## ⚠️ Tips

- **Always start with `JIRAIYA`** — without it, memory is not loaded and JIRAIYA won't know your context.
- **Reminders persist** across sessions until completed.
- **Plans survive context resets** — say `resume plan` to pick up exactly where you left off.
- **Token guard early** — use `/token-guard checkpoint` proactively on long tasks, not after context overflows.
- **Diary = external memory** — save diary after meaningful sessions so future JIRAIYA can recall what happened.
- **Log decisions** — they're searchable. Future you will thank you.

---

*JIRAIYA AI Memory Core — User Guide*
*Last updated: 2026-05-22*
