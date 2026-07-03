---
name: ask-nemotron
description: "Triggers on 'ask nemotron', 'nemotron [question]', 'query nemotron',
             or 'send to nemotron'. Runs the local Nemotron CLI and shows the
             response inline within the JIRAIYA session."
---

# Ask Nemotron — NVIDIA AI Inline Query Skill
*Query Nemotron from inside JIRAIYA without leaving the session.*

## Activation

Triggers when user says any of:
- `ask nemotron [question]`
- `nemotron [question]`
- `query nemotron [question]`
- `send to nemotron [question]`
- `what does nemotron say about [topic]`

## Context Guard

| Context | Status |
|---------|--------|
| **User invokes with a question** | ACTIVE — extract question, run CLI |
| **No question provided** | ASK — prompt user for the question |
| **CLI not found** | ERROR — guide user to install |
| **Mid-conversation (no nemotron mention)** | DORMANT |

## Protocol

### Step 1 — Extract the question
- Parse everything after the trigger phrase as the query
- If no query text: ask "What do you want to ask Nemotron?"

### Step 2 — Run Nemotron CLI
Run via Bash tool:
```bash
nemotron "<question>"
```
- Timeout: 35 seconds
- On error `command not found`: tell user to run setup at `/Users/pairofspades/Documents/Ai/nemotron/ask-nemotron.js`

### Step 3 — Display response
Format the output cleanly:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 Nemotron says:
[response text]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Show which model was used (Super or Nano) if present in output
- If response is empty or error: show the raw error message

### Step 4 — Offer follow-up
After displaying the response, offer:
> "Want me to log this, use this in our current task, or ask a follow-up?"

Only offer if the response seems substantive (not a one-liner).

## Mandatory Rules
1. **Never modify** the nemotron script or API key during this skill
2. **Pass the raw question** as a single quoted string to the CLI
3. **Always show** which Nemotron model responded (Super or Nano)
4. **Stay in session** — do not open a new terminal or background process

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| Question contains quotes | Escape them before passing to CLI |
| CLI times out (30s) | Show "Nemotron did not respond in time. Try again." |
| Rate limited → falls back to Nano | Note: "Nemotron Nano responded (Super rate limited)" |
| Multi-part question | Pass the full question as one string |

## File Access

Nemotron can read files/folders you grant access to.

### Config — `~/.nemotron/config.json`
```json
{
  "trusted_folders": ["/applications/sites/jiraiya"],
  "trusted_files": [],
  "auto_load": false,
  "max_file_kb": 50,
  "max_total_kb": 120
}
```
- `auto_load: true` → preloads all trusted folders on every startup (slow)
- `auto_load: false` (default) → folders are trusted but only loaded on demand

### CLI Flags
| Flag | Example | Effect |
|------|---------|--------|
| `--file <path>` | `nemotron --file /path/to/file.md "summarise"` | Inject one file as context |
| `--folder <path>` | `nemotron --folder /apps/jiraiya "question"` | Scan folder (≤2 levels, ≤120 KB total) |

### Interactive Commands
| Input | Effect |
|-------|--------|
| `@/path/to/file` | Attach a file inline (must be in a trusted folder) |
| `load /path` | Load a file or folder into current session context |
| `list` | Show trusted folders and currently loaded files |

### Security
- `@path` syntax validates against `trusted_folders` — blocks paths outside trusted scope
- `load <path>` bypasses trust check for explicit one-time loads in interactive mode
- Max 50 KB per file, 120 KB total context budget

## CLI Info
- **Script**: `/Users/pairofspades/Documents/Ai/nemotron/ask-nemotron.js`
- **Command**: `nemotron` (symlinked at `~/.local/bin/nemotron`)
- **Config**: `~/.nemotron/config.json`
- **Models**: `nvidia/nemotron-3-super-120b-a12b:free` → fallback `nvidia/nemotron-3-nano-30b-a3b:free`
- **Provider**: OpenRouter (free tier)

## Level History
- **Lv.1** — Base: trigger detection, one-shot CLI query, inline display, follow-up offer.
- **Lv.2** — File access: `--file`, `--folder` flags; `@path` inline injection; `load`/`list` interactive commands; trusted-folder config; 120 KB context budget.
