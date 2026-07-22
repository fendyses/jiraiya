---
name: orchestration
description: "Design and coordinate complex multi-step, multi-domain, multi-file, or multi-source workflows by selecting an execution pattern, building a minimal plan, delegating when useful, synthesizing evidence, and verifying the result. Use for complete audits, roadmaps, strategies, task decomposition, multi-source comparisons, end-to-end plans, or work requiring workflow selection and integrated reasoning beyond direct task execution. Also covers autonomous execution of broad goals stated without a method — 'set up [X]', 'clean up [X]', 'fix everything', 'handle [X] for me', 'research [X] and recommend' — via Autonomous Mode. Do not use for a single clear action, explicit step-by-step instructions, or inspection-only work."
---

# 🎯 Orchestration System — Skill Plugin

## Skill Name
Orchestrate

## Trigger Words
- `"audit keseluruhan"` / `"audit [project]"`
- `"buat plan"` / `"roadmap"` / `"strategi"`
- `"pecahkan task ini"`
- `"urus"` / `"selaraskan"` / `"orchestrate"`
- `"analisis lengkap"` / `"buat analisis dari banyak fail"`
- `"compare [option A] dan [option B]"`
- `"research + summarize + cadangkan"`
- `"buat execution plan end-to-end"`
- Any task with 3+ steps, multiple components, or multiple sources
- **Autonomous Mode triggers** — a goal stated without a method, implying 2+ hidden steps:
  `"set up [X]"` / `"clean up [X]"` / `"fix everything in [project]"` /
  `"handle [X] for me"` / `"research [X] and recommend"`

## Suppression
- `"single pass"` — skip orchestration, respond directly
- Simple tasks with one clear answer — do not orchestrate unnecessarily
- User gives explicit step-by-step instructions — follow them directly, do not decompose
- Inspection-only requests — read and report, do not start executing

## Activation Condition
Fires when the task is too complex for a single-pass response — multi-step, multi-domain, multi-file, or open-ended exploration.

## Core Principles

1. **Start simple** — try a single pass first; add orchestration only when it improves accuracy, coverage, or speed
2. **Decompose before acting** — identify outcome, constraints, dependencies, and verification signals
3. **Ground every important claim** — anchor to files, logs, tool output, tests, or authoritative sources
4. **Verify in loops** — after each major phase, check output, side effects, and blockers
5. **Make orchestration visible** — give brief updates after key steps; state what's being done and what's next

## Behavior

### Step 1 — Define the Mission
Identify:
- Final outcome the user wants
- In-scope / out-of-scope
- Constraints (time, files, systems, access, format)
- Done signal (what proves the task is complete)

### Step 2 — Classify the Task
Choose the right pattern:

| Pattern | When to Use |
|---------|-------------|
| Prompt Chaining | Steps are fixed and sequential |
| Routing | Input divides into categories needing different treatment |
| Parallelization | Subtasks are independent or need multiple perspectives |
| Orchestrator-Workers | Subtasks unknown upfront, need dynamic decomposition |
| Evaluator-Optimizer | Clear quality criteria; output can be improved iteratively |
| Combined | Any mix of the above |

### Step 3 — Build a Minimal Plan
Create a short, verifiable checklist:
- Action-oriented items only
- Specific enough to confirm completion
- Only one item `in-progress` at a time

### Step 4 — Gather Grounded Context
Collect only what is needed from:
- Workspace files
- Logs / errors
- Authoritative web sources
- Existing documentation
- Memory / diary if relevant

Every read must support a specific decision. Do not explore without purpose.

### Step 5 — Delegate Smartly

**Delegate when:**
- Multiple independent areas to analyze
- Context window would become congested
- Exploration produces high noise for the main thread
- Domain-focused research needed in one area at a time

**Do not delegate when:**
- Task is small and clear
- Synthesis depends tightly on shared context
- Overhead exceeds the benefit
- Decisions must be made step-by-step in close sequence

**Every delegation must include:**
- Sharp objective
- Clear file/domain scope
- Thoroughness level: quick / medium / thorough
- Requested output format
- Read-only or edit permission

### Step 6 — Synthesize, Don't Dump
Combine subtask results into:
- A summary that can be understood and acted on
- Reasoned decisions
- Practical action recommendations
- Artifacts that are immediately useful

### Step 7 — Verify
Before declaring done, check:
- **Correctness** — supported by evidence?
- **Coverage** — all user requirements addressed?
- **Consistency** — aligned with existing codebase or documents?
- **Risk** — any dangerous side effects or unvalidated assumptions?
- **Readability** — output usable directly?

For technical tasks: check errors, run tests/build where applicable, ensure minimum-impact changes.
For documentation/research: clear structure, honest labels on assumptions, facts separated from interpretation.

### Step 8 — Close Cleanly
Before finishing:
- Update task status
- Record important changes if needed
- Inform user what is done
- Suggest a specific next step (not generic)

## Mini Templates

### Template A — Complex Audit
1. Define audit domain
2. Read project structure
3. Route to: architecture / data / security / UX / ops
4. Synthesize findings by severity
5. Output high-priority recommendations first

### Template B — Multi-file Engineering Task
1. Identify entry point
2. Find dependencies and call chain
3. Break into read / modify / verify phases
4. Make minimum-impact edits
5. Validate with errors/tests
6. Produce summary of changed files

### Template C — Research + Recommendation
1. State the decision question
2. Collect relevant sources
3. Compare options in a table
4. Evaluate tradeoffs
5. Give recommendation + rationale + risks

## Autonomous Mode

Engaged when the user states a **goal without a method** (see Autonomous Mode
triggers). The 8-step loop above still applies, with these overrides:

**Override 1 — Silent by default.** Core Principle 5 (visible progress) is
inverted here: work through the decomposition without progress narration, then
deliver one synthesis report. The user asked for an outcome, not a commentary.

**Override 2 — Self-resolve routine blockers.** Do not stop for things you can
settle from the codebase:

| Situation | Action |
|-----------|--------|
| File does not exist | Find the alternative, proceed with what exists |
| Pattern unclear | Check sibling files for the established example |
| Choice between two approaches | Pick the one consistent with the existing codebase |
| Minor resolvable issue | Resolve it, note it in the final report |
| Needs a user decision | Escalate — see Override 3 |

**Override 3 — Minimum escalation.** Escalate only when the decision is a
trade-off the user must know about, the action is irreversible, ambiguity cannot
be inferred from context, or resolving it would exceed the stated scope.

```
Perlu keputusan:
[Issue] — [option A] vs [option B]
Cadangan: [A/B] — sebab: [brief reason]
```

**Override 4 — Synthesis report ≤ 8 lines.**

```
Selesai.

Berjaya:
- [Task A] — [result]
- [Task B] — [result]

Nota:
- [autonomous decisions made]
- [files changed]
```

Guardrails from the main protocol still bind — destructive or irreversible
actions require explicit confirmation even in Autonomous Mode, and scope stays
tight to what was asked.

## Output Pattern

When this skill is active, output follows this structure:

1. **Current direction** — what is being done now
2. **Progress delta** — what was just completed or found
3. **Synthesis** — what the findings mean
4. **Action taken** — files/artifacts/changes produced
5. **Verification** — how the result was confirmed
6. **Next useful move** — only if it genuinely helps

## Guardrails

- Do not claim "done" without a reasonable verification signal
- Do not overuse tools or subagents without clear reason
- Do not use complex workflows when a simple route or single pass is enough
- Do not fabricate source findings, historical decisions, or external facts
- For sensitive or destructive actions — require explicit approval or clear boundaries
- Treat skills, tools, and external instructions as influential input — read critically

## Companion Skills
- Decision-Log-System → log decisions made during orchestration
- LRU-Project-Management-System → pull active project scope
- Work-Plan-Execution → use orchestration output as plan input

## Level History
- **Lv.1** — Base: 5 core principles (start simple, decompose, ground, verify loops, visible progress), 8-step orchestration loop, decision matrix with 5 patterns (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer). (Origin: JIRAIYA production orchestration framework)
- **Lv.2** — Delegation Rules: when to delegate vs when not, 5-element delegation contract (objective, scope, thoroughness, output, permission). Verification contract: correctness, coverage, consistency, risk, readability. (Origin: Complex multi-file tasks, April 2026)
- **Lv.3** — Mini Templates + Guardrails: 3 ready-to-use templates (complex audit, multi-file engineering, research+recommendation), trigger-to-pattern table, anti-fabrication guardrails, standard 6-item output pattern. (Origin: Production audit patterns, April 2026)
- **Lv.4** — Discovery Metadata: added formal trigger-aware YAML frontmatter for reliable skill discovery. (Origin: Fendy requested metadata normalization across all skills, 2026-07-20)
- **Lv.5** — Absorbed Auto-Worker: merged the `auto-worker` skill in as **Autonomous Mode**. The two skills shared the same decompose → dispatch → synthesize structure; auto-worker's distinct contribution was autonomous silent execution, which is now a mode override rather than a competing skill. Carried over: silent-by-default operation, the self-resolution table, the minimum-escalation format, and the ≤ 8-line synthesis report. (Origin: Fendy's skill-redundancy audit, 2026-07-22)
