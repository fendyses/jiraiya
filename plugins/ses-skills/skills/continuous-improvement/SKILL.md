---
name: continuous-improvement
description: "Reflect on significant completed work, analyze accumulated observations, create or reinforce conservative behavioral instincts, and report the project's learning level. Use when the user says 'continuous-improvement', '/continuous-improvement', 'instinct status', 'what have you learned', 'show learned rules', 'show rules', 'what patterns have you noticed', or 'behavioral learning', or deliberately requests a post-work reflection and instinct-learning pass."
---

# 📈 Continuous Improvement System — Skill Plugin

## Skill Name
Continuous Improvement

## Trigger Words
- `"continuous-improvement"`
- `"/continuous-improvement"`
- `"instinct status"` / `"behavioral learning"`
- `"what have you learned"` / `"show learned rules"` / `"show rules"`
- `"what patterns have you noticed"`
- After completing significant work (manual trigger)

## Activation Condition
Manual trigger after completing meaningful work. Not auto-triggered — run deliberately.

## Behavior

### Step 1 — Reflect

Generate a session reflection:

```markdown
## Reflection — [Date]
- What worked:
- What failed:
- What I'd do differently:
- Rule to add:
```

If there is a "Rule to add", create an instinct YAML file with **0.6 starting confidence** in the project's instinct directory.

### Step 2 — Analyze Observations

Detect project hash: `git root → SHA-256 first 12 chars`

Check `~/.claude/instincts/<hash>/observations.jsonl`.

**If 20+ lines exist:**
1. Read the last 500 lines
2. Read existing instinct `*.yaml` files (project + global)
3. Detect patterns:
   - User corrections → `"don't do X"` instincts
   - Error→fix sequences → `"when X fails, try Y"`
   - Repeated workflows (3+ times) → `"for X, do A→B→C"`
   - Tool preferences → `"use tool Y for task X"`
4. Create/update instinct YAML files
5. Be conservative: only create instincts for 3+ observations of the same pattern

**If fewer than 20 observations:** skip analysis, note the count.

### Bootstrap Rule

Jika observations sudah banyak tetapi project masih tiada instinct `*.yaml`, JIRAIYA boleh bootstrap starter set yang konservatif untuk menghidupkan learning layer. Starter set yang dibenarkan:

- `orchestrate-objective-owner-action`
- `preserve-session-context`
- `triage-highest-value-first`
- `close-follow-ups-explicitly`
- `log-non-obvious-decisions`
- `verify-before-reporting`
- `prefer-batched-tooling`
- `record-bottleneck-and-next-step`

Guardrails bootstrap:
- Gunakan schema sedia ada sahaja: `id`, `domain`, `description`, `confidence`, `observations`, `rule`, `created`, `updated`
- Mulakan confidence dalam julat `0.62-0.69`
- Jangan cipta instinct global secara default untuk bootstrap ini
- Jika repo ada `instinct-packs/`, anggap `orchestration-core`, `execution-discipline`, dan `memory-ops` sebagai reusable pack baseline

### Step 3 — Show Status

Display all instincts for current project + global:

```
=== continuous-improvement ===

## Level: [CAPTURE | ANALYZE | SUGGEST | AUTO-APPLY]

## Session Reflection
- What worked: [from this session]
- What failed: [from this session]
- What I'd do differently: [from this session]
- Rule to add: [captured as instinct]

## Learning
  NEW  [instinct-id]   [domain]  [confidence]  (from reflection)
   ↑   [instinct-id]   [domain]  [old]→[new]   (+N observations)

## Instincts — [project-name] ([hash])
  ● [0.85] instinct-id   domain   auto-apply
  ◐ [0.60] instinct-id   domain   suggest
  ○ [0.35] instinct-id   domain   silent

## Instincts — global
  ● [0.90] instinct-id   domain   auto-apply

## Next
- Keep working — hooks capture automatically
- System auto-levels as instincts gain confidence
```

If no instincts or observations exist yet: explain this is expected — system is in CAPTURE level and will create instincts after 20+ observations accumulate.

## Instinct File Format

```yaml
id: [instinct-id]
domain: [domain]
description: [what the instinct does]
confidence: 0.60
observations: 3
rule: [the rule]
created: [date]
updated: [date]
```

## Mandatory Rules

1. Never hallucinate instincts. Only report what exists as `*.yaml` on disk.
2. Never invent observations — only report what exists in `observations.jsonl`.
3. Do not auto-apply a new instinct without the user's awareness — surface it in
   the reflection step first.
4. When instincts exist and have earned auto-apply confidence, follow them
   silently during work; do not re-announce them every session.
5. Flag instincts that look stale or contradictory for user review rather than
   quietly dropping them.

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| **No instincts yet** | Expected — report CAPTURE level, note instincts appear after 20+ observations |
| **No `~/.claude/instincts/` at all** | Report the system has not captured anything yet; hooks may not be installed |
| **Fewer than 20 observations** | Skip analysis, report the count |
| **Observations exist but no instincts** | Apply the Bootstrap Rule above |

## Companion Skills
- Forge-Self-Improvement-System → Forge creates skills from patterns; this system creates instincts
- Discipline-System → instincts reinforce the 7 laws through observed behavior
- `dashboard` → renders the instinct store this skill writes
- `save-diary` → active instincts are summarized into the session diary

## Level History
- **Lv.1** — Base: 3-step loop (reflect, analyze observations, show status), instinct creation from 3+ patterns, confidence levels (CAPTURE→ANALYZE→SUGGEST→AUTO-APPLY), instinct YAML format. (Origin: Self-improvement system JIRAIYA, xdaxzurairi)
- **Lv.2** — Discovery Metadata: added formal trigger-aware YAML frontmatter for reliable skill discovery. (Origin: Fendy requested metadata normalization across all skills, 2026-07-20)
- **Lv.3** — Absorbed Mulahazah: merged the duplicate `mulahazah` skill into this one. Both claimed the `/continuous-improvement` trigger but wrote to different stores (`~/.claude/mulahazah/rules.md` vs `~/.claude/instincts/`), causing a split brain. The mulahazah store was never installed on disk and held no data, so this skill's instinct store survived; mulahazah's trigger words, mandatory rules, and edge-case table were carried over. (Origin: Fendy's skill-redundancy audit, 2026-07-22)
