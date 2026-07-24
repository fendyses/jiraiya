# Setup Guide

Full manual setup for JIRAIYA. For a guided walkthrough, open `setup-wizard.md` instead.

---

## Prerequisites

- macOS (Ventura or later recommended)
- [Claude Code](https://claude.ai/code) installed
- [VS Code](https://code.visualstudio.com) installed (for the VS Code button)
- Terminal.app (built-in to macOS)

---

## Step 1 — Clone the Repo

```bash
git clone <repo-url> /Applications/Sites/jiraiya
```

Or place it wherever you like — just update all paths in `main/repos.js` and scripts accordingly.

---

## Step 2 — Personalize Core Memory Files

Edit these three files and replace the placeholder values with your own:

**`main/main-memory.md`**
- Your name, role, working style
- AI personality and tone preferences

**`main/current-session.md`**
- Your name
- AI name (JIRAIYA)

**`main/reminders.md`**
- Clear the example reminders, or leave empty

**`master-memory.md`**
- Verify your name and the AI name are correct throughout

---

## Step 3 — Configure Your Repos

Edit `main/repos.js` to list your projects:

```js
const REPO_SYS = [
  { name:'My App',  langs:['laravel','vue'], note:'Laravel + Vite', active:true, path:'/Applications/Sites/myapp' },
  { name:'Another', langs:['vue'],           note:'Vue SPA',                     path:'/Applications/Sites/another' },
];
```

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Display name in dashboard |
| `langs` | yes | Array of lang keys (see below) |
| `note` | yes | Short description |
| `path` | yes | Absolute path to the repo folder |
| `active` | no | Set `true` to highlight as current active repo |

**Available `langs` keys:** `laravel` `vue` `angular` `php` `ts` `md` `js`

To add a new lang, add an entry to the `LANG` object at the top of `main/repos.js`:
```js
const LANG = {
  // ...existing...
  react: { label:'React', color:'#61DAFB' },
};
```

---

## Step 4 — Dashboard: CLI Button Setup (One-Time)

The CLI button opens a new Terminal window at the selected repo path. It requires a local AppleScript app to be registered with macOS.

**Run once:**

```bash
open /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

macOS will prompt: *"TerminalOpener wants to control Terminal"* — click **OK**.

That's it. The `jiraiya-terminal://` URL scheme is now registered on your machine.

**If you move the repo to a different path**, re-register the app:

```bash
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f /new/path/to/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

**If you get "app is damaged" or security warning**, right-click the app → Open → Open anyway. Or:

```bash
xattr -cr /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

---

## Step 5 — Open the Dashboard

```bash
open /Applications/Sites/jiraiya/agents/dashboard.html
```

Or open it from VS Code / Finder. No server required — it runs as a local file.

**Repo panel buttons:**
- **Blue VS Code icon** — opens the repo in VS Code (shows confirm dialog first)
- **Green terminal icon** — opens a new Terminal window at the repo path

---

## Step 6 — Install Agents Into Your Other Repos

Agent files (`@jiraiya`, `@sescode`, `@sescheck`, `@sesinfra`, `@sesdocument`) are defined in `.github/agents/` of this repo. To make them available in another repo:

```bash
bash /Applications/Sites/jiraiya/scripts/install-agents.sh /path/to/your-other-repo
```

The script:
- Creates symlinks (not copies) so updates propagate automatically
- Injects a JIRAIYA instruction block into the repo's `copilot-instructions.md`
- Adds `.github/agents/` to `.gitignore` so symlinks stay local

**For all Laravel Herd sites at once:**

```bash
bash /Applications/Sites/jiraiya/scripts/install-all-herd.sh
```

> Symlinks are machine-local. On a new machine, run the install script again after cloning.

---

## Step 7 — Shell Integration (Optional)

Add to `~/.zshrc`:

```zsh
source /Applications/Sites/jiraiya/scripts/jiraiya-shell.sh
```

Then:

```bash
source ~/.zshrc
```

Gives you:
- `ses` — prints JIRAIYA banner with agent list
- `claude` — wraps the Claude Code CLI: shows the JIRAIYA banner before it loads and again after exit
- `codex` — wraps the Codex CLI the same way; automation subcommands (`mcp-server`, `app-server`, `exec-server`, `mcp`) pass straight through with no banner, since their stdout is a machine protocol
- `copilot` — wraps the Copilot CLI with banner on exit

The banner (`banner.sh`) holds on screen for ~4 seconds after printing so it doesn't flash by before the CLI takes over. This is a machine-local step — repeat it on every new machine after cloning the repo (see the note under Step 6 above).

---

## Step 8 — Test Everything

1. Open Claude Code in this repo
2. JIRAIYA should auto-load and print the banner (if Auto-Load Hook is installed)
3. Or type `JIRAIYA` manually to trigger memory restore
4. Open `agents/dashboard.html` in a browser
5. Click a VS Code button — confirm dialog appears, click OK → repo opens in VS Code
6. Click a CLI button — new Terminal window opens at that repo's path

---

## Optional Features

Install from the `Feature/` folder. Each has its own `README.md` and install protocol.

Recommended order for a new setup:

1. `Feature/Memory-Consolidation-System/` — unify memory files
2. `Feature/Skill-Plugin-System/` — enable SKILL.md auto-triggers
3. `Feature/Auto-Load-Hook-System/` — auto-load JIRAIYA on session start
4. `Feature/Save-Diary-System/` — daily session diary
5. `Feature/Reminders-System/` — cross-session reminders
6. `Feature/Auto-Commit-System/` — structured git commits

See `README.md` for the full feature list organized by tier.

---

## Rebuilding TerminalOpener.app from Source

If the app needs to be rebuilt (e.g., after an OS update or corruption):

```bash
cat > /tmp/terminal_opener.applescript << 'EOF'
on open location theURL
    set AppleScript's text item delimiters to "://"
    set thePath to item 2 of text items of theURL
    set AppleScript's text item delimiters to ""
    do shell script "open -a Terminal " & quoted form of thePath
end open location
EOF

osacompile -o /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app \
  /tmp/terminal_opener.applescript
```

Then restore the Info.plist (the compile step overwrites it):

```bash
# The Info.plist with CFBundleURLTypes is version-controlled — just do:
git checkout agents/assets/terminalShtct/TerminalOpener.app/Contents/Info.plist

# Then re-register:
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister \
  -f /Applications/Sites/jiraiya/agents/assets/terminalShtct/TerminalOpener.app
```

---

## File Reference

| File | Purpose | Edit? |
|------|---------|-------|
| `master-memory.md` | AI entry point | Yes — your name/AI name |
| `main/main-memory.md` | Identity + personality | Yes — customize fully |
| `main/current-session.md` | Session RAM | Auto-managed |
| `main/reminders.md` | Reminders list | Auto-managed |
| `main/decisions.md` | Decision log | Auto-managed (append-only) |
| `main/repos.js` | Dashboard repo list | Yes — add/remove repos here |
| `agents/dashboard.html` | Visual dashboard | Rarely — logic lives in repos.js |
| `agents/assets/terminalShtct/TerminalOpener.app` | CLI button handler | No — compiled app |
| `CLAUDE.md` | Claude Code project instructions | Only if changing protocols |
