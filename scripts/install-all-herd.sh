#!/usr/bin/env bash
# install-all-herd.sh
# Installs JIRAIYA agents into every git repo under ~/Herd (except jiraiya itself).
# Usage:
#   ./scripts/install-all-herd.sh              → scans ~/Herd
#   ./scripts/install-all-herd.sh /some/root   → scans a custom root folder

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JIRAIYA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SCAN_ROOT="${1:-"$HOME/Herd"}"
INSTALL_SCRIPT="$SCRIPT_DIR/install-agents.sh"

if [ ! -x "$INSTALL_SCRIPT" ]; then
  chmod +x "$INSTALL_SCRIPT"
fi

echo "🔍 Scanning for git repos in: $SCAN_ROOT"
echo ""

found=0
skipped=0

while IFS= read -r git_dir; do
  repo_dir="$(dirname "$git_dir")"

  # Skip the jiraiya repo itself
  if [ "$(realpath "$repo_dir")" = "$(realpath "$JIRAIYA_DIR")" ]; then
    continue
  fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📁 Repo: $repo_dir"
  bash "$INSTALL_SCRIPT" "$repo_dir"
  echo ""
  ((found++)) || true
done < <(find "$SCAN_ROOT" -maxdepth 2 -name ".git" -type d 2>/dev/null | sort)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done! Installed into $found repo(s)."
echo "   Reload VS Code windows to pick up the agents."
