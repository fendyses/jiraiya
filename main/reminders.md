# 🔔 Reminders
*Persistent cross-session follow-ups*

## Open

- **[MyAlumniCard] Request `alumnai`-issued register token from Integrasi** (opened 2026-07-21, urgent): The register flow runs on a `myatp` token since 20 Apr 2026, so UiTM stops stamping `tarikh_create`. 15,819 records affected and growing daily — still broken. Ask Integrasi for a register-flow token issued to the **`alumnai`** app (matching `attendance.component.ts:102`) and confirm that stamping is gated on app identity. See post-mortem 2026-04-20 → 2026-07-21.
- **[MyAlumniCard] Backfill 15,819 missing `tarikh_create`** (opened 2026-07-21): Blocked on the token fix — backfilling first would just be overtaken by new gaps. Source is Firestore `createTime`, exact to the second, no estimation needed.

## Completed

- **Sambung meeting runtime alignment** (completed 2026-05-13): `C:/Users/BSM/.copilot/.claude/commands/meeting.md` diselaraskan kepada wrapper canonical berasaskan source-of-truth `C:/Users/BSM/.copilot/skills/meeting/SKILL.md`, kemudian disemak semula dari segi struktur dan trigger penggunaan `meeting`.
