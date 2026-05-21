#!/usr/bin/env bash
# install-agents.sh
# Symlinks JIRAIYA's shared agents into a target repo.
# Usage:
#   ./scripts/install-agents.sh              → installs into current directory
#   ./scripts/install-agents.sh /path/to/repo → installs into specified repo

JIRAIYA_DIR="/Applications/ServBay/www/jiraiya"
AGENTS_SRC="$JIRAIYA_DIR/.github/agents"
TARGET_REPO="${1:-$(pwd)}"

mkdir -p "$TARGET_REPO/.github/agents"

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
echo "Done! Run 'Reload Window' in VS Code to pick up the agents."
