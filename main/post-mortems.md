# 🔥 Post-Mortems
*Learning from failures — append-only log*

---

## 2026-04-20 → 2026-07-21 — MyAlumniCard: token swap silently killed `tarikh_create` for 3 months

**Repo**: MyAlumniCard (`/Applications/Sites/myalumni-angular`)
**Detected**: 2026-07-21 by Fendy, ~3 months after onset. Analysed same day.
**Status**: Root cause established. **Not fixed — still occurring.**

### What happened
The hardcoded JWT in `register.component.ts:175` expired Mon 20 Apr 2026 11:27 MYT. Registration broke, and the token was replaced the same afternoon (commit `aa01c8b`, deployed 14:54 MYT) — a ~3.5-hour outage, handled quickly. The replacement token belonged to a different application: `alumnai` → `myatp`, scope `/alumnai` → `/alumnai/semak`. UiTM's upstream still authorised it and registration worked, but upstream only stamps `tarikh_create` for requests arriving as the `alumnai` app. **15,819 records created since 17 April 2026 have no `tarikh_create` — a 100.0% failure rate**, 14,466 of them completed registrations.

### Root cause
The token was replaced on the basis that it was *valid*, not that it carried the *same app identity*. The behaviour that broke was an upstream side effect gated on that identity — invisible from the client.

### Why it took 3 months to detect
The app never writes or reads `tarikh_create`. Registration records only `formData.register = 1` (`profile.service.ts:218`), a flag with no date. The field is written entirely by upstream, so when upstream stopped there was no error, no failed write, no local signal. Nothing in the codebase reads the field either, so no screen looked wrong — only monthly registration counts, which stayed plausible.

### Lessons
1. **A fix that restores the visible symptom can introduce an invisible one.** The outage response was correct in speed and wrong in verification.
2. **"The request succeeded" is not verification when the thing you care about is a side effect you cannot observe.** Confirm the effect, not the status code.
3. **A field your app depends on but never writes or reads has no failure mode you can detect.** That combination is the actual hazard, not the token.
4. **The control case did the real work.** The attendance flow renewed its token on 14 May while keeping the `alumnai` identity and was unaffected — that comparison is what isolated identity as the variable rather than timing or upstream changes.

### Preventive action
- Decode old and new tokens and compare `user`/`app`/`scope` claims before any token replacement. Logged as a decision, 2026-07-21.
- Request an `alumnai`-issued register token from Integrasi (open reminder).
- Write a local `tarikh_register` on registration so the app stops depending solely on an upstream field it cannot see fail.
- Backfill the 15,819 from Firestore `createTime` — exact to the second, no estimation.

### Caveat
The `myatp` → no-stamp link is inference. Strongly supported by the timeline and the attendance control case, but not confirmed by anyone who has seen upstream's code. Treat as the working cause pending Integrasi's confirmation.
