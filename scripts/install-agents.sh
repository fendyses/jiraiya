#!/usr/bin/env bash
# install-agents.sh
# Symlinks JIRAIYA's shared agents into a target repo.
# Usage:
#   ./scripts/install-agents.sh              → installs into current directory
#   ./scripts/install-agents.sh /path/to/repo → installs into specified repo

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JIRAIYA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
AGENTS_SRC="$JIRAIYA_DIR/.github/agents"
TARGET_REPO="${1:-$(pwd)}"
BEGIN_MARKER="<!-- BEGIN JIRAIYA SHARED INSTRUCTIONS -->"
END_MARKER="<!-- END JIRAIYA SHARED INSTRUCTIONS -->"

if [ ! -d "$AGENTS_SRC" ]; then
  echo "❌ Could not find shared agents at: $AGENTS_SRC" >&2
  exit 1
fi

mkdir -p "$TARGET_REPO/.github/agents"

render_shared_instructions() {
  cat <<EOF
$BEGIN_MARKER
# JIRAIYA — Shared Memory Overlay

This repository uses the shared JIRAIYA memory core at \`$JIRAIYA_DIR\`.

## Startup Rules

- Before handling the user's first request, load \`$JIRAIYA_DIR/master-memory.md\`.
- Check \`$JIRAIYA_DIR/main/reminders.md\` at session start.
- At session start, print the ASCII banner exactly as defined in \`$JIRAIYA_DIR/.github/copilot-instructions.md\` (epic-font JIRAIYA with purple ▓ borders and 💜 accents).
- Then continue with the normal JIRAIYA session brief.

## Shared Diary Rules

- Diary entries never go in this repository.
- Always write diary entries to \`$JIRAIYA_DIR/daily-diary/current/YYYY-MM-DD.md\` — create if missing, append if it already exists.
- Use \`$JIRAIYA_DIR/daily-diary/archived/YYYY-MM/\` for archived months.

## Shared Agents

- Shared agent files are installed locally in \`.github/agents/\`.
- Use \`@jiraiya\` as the default orchestrator.
$END_MARKER
EOF
}

upsert_shared_instructions() {
  local target_file="$1"
  local block_file
  local tmp_file
  block_file="$(mktemp)"
  tmp_file="$(mktemp)"

  render_shared_instructions > "$block_file"

  if [ -f "$target_file" ] && grep -Fq "$BEGIN_MARKER" "$target_file" && grep -Fq "$END_MARKER" "$target_file"; then
    awk -v begin="$BEGIN_MARKER" -v end="$END_MARKER" -v block_file="$block_file" '
      function print_block(line) {
        while ((getline line < block_file) > 0) {
          print line
        }
        close(block_file)
      }
      $0 == begin {
        if (!replaced) {
          print_block()
          replaced = 1
        }
        skip = 1
        next
      }
      $0 == end {
        skip = 0
        next
      }
      !skip {
        print
      }
    ' "$target_file" > "$tmp_file"
  elif [ -f "$target_file" ]; then
    cat "$target_file" > "$tmp_file"
    printf "\n\n" >> "$tmp_file"
    cat "$block_file" >> "$tmp_file"
  else
    cat "$block_file" > "$tmp_file"
  fi

  mv "$tmp_file" "$target_file"
  rm -f "$block_file"
}

echo "📦 Installing JIRAIYA agents into: $TARGET_REPO"
echo ""

for agent_file in "$AGENTS_SRC"/*.agent.md; do
  basename=$(basename "$agent_file")
  target="$TARGET_REPO/.github/agents/$basename"
  if [ -L "$target" ]; then
    echo "🔁 Re-linking  $basename"
    ln -sf "$agent_file" "$target"
  elif [ -f "$target" ]; then
    echo "⏭️  Skipping    $basename (repo has its own version)"
  else
    ln -sf "$agent_file" "$target"
    echo "✅ Linked      $basename"
  fi
done

instructions_file="$TARGET_REPO/.github/copilot-instructions.md"
had_instructions_file=0
if [ -f "$instructions_file" ]; then
  had_instructions_file=1
fi

upsert_shared_instructions "$instructions_file"
if [ "$had_instructions_file" -eq 1 ]; then
  echo "🧠 Updated     .github/copilot-instructions.md (managed JIRAIYA block)"
else
  echo "🧠 Created     .github/copilot-instructions.md (managed JIRAIYA block)"
fi

if git -C "$TARGET_REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if git -C "$TARGET_REPO" ls-files --error-unmatch .github/copilot-instructions.md >/dev/null 2>&1; then
    echo "ℹ️  Review     .github/copilot-instructions.md is tracked in this repo"
  fi
fi

# Add to .gitignore if this is not the jiraiya repo
if [ "$(realpath "$TARGET_REPO")" != "$(realpath "$JIRAIYA_DIR")" ]; then
  gitignore="$TARGET_REPO/.gitignore"
  if grep -q ".github/agents" "$gitignore" 2>/dev/null; then
    echo "⏭️  .gitignore already has .github/agents/"
  else
    printf "\n# JIRAIYA shared agents (local only)\n.github/agents/\n" >> "$gitignore"
    echo "🔒 Added .github/agents/ to .gitignore"
  fi
fi

echo ""
echo "Done! Run 'Reload Window' in VS Code to pick up the agents and shared JIRAIYA instructions."
