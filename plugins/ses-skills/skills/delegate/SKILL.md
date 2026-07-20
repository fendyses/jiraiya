---
name: delegate
description: "Delegate a user-supplied mission to JIRAIYA's role-based virtual staff and finish it through real parallel agent execution. Use whenever the user writes 'delegate [prompt]', 'delegate this', 'delegate task', or explicitly asks JIRAIYA to assign work simultaneously to the appropriate agents and return accountable per-agent completion reports."
---

# Delegate

*JIRAIYA assigns the mission. The responsible agents finish and report it.*

## Activation

When this skill activates, output:

`JIRAIYA is delegating this mission to the team...`

Treat everything after the first `delegate` command as the mission. If no mission is
provided, ask for it and stop.

## Role Routing

Use `company/staff/*.md` as the source of truth when more role detail is needed.

| Agent | Route work involving |
|---|---|
| NEXUS | Architecture, APIs, full-stack systems, schema migrations, technical direction |
| FORGE | AI agents, prompts, RAG, models, AI implementation |
| LENS | Data analysis, record operations, analytics, ML, dashboards, evidence |
| ORACLE | Business strategy, market, pricing, roadmap |
| PIXEL | UI/UX, design systems, accessibility, frontend experience |
| ECHO | Content, documentation, copy, brand, communications |
| CIPHER | Security, privacy, threat modeling, compliance |
| GRID | Infrastructure, CI/CD, cloud, deployment, reliability |
| PULSE | Testing, QA, performance, acceptance verification |
| SAGE | Research, literature, trends, innovation scanning |

JIRAIYA is the HCO and orchestrator. Do not assign SES as a worker; SES is the human
owner and final decision-maker.

## Protocol

### 1. Define the mission

- Extract the requested outcome, scope, constraints, permissions, and done signal.
- Treat `delegate` as authorization to coordinate the requested mission, not as blanket
  authorization for production mutations, deployments, pushes, destructive actions, or
  external communications.
- Inspect only the context needed to route the work correctly.
- Resolve minor ambiguity from the workspace. Ask the user only when a missing decision
  would materially change the result or authorize a risky action.

### 2. Select accountable agents

- Decompose the mission into the smallest useful role-based workstreams.
- Give every workstream exactly one responsible agent.
- Select only roles that add distinct value; do not convene the whole roster by default.
- Separate independent workstreams from dependencies.
- Assign overlapping files to one owner. Other agents may review them read-only.
- When several agents review the same artifact, give them shared severity, evidence, and
  acceptance criteria so JIRAIYA can compare and integrate their findings.

### 3. Dispatch real workers

- Use the environment's subagent or delegation tools; never simulate agent activity.
- Launch all independent workstreams simultaneously, up to the available concurrency
  limit. If more agents are needed, dispatch them in parallel waves.
- Run dependent work only after its prerequisites finish.
- Give every agent:
  - its JIRAIYA role and responsibility;
  - a sharp objective and clear scope;
  - relevant paths and context;
  - read-only or edit permission;
  - required artifacts and verification;
  - the report contract below.

Use this report contract in every assignment:

```text
RESPONSIBLE AGENT: [NAME]
COMPLETED: [work actually finished]
ARTIFACTS: [files, findings, or outputs]
VERIFICATION: [checks run and results]
FLAGS: [blockers, risks, or "none"]
```

### 4. Monitor to completion

- Wait for every assigned agent to finish.
- If a report is incomplete or verification fails, return the work to that responsible
  agent with a focused follow-up.
- Reassign only when the original agent is blocked or another role clearly owns the fix.
- Do not stop after planning, recommendations, or partial reports when safe in-scope
  execution can continue.

### 5. Integrate and verify

- Reconcile cross-agent outputs and resolve conflicts.
- Run or assign final integration checks appropriate to the mission.
- Confirm every requested outcome is complete and every artifact is accounted for.
- Preserve agent attribution; do not rewrite an unverified claim as fact.

### 6. Report

Return the responsible agents' reports followed by JIRAIYA's synthesis:

```text
Delegate complete.

[AGENT] — [responsibility]
- Completed: ...
- Artifacts: ...
- Verification: ...
- Flags: ...

JIRAIYA — synthesis
- Outcome: ...
- Integration verification: ...
- Remaining blockers: none | ...
```

If an agent fails or remains blocked, label that state plainly instead of claiming the
mission is complete.

## Mandatory Rules

1. An explicit `delegate` command must use at least one real worker agent when delegation
   tools are available.
2. Run independent assignments concurrently; never force dependent or conflicting edits
   to run simultaneously.
3. One workstream has one accountable owner and one attributable completion report.
4. JIRAIYA coordinates, monitors, integrates, and closes; it does not fabricate staff work.
5. Stay within the user's scope and permissions. The `delegate` prefix does not broaden
   authority. Obtain any required approval before destructive, irreversible, production,
   deployment, push, or external communication actions.
6. Verify actual outputs before reporting completion.
7. If delegation tools are unavailable, disclose that limitation. Do not pretend that
   multiple agents ran; offer a clearly labeled sequential role-based fallback.
8. Do not write durable JIRAIYA memory unless the user separately confirms that write.

## Companion Skills

- Orchestration — decompose complex missions and dependencies.
- Auto-Worker — resolve routine worker blockers.
- Code-Sharp — govern code written by workers.
- Security Audit — guide CIPHER remediation work.
- Auto-Commit — preserve completed changes when its commit rules activate.

## Level History

- **Lv.1** — Explicit `delegate <prompt>` trigger, role-based routing across ten JIRAIYA
  staff agents, real parallel dispatch in concurrency-safe waves, accountable ownership,
  completion monitoring, integration verification, and attributed agent reports.
  (Origin: Fendy requested JIRAIYA-led simultaneous delegation with responsible-agent
  reporting, 2026-07-20)
