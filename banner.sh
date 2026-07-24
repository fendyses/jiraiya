#!/usr/bin/env bash
# JIRAIYA banner — compact Unicode wordmark with ANSI gradient rendering.
# Use --plain when ANSI command output would be hidden or collapsed.
/usr/bin/python3 - "$@" <<'EOF'
import sys

wordmark = [
    "     ██╗██╗██████╗  █████╗ ██╗██╗   ██╗ █████╗",
    "     ██║██║██╔══██╗██╔══██╗██║╚██╗ ██╔╝██╔══██╗",
    "     ██║██║██████╔╝███████║██║ ╚████╔╝ ███████║",
    "██   ██║██║██╔══██╗██╔══██║██║  ╚██╔╝  ██╔══██║",
    "╚█████╔╝██║██║  ██║██║  ██║██║   ██║   ██║  ██║",
    " ╚════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝",
]

width = 66
rows = [(219, "╭" + "─" * width + "╮")]
rows.append((219, "│" + " " * width + "│"))
rows.extend(
    (color, "│" + text.center(width) + "│")
    for color, text in zip([219, 183, 141, 135, 99, 93], wordmark)
)
rows.extend([
    (93, "│" + " " * width + "│"),
    (57, "│" + "✦  PERSISTENT AI MEMORY CORE  ✦".center(width) + "│"),
    (57, "│" + "by Fendy SES".center(width) + "│"),
    (57, "╰" + "─" * width + "╯"),
])

plain = "--plain" in sys.argv[1:]

for color, text in rows:
    output = f"{text}\n" if plain else f"\x1b[38;5;{color}m{text}\x1b[0m\n"
    sys.stdout.buffer.write(output.encode("utf-8"))

sys.stdout.buffer.flush()
EOF

# Hold the banner on screen for a beat before Claude moves on to the brief.
# Skipped in --plain mode (used for the farewell fallback text block, not live terminal display).
case " $* " in
  *" --plain "*) ;;
  *) sleep 4 ;;
esac
