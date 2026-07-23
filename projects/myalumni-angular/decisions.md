# MyAlumniCard — Decision Log
*Non-obvious decisions for this repo. Append-only.*

---

## 2026-07-21 — API tokens must match app identity, not just be valid
**Context**: The hardcoded bearer token in `register.component.ts:175` expired 20 Apr 2026 and was replaced the same afternoon (commit `aa01c8b`) with a token belonging to a different application — `myatp` instead of `alumnai`. Upstream still authorised the call, so registration worked and the fix looked complete. But UiTM only stamps `tarikh_create` for requests arriving as `alumnai`, so 15,819 records silently lost the field over three months.
**Decision**: When replacing any UiTM API token in MyAlumniCard, the replacement must carry the **same `user`/`app`/`scope` claims** as the token it replaces. Decode both and compare before deploying. "It authorises and the request succeeds" is not sufficient verification. Register-flow tokens must be issued to `alumnai`, matching the attendance flow (`attendance.component.ts:102`).
**Rationale**: Upstream behaviour can be gated on app identity in ways that are invisible from the client — the call returns 200, the payload looks right, and the missing side effect produces no error. The attendance flow renewed its token on 14 May 2026 while keeping the `alumnai` identity and was never affected, which is what isolated identity as the variable.
