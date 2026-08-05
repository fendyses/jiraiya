#!/usr/bin/env bash
#
# repo-switch.sh — shared engine behind the /repo-switcher skill.
#
# Claude CLI, Codex CLI and Sakura CLI all call this script, so a switch means
# exactly the same thing in all three. There is no CLI-specific logic here.
#
# Source of truth for the repo list is the dashboard registry at
# /Applications/Sites/jiraiya/.env (REPO[]=Name | langs | note | path | active | org).
# A switch moves the `active` flag there and mirrors it into the Active Repo
# block of main/repos.md, which recall / save-diary / session-briefing read.
#
# Usage:
#   repo-switch.sh list                 numbered picker
#   repo-switch.sh active [--path]      show the current active repo
#   repo-switch.sh switch <n|name|path> switch to a repo
#
set -euo pipefail

JIRAIYA_ROOT="${JIRAIYA_ROOT:-/Applications/Sites/jiraiya}"
ENV_FILE="$JIRAIYA_ROOT/.env"
REGISTRY="$JIRAIYA_ROOT/main/repos.md"

die() { printf '%s\n' "$*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || die "Repo registry not found: $ENV_FILE"

# Emit one row per registered repo, fields separated by US (\037):
#   index · name · langs · note · path · active · org
# TAB is an IFS-whitespace character, so `read` would collapse the empty
# `active` field and shift `org` into it. A control char keeps fields aligned.
SEP=$'\037'

rows() {
  awk -F'|' -v S="$SEP" '
    function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
    /^[ \t]*#/ { next }
    /^[ \t]*REPO(\[\])?[ \t]*=/ {
      head = $1
      sub(/^[ \t]*REPO(\[\])?[ \t]*=[ \t]*/, "", head)
      name = trim(head)
      if (name == "") next
      n++
      printf "%d%s%s%s%s%s%s%s%s%s%s%s%s\n", \
        n, S, name, S, trim($2), S, trim($3), S, trim($4), S, \
        (tolower(trim($5)) == "active" ? "active" : ""), S, trim($6)
    }
  ' "$ENV_FILE"
}

cmd_list() {
  local n name langs note path act org marker flag
  printf '\n=== Repos — %s ===\n\n' "${ENV_FILE/#$HOME/~}"
  while IFS="$SEP" read -r n name langs note path act org; do
    marker=" "; [ "$act" = "active" ] && marker="→"
    flag=""; [ -d "$path" ] || flag="  ⚠ missing on disk"
    printf '%s %2d  %-16s %-14s %-9s %s%s\n' \
      "$marker" "$n" "$name" "${langs:--}" "${org:--}" "$note" "$flag"
  done < <(rows)
  printf '\nActive: %s\nPick a number or a name.\n\n' "$(cmd_active)"
}

cmd_active() {
  local n name langs note path act org
  while IFS="$SEP" read -r n name langs note path act org; do
    if [ "$act" = "active" ]; then
      [ "${1:-}" = "--path" ] && { printf '%s\n' "$path"; return 0; }
      printf '%s (%s)\n' "$name" "$path"
      return 0
    fi
  done < <(rows)
  [ "${1:-}" = "--path" ] || printf '(none set)\n'
  return 0
}

# Resolve a user argument to a row. Match order: index, exact name,
# exact path, folder basename, then unique case-insensitive prefix of a name.
resolve() {
  local want="$1" lw all hits
  lw="$(printf '%s' "$want" | tr '[:upper:]' '[:lower:]')"
  all="$(rows)"

  hits="$(printf '%s\n' "$all" | awk -F"$SEP" -v w="$want" '$1 == w')"
  [ -n "$hits" ] || hits="$(printf '%s\n' "$all" | awk -F"$SEP" -v w="$lw" 'tolower($2) == w')"
  [ -n "$hits" ] || hits="$(printf '%s\n' "$all" | awk -F"$SEP" -v w="${want%/}" '$5 == w')"
  [ -n "$hits" ] || hits="$(printf '%s\n' "$all" | awk -F"$SEP" -v w="$lw" '
    { n = split($5, p, "/"); if (tolower(p[n]) == w) print }')"
  [ -n "$hits" ] || hits="$(printf '%s\n' "$all" | awk -F"$SEP" -v w="$lw" '
    tolower(substr($2, 1, length(w))) == w')"

  case "$(printf '%s' "$hits" | grep -c . || true)" in
    0) die "No repo matches \"$want\". Run: repo-switch.sh list" ;;
    1) printf '%s\n' "$hits" ;;
    *) die "\"$want\" is ambiguous:
$(printf '%s\n' "$hits" | cut -d"$SEP" -f2 | sed 's/^/  - /')" ;;
  esac
}

# Move the `active` flag onto row $1, preserving the column alignment that
# makes .env readable by hand.
write_env_flag() {
  local target="$1" tmp
  tmp="$(mktemp)"
  awk -F'|' -v OFS='|' -v target="$target" '
    function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
    function pad(s, w,   o) { o = s; while (length(o) < w) o = o " "; return o }
    /^[ \t]*#/ { print; next }
    /^[ \t]*REPO(\[\])?[ \t]*=/ {
      head = $1
      sub(/^[ \t]*REPO(\[\])?[ \t]*=[ \t]*/, "", head)
      if (trim(head) == "") { print; next }
      n++
      if (NF >= 5) {
        w = length($5); if (w < 8) w = 8
        $5 = pad((n == target ? " active" : " "), w)
        print
      } else if (n == target) {
        print $0 " | active"
      } else {
        print
      }
      next
    }
    { print }
  ' "$ENV_FILE" > "$tmp"
  # Never leave a truncated registry behind.
  [ -s "$tmp" ] || { rm -f "$tmp"; die "Refusing to write an empty $ENV_FILE"; }
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

# Mirror the choice into the Active Repo block of main/repos.md.
write_registry_pointer() {
  local name="$1" path="$2" today tmp
  today="$(date +%Y-%m-%d)"
  [ -f "$REGISTRY" ] || return 0
  tmp="$(mktemp)"
  awk -v n="$name" -v p="$path" -v d="$today" '
    BEGIN { inblock = 0; done = 0 }
    /^##[ \t]*Active Repo[ \t]*$/ {
      print "## Active Repo"
      print "- **Name**: " n
      print "- **Path**: " p
      print "- **Switched**: " d
      print ""
      inblock = 1; done = 1
      next
    }
    inblock && /^(##|---)/ { inblock = 0 }
    inblock { next }
    { print }
    END {
      if (!done) {
        print "## Active Repo"
        print "- **Name**: " n
        print "- **Path**: " p
        print "- **Switched**: " d
      }
    }
  ' "$REGISTRY" > "$tmp"
  [ -s "$tmp" ] || { rm -f "$tmp"; die "Refusing to write an empty $REGISTRY"; }
  cat "$tmp" > "$REGISTRY"
  rm -f "$tmp"
}

cmd_switch() {
  [ $# -ge 1 ] || die "Usage: repo-switch.sh switch <number|name|path>"
  local n name langs note path act org
  IFS="$SEP" read -r n name langs note path act org < <(resolve "$1")

  [ -n "$path" ] || die "\"$name\" has no path in $ENV_FILE — fix the registry first."
  [ -d "$path" ] || die "\"$name\" points at $path, which does not exist on disk.
Fix the path in $ENV_FILE rather than switching to nothing."

  write_env_flag "$n"
  write_registry_pointer "$name" "$path"

  printf '\nActive repo → %s (%s)\n' "$name" "$path"
  printf '  .env           active flag moved to row %d\n' "$n"
  printf '  main/repos.md  Active Repo block updated\n'
  [ -d "$path/.git" ] || printf '  note           no .git here — not a git repo\n'
  printf '\ncd %s\n\n' "$path"
}

case "${1:-list}" in
  list|ls|"")   cmd_list ;;
  active)       shift; cmd_active "$@" ;;
  switch|use|s) shift; cmd_switch "$@" ;;
  -h|--help)    sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//' ;;
  *)            cmd_switch "$1" ;;   # bare argument = switch target
esac
