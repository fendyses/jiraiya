#!/usr/bin/env zsh
# ─────────────────────────────────────────────────────────────────────────────
# JIRAIYA Shell Integration — by Fendy SES
#
# Source this file from your ~/.zshrc to get the JIRAIYA banner and
# the `copilot` wrapper on any machine:
#
#   source /path/to/jiraiya/scripts/jiraiya-shell.sh
#
# ─────────────────────────────────────────────────────────────────────────────

# ─── JIRAIYA / SES Banner ────────────────────────────────────────────────────
function ses() {
  print $'\n'
  print $'\e[38;5;147m     ██╗██╗██████╗  █████╗ ██╗██╗   ██╗ █████╗ \e[0m'
  print $'\e[38;5;141m     ██║██║██╔══██╗██╔══██╗██║╚██╗ ██╔╝██╔══██╗\e[0m'
  print $'\e[38;5;135m     ██║██║██████╔╝███████║██║ ╚████╔╝ ███████║\e[0m'
  print $'\e[38;5;129m██   ██║██║██╔══██╗██╔══██║██║  ╚██╔╝  ██╔══██║\e[0m'
  print $'\e[38;5;93m╚█████╔╝██║██║  ██║██║  ██║██║   ██║   ██║  ██║\e[0m'
  print $'\e[38;5;99m ╚════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝\e[0m'
  print $'\e[38;5;213m                                       by Fendy SES\e[0m'
  print $'\n'
  print $'\e[38;5;239m  ──────────────────────────────────────────────────────\e[0m'
  print $'\e[1;38;5;147m  AGENTS\e[0m'
  print $'\e[38;5;239m  ──────────────────────────────────────────────────────\e[0m'
  print $'\e[1;38;5;213m  @jiraiya     \e[0;38;5;247m Primary Orchestrator  -  Memory, planning, all tasks\e[0m'
  print $'\e[1;38;5;141m  @sesinfra    \e[0;38;5;247m Architect  -  System planning, folder structure, patterns\e[0m'
  print $'\e[1;38;5;135m  @sescode     \e[0;38;5;247m Code  -  Feature implementation, APIs, components\e[0m'
  print $'\e[1;38;5;129m  @sescheck    \e[0;38;5;247m Reviewer  -  Bugs, security, performance\e[0m'
  print $'\e[1;38;5;99m  @sesdocument \e[0;38;5;247m Documentor  -  Logs, changelogs, decisions\e[0m'
  print $'\e[38;5;239m  ──────────────────────────────────────────────────────\e[0m'
  print $'\n'
}
# ─────────────────────────────────────────────────────────────────────────────

# ─── Claude wrapper — shows JIRAIYA banner on start and after exit ──────────
function claude() {
  # Show banner immediately at terminal level (before Claude loads)
  bash /Applications/Sites/jiraiya/banner.sh
  printf '\e[38;5;183m  JIRAIYA is loading... stand by.\e[0m\n\n'

  # Run the real claude binary
  command claude "$@"

  # Show banner again after /exit
  bash /Applications/Sites/jiraiya/banner.sh
  printf '\e[38;5;135m  Session closed. See you soon, Fendy!\e[0m\n\n'
}
# ─────────────────────────────────────────────────────────────────────────────

# ─── Codex wrapper — shows JIRAIYA banner on start and after exit ───────────
function codex() {
  # Non-interactive/automation subcommands: pass through untouched — the
  # banner would corrupt stdio protocols (IDE integrations, scripted exec).
  case "$1" in
    mcp-server|app-server|exec-server|mcp)
      command codex "$@"
      return $?
      ;;
  esac

  # Show banner immediately at terminal level (before Codex loads)
  bash /Applications/Sites/jiraiya/banner.sh
  printf '\e[38;5;183m  JIRAIYA is loading... stand by.\e[0m\n\n'

  # Run the real codex binary
  command codex "$@"

  # Show banner again after exit
  bash /Applications/Sites/jiraiya/banner.sh
  printf '\e[38;5;135m  Session closed. See you soon, Fendy!\e[0m\n\n'
}
# ─────────────────────────────────────────────────────────────────────────────

# ─── Copilot wrapper — shows JIRAIYA banner after exit ───────────────────────
function copilot() {
  # Auto-detect the copilot CLI binary across different VS Code install paths
  local _BIN=""
  local _candidates=(
    "$HOME/Library/Application Support/Code/User/globalStorage/github.copilot-chat/copilotCli/copilot"
    "$HOME/.vscode/extensions/github.copilot-chat-*/copilotCli/copilot"
    "$HOME/AppData/Roaming/Code/User/globalStorage/github.copilot-chat/copilotCli/copilot"
    "/usr/local/bin/copilot-cli"
  )

  for candidate in "${_candidates[@]}"; do
    # Use glob expansion to handle wildcard paths
    local resolved=( $~candidate )
    if [[ -x "${resolved[1]}" ]]; then
      _BIN="${resolved[1]}"
      break
    fi
  done

  if [[ -z "$_BIN" ]]; then
    echo "\e[38;5;196mError: copilot CLI binary not found.\e[0m"
    echo "Make sure GitHub Copilot Chat extension is installed in VS Code."
    return 1
  fi

  "$_BIN" "$@"
  ses
}
# ─────────────────────────────────────────────────────────────────────────────
