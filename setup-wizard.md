# Setup Wizard

Follow these steps in order. Each step is short — full setup takes under 10 minutes.

---

## Step 1 — Personalize Your AI

Open Claude Code in this repo and say:

```
JIRAIYA
```

If JIRAIYA responds with a banner and brief — your memory files are already personalized. Skip to Step 2.

If not, tell Claude:

```
Update main/main-memory.md and master-memory.md — 
replace any placeholder names with "JIRAIYA" (AI name) and "[your name]" (your name).
```

Claude will edit the files and confirm.

---

## Step 2 — Add Your Repos to the Dashboard

Open `main/repos.js` and edit the `REPO_SYS` array to match your projects:

```js
const REPO_SYS = [
  // Mark your primary working repo as active:true
  { name:'Jiraiya',   langs:['md'],      note:'AI Memory Core', active:true, path:'/Applications/Sites/jiraiya' },

  // Add your other repos:
  { name:'My App',    langs:['laravel'], note:'Laravel',        path:'/Applications/Sites/myapp' },
  { name:'My Frontend', langs:['vue'],   note:'Vue SPA',        path:'/Applications/Sites/myfrontend' },
];
```

**Rules:**
- `path` must be an absolute path
- Only one repo should have `active:true` at a time
- `langs` controls the colored badges — available keys: `laravel` `vue` `angular` `php` `ts` `md` `js`

Save the file. The dashboard picks up changes on the next page refresh.

---

## Step 3 — Set Up the CLI Button (One-Time)

The green terminal button on each repo card opens a new Terminal window at that path. It needs a one-time registration:

```bash
open /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

When macOS asks *"TerminalOpener wants to control Terminal"* — click **OK**.

Done. The `jiraiya-terminal://` URL scheme is now registered on your machine. You never need to run this again (unless you get a new machine).

**Troubleshooting:**
- *"App is damaged"* — run: `xattr -cr /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app`
- *Moved the repo?* — re-register with `lsregister -f /new/path/TerminalOpener.app` (see `setup-guide.md`)

---

## Step 4 — Open the Dashboard

```bash
open /Applications/Sites/jiraiya/agents/dashboard.html
```

You should see:
- JIRAIYA and the sub-agents walking around on a game map
- The repo list on the left side
- Each repo has a **blue VS Code button** and a **green CLI button**

Test both buttons on any repo.

---

## Step 5 — Install Agents Into Your Other Repos

To use `@jiraiya`, `@sescode`, `@sescheck`, `@sesinfra`, `@sesdocument` in your other repos:

```bash
bash /Applications/Sites/jiraiya/scripts/install-agents.sh /path/to/your-repo
```

Run once per repo. For all Laravel Herd sites at once:

```bash
bash /Applications/Sites/jiraiya/scripts/install-all-herd.sh
```

Then reload VS Code in each repo — the agents will appear in Copilot.

---

## Step 6 — Shell Integration (Optional but Recommended)

Add to `~/.zshrc`:

```zsh
source /Applications/Sites/jiraiya/scripts/jiraiya-shell.sh
```

Reload:

```bash
source ~/.zshrc
```

Now type `ses` in any terminal to see the JIRAIYA banner and agent list.

---

## Step 7 — Verify Everything Works

Run through this checklist:

- [ ] Type `JIRAIYA` in Claude Code → banner prints, session brief appears
- [ ] Open `agents/dashboard.html` → sprites animate, repo list is correct
- [ ] Click VS Code button on a repo → confirm dialog → repo opens in VS Code
- [ ] Click CLI button on a repo → new Terminal window opens at that path
- [ ] Type `remind me to test reminders tomorrow` → JIRAIYA saves it to `main/reminders.md`
- [ ] Type `save diary` → diary entry written to `daily-diary/current/YYYY-MM-DD.md`
- [ ] Type `bye` → diary saved, credit usage shown, farewell delivered

---

## Step 8 — Install Optional Features (Pick What You Need)

Open the relevant install file inside `Feature/` and follow the protocol. Recommended additions:

| Priority | Feature | Why |
|----------|---------|-----|
| High | `Auto-Load-Hook-System` | JIRAIYA loads automatically on every session start — no typing needed |
| High | `Save-Diary-System` | Persistent diary with monthly archival |
| Medium | `Auto-Commit-System` | Structured git commits with session context |
| Medium | `LRU-Project-Management-System` | Smart project tracking across repos |
| Medium | `Reminders-System` | Enhanced reminder management |
| Low | `Forge-Self-Improvement-System` | AI creates new skills from patterns it detects |

Tell Claude: `"Load [feature-name]"` after navigating to the feature folder, or follow the install protocol in each feature's `README.md`.

---

## You're Done

JIRAIYA is now running. Start any Claude Code session in this repo and the system activates automatically.

Key things to remember:
- **`main/repos.js`** — edit this to manage your repo list, never touch `dashboard.html` for that
- **`bye`** — always say this to end a session properly (saves diary + credit tracker)
- **`JIRAIYA`** — type this to restore full memory at any point
- **`main/reminders.md`** — checked automatically every session start

For the full command reference: `HOW-TO-USE.md`
For troubleshooting and advanced config: `setup-guide.md`
