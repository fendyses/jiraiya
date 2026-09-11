# Current Session Memory - 2026-09-11
*Latest session pointer*

## Session Context
**Session Type**: Work
**Current Project**: MyAlumniCard (`/Applications/Sites/myalumni-angular`) — UiTM
**Status**: Wrapping up
**Time**: Afternoon session, diary written 12:32 GMT+8

## Current Focus
- **Primary Task**: Restored the registration Verify request across local and production environments.
- **Progress**: Angular proxy, service-worker bypass, and accepted `alumnai` token are committed; builds and targeted live probes pass.

## Session Recap (For AI Restart)
- Registration failures had three layers: HTTP 504, Chrome private-network/service-worker CORS handling, and an invalid `myatp` JWT signature.
- Local development now uses `/alumnai-api` through the Angular CLI proxy; production uses the direct FastAPI URL with `ngsw-bypass=true`.
- Full repo recap: `projects/myalumni-angular/session.md`.

## Quick Context for Next Session
- Restart `ng serve` and perform a real Verify lookup, then deploy and confirm production behavior.
- Backend still rejects private-network preflight and should be hardened; recurring 504 also needs gateway investigation.

---
*Session updated: 2026-09-11 12:32*
