# Installing Sakura CLI on a New Machine

Sakura is a single-file Node.js CLI (`sakura.js`) that gives you an interactive terminal AI assistant with real file read/write/list tools, backed by three providers:

- **Gemini** — direct (`generativelanguage.googleapis.com`, via Google's OpenAI-compatible endpoint), fetched live at startup
- **Groq** — direct, fast inference (`api.groq.com`), fetched live at startup
- **OpenRouter** — free-tier models (`openrouter.ai`), fetched live at startup

It has **zero npm dependencies** — only Node's built-in `https`, `readline`, `fs`, `path`, `os` modules. No `npm install` needed.

## Prerequisites

- **Node.js 18+** (developed/tested on Node 22). Check with:
  ```
  node -v
  ```
- API keys for at least one provider:
  - **Gemini** — https://aistudio.google.com/apikey
  - **Groq** — https://console.groq.com/keys
  - **OpenRouter** — https://openrouter.ai/keys

  You only need one, but having all three gives you the full model list (Gemini's direct models + Groq's direct models + OpenRouter's free ones). A provider whose key is missing is simply skipped — Sakura still starts, just with a smaller list.

## 1. Copy the project to this exact path

```
/Applications/Sites/jiraiya/sakura/
```

This path is **hardcoded** in two places, so it must match exactly (or you'll need to edit both — see "Using a different path" below):

1. Inside `sakura.js` itself, which loads its `.env` from this absolute path:
   ```js
   const ENV = loadEnv('/Applications/Sites/jiraiya/sakura/.env');
   ```
2. The global `sakura` shim command (see step 4), which `require()`s `sakura.js` by absolute path.

Copy just `sakura.js`, `.env` (see step 2), and `.gitignore` — that's the entire project. There's no `package.json` or `node_modules/` to worry about.

## 2. Create `.env`

Create `/Applications/Sites/jiraiya/sakura/.env`:

```
GEMINI_API_KEY=your-gemini-key-here
OPENROUTER_API_KEY=your-openrouter-key-here
GROQ_API_KEY=your-groq-key-here
```

Omit whichever provider(s) you're not using. (`.gitignore` already excludes `.env` from git, so it won't get committed by accident.)

> **Don't confuse Groq with Grok.** `GROQ_API_KEY` is for **Groq** (groq.com — a fast-inference hosting company, key prefix `gsk_`). It has nothing to do with xAI's **Grok** model — Groq does not host any model actually named "grok". This has caused real confusion in this project before; the "Groq Models" section in Sakura's banner is genuinely Groq-hosted models (Llama, Qwen, GPT-OSS, etc.), not Grok.

> **Gemini key format**: keys from Google AI Studio typically start with `AQ.` or `AIza`. Sakura calls Gemini through Google's OpenAI-compatibility layer, so no separate SDK or client library is needed — just the same `Authorization: Bearer` pattern used for the other two providers.

## 3. Make it executable

```
chmod +x /Applications/Sites/jiraiya/sakura/sakura.js
```

## 4. Expose the global `sakura` command

Sakura isn't installed via `npm link` — it's a tiny shim script placed somewhere on your `PATH`. This step is shell-config-dependent, so it's broken out in full below.

### 4a. Check which shell you're using

```
echo $SHELL
```

- `/bin/zsh` → **zsh** — the default on macOS since Catalina (10.15). This is what this project was actually set up with.
- `/bin/bash` → **bash** — common on Linux and older macOS.

The rest of this step shows both; use whichever matches your `echo $SHELL` output.

### 4b. Create the shim directory and file

```
mkdir -p ~/.local/bin
```

Create a file (no extension) at `~/.local/bin/sakura` with this content:

```js
#!/usr/bin/env node
require('/Applications/Sites/jiraiya/sakura/sakura.js');
```

Then make it executable:

```
chmod +x ~/.local/bin/sakura
```

### 4c. Put `~/.local/bin` on your `PATH`

Check whether it's already there:

```
echo $PATH | tr ':' '\n' | grep local
```

If nothing prints, add it to your shell's startup file — **this is the part that differs by shell**:

**zsh** (macOS default — edit `~/.zshrc`):
```
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**bash** (edit `~/.bashrc`, or `~/.bash_profile` on macOS since Terminal.app launches bash as a login shell, which reads `.bash_profile` instead of `.bashrc` by default):
```
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

Then either re-run the `source` command above, or just close and reopen your terminal window — a *new* terminal session is required for the PATH change to take effect; it won't apply retroactively to windows already open.

### 4d. Confirm the command resolves

```
which sakura
```

Should print `/Users/<you>/.local/bin/sakura` (or wherever you put it). If it says `sakura not found`, the PATH step above didn't take — re-check 4c, and make sure you opened a fresh terminal window/tab.

## 5. Verify

Run:

```
sakura
```

You should see a live model fetch, then a wide, colorized bordered banner listing:
- Gemini models (direct via `generativelanguage.googleapis.com`), each numbered, with `★` marking which ones support real file tools (agentic/tool-calling) and `❯` marking the currently active one
- Groq models (direct via `api.groq.com`), same markers
- OpenRouter free models, same markers
- A commands list at the bottom

If you see `[Sakura] Warning: GEMINI_API_KEY missing` (or the equivalent for Groq/OpenRouter), that provider's key isn't set — Sakura still runs, just with fewer models. If **all three** keys are missing, it exits immediately with an error.

## Usage quick reference

- `sakura` — launch the interactive CLI
- `models` — open the arrow-key picker (↑/↓ to move, Enter to select, Esc to cancel) — renders as the same bordered box as the startup banner
- `model <n>` — switch directly by number, e.g. `model 2`
- `model <id>` — switch directly by model id
- `list` — show what's been loaded into context via `load`/`@file`
- `clear` — reset chat history
- `exit` / `quit` / `bye` — quit
- `load <path>` — manually load a file or folder into context (extension-whitelisted, capped in size)
- `@/path/to/file your message` — attach a file inline with your message (only works if already `load`ed, or the folder is added to `~/.sakura/config.json`'s `trusted_folders`)

**Real agentic file access** (no `load`/`@` needed): just ask directly — e.g. *"read package.json"*, *"list the files in this folder"*, *"create a notes.txt with..."*. Sakura will call real `read_file`/`write_file`/`list_dir` tools against wherever you launched it from (your current working directory), **if the active model supports tool-calling**. Models that don't are marked without a `★` and clearly labeled `no tools` in the list — switching to one shows a warning, and it will honestly tell you it can't access files rather than guessing or making something up.

One-shot mode also works without entering the interactive prompt:
```
sakura "your question here"
sakura --model gemini-2.5-flash "your question"
sakura --model llama-3.3-70b-versatile "your question"
```

## Using a different path

If you can't/don't want to install at `/Applications/Sites/jiraiya/sakura/`, update both hardcoded references:

1. In `sakura.js`, change the `loadEnv(...)` path near the top of the file to your new `.env` location.
2. In the `~/.local/bin/sakura` shim, change the `require(...)` path to your new `sakura.js` location.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `command not found: sakura` | Shim not created, not executable, or its directory isn't on `PATH` |
| `[Sakura] Missing OPENROUTER_API_KEY, GROQ_API_KEY, and GEMINI_API_KEY in .env` | `.env` missing, in the wrong location, or all three keys empty |
| Gemini, Groq, or OpenRouter section missing from the banner | That provider's key is missing — the others still work |
| A model says it can't read/write files | That specific model doesn't support tool-calling (marked without `★`, shows `no tools` instead) — switch to a `★` model via `models` |
| Banner/picker look misaligned in a narrow terminal | The table is 120 columns wide (`BOX_W` in `sakura.js`) — widen your terminal window, or lower `BOX_W` if you prefer a narrower fixed layout |
| `401`/`403` error calling Gemini | Key is invalid, revoked, or restricted in Google AI Studio — regenerate at https://aistudio.google.com/apikey |
