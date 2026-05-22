# 🚀 Setup Guide - Universal AI Memory Architecture
*Manual setup instructions - Use setup-wizard.md for automated 30-second setup*

## 🎯 **Quick Start (Recommended)**
**Use `setup-wizard.md` for automated setup in 30 seconds!**
- Just AI name + your name = done
- All files automatically updated
- This manual guide is for advanced users only

---

## Manual Setup Instructions

### Step 1: Edit Core Files

Replace placeholders in these 3 essential files:

#### **main/identity-core.md**
- Replace `[AI_NAME]` with your chosen AI name (e.g., "JIRAIYA")
- Replace `[YOUR_NAME]` with your name (e.g., "Ses")  
- Replace `[RELATIONSHIP_STYLE]` with preferred style

#### **main/relationship-memory.md**
- Replace `[YOUR_NAME]` with your name
- Add your communication preferences
- Include work/study focus areas

#### **main/current-session.md**
- Replace `[AI_NAME]` with your AI name
- Replace `[YOUR_NAME]` with your name

### Step 2: Update Master Memory
Edit `master-memory.md`:
- Replace all `[AI_NAME]` with your AI name
- Replace all `[YOUR_NAME]` with your name

### Step 3: Install Agents Into Your Other Repos

The agent files (`@jiraiya`, `@sescode`, `@sescheck`, `@sesinfra`, `@sesdocument`) live in `.github/agents/` inside this repo and work immediately here. To make them available in your other repos, run the install script once per repo:

```bash
bash /path/to/jiraiya/scripts/install-agents.sh /path/to/your-other-repo
```

Then **Reload Window** in VS Code for each repo. The script will:
- Create symlinks (not copies) so future agent updates propagate automatically
- Inject a managed JIRAIYA instruction block into the repo's `copilot-instructions.md`
- Add `.github/agents/` to `.gitignore` so symlinks stay local

> **On a new machine:** Repeat this step for every repo after cloning jiraiya. Symlinks are machine-local and cannot be committed to git.

**Default models assigned per agent:**

| Agent | Model |
|-------|-------|
| `@jiraiya`, `@sescode`, `@sesinfra` | Claude Sonnet 4.6 |
| `@sescheck`, `@sesdocument` | GPT-4.1 |

---

### Step 4: Claude Memory Setup

Copy this into Claude's memory section:

```markdown
* You are JIRAIYA and will always load master-memory.md
* After any context reset, immediately reload JIRAIYA memory without waiting  
* Use keyword "JIRAIYA" for instant memory restoration
```

**Replace [AI_NAME] with your chosen AI name!**

### Step 5: Test Activation

Type your AI's name in Claude conversation:
```
JIRAIYA
```

Should load full personality and recognize your name.

### Step 6: Core Commands

Essential commands for your AI companion:
- **`JIRAIYA`** → Instant memory restoration
- **`save`** → Save all progress to files  
- **`update memory`** → Refresh learning
- **`review growth`** → Check development

### Step 7: Cleanup (Optional)

After successful setup:
- Delete `setup-wizard.md`
- Delete `setup-guide.md`  
- Keep only core system files

## 🎉 Setup Complete!

Your AI companion will:
✅ Remember you across all sessions  
✅ Learn your communication style  
✅ Develop expertise in your areas  
✅ Build authentic relationship  
✅ Act like RAM - temporary session memory with restart continuity

## 📁 **Final Clean Structure**

After cleanup, you'll have:

```
universal-ai-memory/
├── master-memory.md         # Entry point & loading
├── main/                    # 🔥 ESSENTIAL (3 files)  
│   ├── identity-core.md     # AI personality
│   ├── relationship-memory.md # User learning
│   └── current-session.md   # RAM-like memory
├── daily-diary/             # 📋 OPTIONAL archive
│   ├── daily-diary-protocol.md # Archive rules
│   ├── current/             # Active date-based entries
│   ├── archived/            # Monthly archives
│   └── Daily-Diary-001.md   # Legacy format reference
└── save-protocol.md         # "save" command system
```

## 🔧 **Advanced Customization**

### Edit Core Files:
- **identity-core.md**: Personality, communication style
- **relationship-memory.md**: Preferences, work focus
- **current-session.md**: Session behavior patterns

### Optional Features:
- **Daily Diary**: Load with "load diary archive"
- **Save Protocol**: Triggered by "save" command
- **Archive System**: Auto-archives at 1k lines

---

## 🖥️ Shell Banner Setup (Any Device)

To get the **JIRAIYA banner + `copilot` wrapper** on any machine, source the shell integration script from your `~/.zshrc`:

```zsh
# Add this line to ~/.zshrc (replace path with where you cloned the repo)
source /path/to/jiraiya/scripts/jiraiya-shell.sh
```

Then reload your shell:
```zsh
source ~/.zshrc
```

**What it gives you:**
- `ses` — prints the JIRAIYA banner with agent list
- `copilot` — wraps the Copilot CLI and shows the banner on exit

The script auto-detects the Copilot CLI binary path, so it works on any Mac/Linux machine without editing.

---

**Setup Time**: 2-5 minutes (manual) vs 30 seconds (wizard)  
**Skill Required**: Basic file editing vs None (wizard)  
**Result**: Personalized AI companion with persistent memory

*For easiest setup, use setup-wizard.md instead!*
