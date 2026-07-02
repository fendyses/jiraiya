# Installing Sakura CLI on Another Device

Sakura is a small Node.js CLI (`sakura` = agentic file/shell assistant, `ai` = quick one-shot/interactive chat) that talks to OpenRouter and Groq. This guide gets it running on a fresh machine.

## Prerequisites

- **Node.js 20.10+** (needed for the JSON import syntax used in `test-models.js`). Check with:
  ```
  node -v
  ```
- npm (ships with Node)
- API keys for at least one provider:
  - **OpenRouter** — https://openrouter.ai/keys (covers most models in `models.json`)
  - **Groq** — https://console.groq.com/keys (covers the `(Groq)` models — Llama 3.3/3.1, Qwen3 32B, GPT-OSS-120B)

  You don't need both — a model whose provider key is missing will just fail/skip for that specific model, the rest still work.

## 1. Copy the project

Copy the whole `sakura/` folder to the new machine (via git, zip, rsync, USB, etc). Note that `.env` and `node_modules/` are gitignored, so if you're cloning from git you'll recreate both in the next steps.

## 2. Install dependencies

```
cd sakura
npm install
```

## 3. Create `.env`

Create a file named `.env` in the project root with:

```
OPENROUTER_API_KEY=your-openrouter-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
GROQ_API_KEY=your-groq-key-here
```

Omit whichever provider you're not using.

## 4. Make the entry scripts executable

If permissions didn't survive the copy (common with zip/USB transfers):

```
chmod +x chat.js sakura.js
```

## 5. Expose the global commands

This registers `sakura` and `ai` as global commands (defined in `package.json`'s `bin` field):

```
npm link
```

If you get an `EACCES`/permission error, either run with `sudo npm link`, or configure npm to use a user-writable global prefix (`npm config get prefix` / `npm config set prefix ~/.npm-global`, then add that to your `PATH`).

## 6. Verify

```
ai --list          # should print all available models
node test-models.js   # pings every model in models.json, reports OK/FAIL/SKIP
sakura             # launches the interactive agent picker
```

`sakura` and `ai` now work from **any directory** — `sakura`'s file/shell tools operate on whatever directory you launch it from (not the install folder), so `cd` into the project you want the agent to work on before running it.

## Usage quick reference

- `sakura` — interactive agentic CLI (pick a model, then it can read/write files, list dirs, run shell commands, search files in your current directory)
- `ai --list` — list all models and aliases
- `ai <model|alias> "question"` — one-shot answer
- `ai <model|alias>` — interactive chat (no tools, just conversation); `clear` resets history, `exit` quits

Aliases: `nemotron`, `qwen`/`coder`, `deepseek`/`flash`, `oss`/`gpt`, `gemma`, `super`, `laguna`, `north`, `owl`, `llama70`, `llama8`, `qwen32`, `groqoss`

## Uninstalling

```
npm unlink -g ai-openrouter
```

(run from anywhere — this removes the global `sakura`/`ai` symlinks; the project folder itself is untouched, delete it manually if no longer needed)
