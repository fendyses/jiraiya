#!/usr/bin/env bash
# JIRAIYA banner — compact, pure ASCII for reliable chat/terminal rendering.
# Use --plain when ANSI command output would be hidden or collapsed.
/usr/bin/python3 - "$@" <<'EOF'
import sys

rows = [
    (219, " ####  #####  ####    ###   #####  #   #   ### "),
    (183, "    #    #    #   #  #   #    #     # #   #   #"),
    (141, "    #    #    ####   #####    #      #    #####"),
    (135, "#   #    #    #  #   #   #    #      #    #   #"),
    (99,  " ###   #####  #   #  #   #  #####    #    #   #"),
]

plain = "--plain" in sys.argv[1:]

for color, text in rows:
    output = f"{text}\n" if plain else f"\x1b[38;5;{color}m{text}\x1b[0m\n"
    sys.stdout.buffer.write(output.encode("utf-8"))

sys.stdout.buffer.write(b"\n")
footer = "  By Fendy SES\n" if plain else "\x1b[38;5;57m  By Fendy SES\x1b[0m\n"
sys.stdout.buffer.write(footer.encode("utf-8"))
sys.stdout.buffer.flush()
EOF
