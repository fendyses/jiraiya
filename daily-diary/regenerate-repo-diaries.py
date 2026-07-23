#!/usr/bin/env python3
"""Regenerates each repo's per-repo diary INDEX at projects/<slug>/diary.md
from the global daily-diary journal (current/ + archived/).

The journal is the single source of truth. This writes a lightweight, always-fresh
INDEX (date · title · outcome · link) — never a copy of the content, so there is no
duplication and no drift. Run this after any diary write, alongside
regenerate-diary-data.py.
"""
import os, re, glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)                      # jiraiya repo root
PROJECTS = os.path.join(ROOT, "projects")

# slug -> (display name, [alias substrings, lowercase]).
# Aliases are curated and distinctive. Ambiguous single words that collide with
# JIRAIYA features are deliberately excluded (e.g. "credit" == the credit-TRACKER
# farewell feature, not the Credit app repo — it produced only false positives).
REPOS = {
    "nilam":            ("Nilam",        ["nilam"]),
    "myalumni-angular": ("MyAlumniCard", ["myalumni", "alumni"]),
    "mystudentvue":     ("MyStudent",    ["mystudent", "mystudentvue"]),
    "apps-back-end":    ("Masmed2u",     ["masmed"]),
    "mobilitiug":       ("Mobiliti UG",  ["mobiliti"]),
    "ican2u":           ("ican2u",       ["ican2u"]),
    "forexpulse":       ("ForexPulse",   ["forexpulse"]),
    "hepweb":           ("HEPWeb",       ["hepweb"]),
    "jiraiya":          ("Jiraiya",      ["jiraiya"]),
}
# Add a repo here (or via a distinctive alias) when a real, unambiguous mention exists:
#   "credit": ("Credit", ["/applications/sites/credit", "credit repo", "creditlaravel"]),


def journal_files():
    return sorted(
        glob.glob(os.path.join(SCRIPT_DIR, "current", "*.md")) +
        glob.glob(os.path.join(SCRIPT_DIR, "archived", "*", "*.md"))
    )


def parse_entry(path):
    """Return (date, abspath, [titles], outcome, lowered_text) for a dated journal file."""
    fname = os.path.basename(path)
    m = re.match(r"^(\d{4}-\d{2}-\d{2})\.md$", fname)
    if not m:
        return None
    date = m.group(1)
    with open(path, encoding="utf-8") as f:
        text = f.read()
    titles = []
    for h in re.findall(r"^##\s+(.+)$", text, re.MULTILINE):
        # strip a leading "DATE (time) - " prefix, keep the human title
        t = re.sub(r"^\d{4}-\d{2}-\d{2}\s*\([^)]*\)\s*[-–—]\s*", "", h).strip()
        t = re.sub(r"^\d{4}-\d{2}-\d{2}\s*[-–—]\s*", "", t).strip()
        if t and t not in titles:
            titles.append(t)
    om = re.search(r"^\s*-?\s*Outcome:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
    outcome = om.group(1).strip() if om else ""
    return date, os.path.abspath(path), titles, outcome, text.lower()


def main():
    entries = [e for e in (parse_entry(p) for p in journal_files()) if e]

    for slug, (name, aliases) in REPOS.items():
        hits = [e for e in entries if any(a in e[4] for a in aliases)]
        if not hits:
            continue
        hits.sort(key=lambda e: e[0], reverse=True)   # newest first

        d = os.path.join(PROJECTS, slug)
        os.makedirs(d, exist_ok=True)

        out = [f"# {name} — Repo Diary Index",
               "*Auto-generated from the global `daily-diary/` journal (the source of truth). "
               "Do not edit by hand — regenerate with `daily-diary/regenerate-repo-diaries.py`.*",
               ""]
        for date, abspath, titles, outcome, _ in hits:
            rel = os.path.relpath(abspath, d).replace("\\", "/")   # from projects/<slug>/
            title = "; ".join(titles) if titles else "(session)"
            out.append(f"- **{date}** — [{title}]({rel})")
            if outcome:
                out.append(f"  - Outcome: {outcome}")
        out.append("")
        with open(os.path.join(d, "diary.md"), "w", encoding="utf-8") as f:
            f.write("\n".join(out))
        print(f"{slug:20} {len(hits)} entries indexed")


if __name__ == "__main__":
    main()
