#!/usr/bin/env bash
# JIRAIYA banner — gradient purple (219→183→141→135→99→93→57)
python3 - <<'EOF'
import sys
rows = [
    (219, "  ███████████ ███████████ █████████      ███     ███████████ ███   ███     ███     "),
    (183, "      ███         ███     ███    ███   ███ ███       ███     ███   ███   ███ ███   "),
    (141, "      ▓▓▓         ▓▓▓     ▓▓▓    ▓▓▓  ▓▓▓   ▓▓▓      ▓▓▓      ▓▓▓ ▓▓▓   ▓▓▓   ▓▓▓  "),
    (135, "      ▓▓▓         ▓▓▓     ▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓▓     ▓▓▓       ▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓▓▓  "),
    (99,  "      ▒▒▒         ▒▒▒     ▒▒▒    ▒▒▒ ▒▒▒     ▒▒▒     ▒▒▒        ▒▒▒    ▒▒▒     ▒▒▒ "),
    (93,  "  ▒▒▒ ▒▒▒         ▒▒▒     ▒▒▒    ▒▒▒ ▒▒▒     ▒▒▒     ▒▒▒        ▒▒▒    ▒▒▒     ▒▒▒ "),
    (57,  "   ░░░░░      ░░░░░░░░░░░ ░░░    ░░░ ░░░     ░░░ ░░░░░░░░░░░    ░░░    ░░░     ░░░"),
]
for color, text in rows:
    sys.stdout.buffer.write(f'\x1b[38;5;{color}m{text}\x1b[0m\n'.encode('utf-8'))

sys.stdout.buffer.write(b'\n')
sys.stdout.buffer.write('\x1b[38;5;57m  By Fendy SES\x1b[0m\n'.encode('utf-8'))
sys.stdout.buffer.flush()
EOF
