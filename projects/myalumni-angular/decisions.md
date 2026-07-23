# MyAlumniCard — Decision Log
*Non-obvious decisions for this repo. Append-only.*

---

## 2026-07-22 — Self-mitigate the `tarikh_create` gap rather than wait on upstream

**Context**: New registrations stopped getting `tarikh_create` because UiTM upstream isn't stamping it. Fendy reported it to Integrasi, but **Integrasi also didn't know the cause** — so an upstream fix had no owner and no ETA, while every day's registrations kept losing the field.
**Decision**: Don't wait on upstream. Deploy a Firebase Function (`stampTarikhCreate`) that fills `tarikh_create` from the document's own `createTime` whenever the field is absent, guarded to only touch docs missing it so it self-limits when upstream recovers. Deployed 22 Jul, verified working 23 Jul (0 → 33 stamped, 9 today). CR logged `CR/7-2026.md`.
**Rationale**: When a bug's root cause sits upstream in a system you don't own and the owner can't explain it, an open-ended wait keeps the damage compounding daily. A guarded, self-limiting client-side mitigation stops the bleed immediately without pre-empting the eventual upstream fix — the function does nothing once upstream starts stamping again. The Integrasi `alumnai`-token request stays open as the proper cure, but is no longer on the critical path.

---

## 2026-07-21 — API tokens must match app identity, not just be valid
**Context**: The hardcoded bearer token in `register.component.ts:175` expired 20 Apr 2026 and was replaced the same afternoon (commit `aa01c8b`) with a token belonging to a different application — `myatp` instead of `alumnai`. Upstream still authorised the call, so registration worked and the fix looked complete. But UiTM only stamps `tarikh_create` for requests arriving as `alumnai`, so 15,819 records silently lost the field over three months.
**Decision**: When replacing any UiTM API token in MyAlumniCard, the replacement must carry the **same `user`/`app`/`scope` claims** as the token it replaces. Decode both and compare before deploying. "It authorises and the request succeeds" is not sufficient verification. Register-flow tokens must be issued to `alumnai`, matching the attendance flow (`attendance.component.ts:102`).
**Rationale**: Upstream behaviour can be gated on app identity in ways that are invisible from the client — the call returns 200, the payload looks right, and the missing side effect produces no error. The attendance flow renewed its token on 14 May 2026 while keeping the `alumnai` identity and was never affected, which is what isolated identity as the variable.
