# Current Session Memory - 2026-09-11
*Active working memory for MyAlumniCard*

## Session Context
**Session Type**: Work
**Current Project**: MyAlumniCard (`/Applications/Sites/myalumni-angular`) — UiTM
**Status**: Wrapping up
**Time**: Afternoon session, diary written 12:32 GMT+8

## Current Focus
- **Primary Task**: Fix the registration Verify request that appeared as a production CORS failure and still failed on localhost.
- **Technical Context**: Angular 18, Axios, Angular service worker, Chrome Local Network Access, Angular CLI development proxy, FastAPI/Granian endpoint at `fastapi.uitm.edu.my`.
- **Progress**: Frontend transport and authentication fixes are committed by Fendy; production build and live proxy/API probes pass.

## Working Memory
### Active Context
- **Current Topic**: Registration API connectivity and authentication.
- **Immediate Goals**: Restart `ng serve`, verify a real IC lookup locally, then deploy and verify production.
- **Recent Progress**:
  - Confirmed public frontend `199.36.158.100` calling private API `10.0.37.50` triggers Chrome Local Network Access behavior.
  - Confirmed normal preflight succeeds but private-network preflight returns `400 Disallowed CORS private-network`.
  - Added `ngsw-bypass=true` so the production service worker does not own the `/semak` request.
  - Added `proxy.conf.json` and environment-specific API URLs so localhost uses `/alumnai-api/alumnai/semak` on the Angular origin.
  - Verified the local proxy reached FastAPI; the response changed from CORS failure to a genuine 401.
  - Identified the 401 body as an invalid JWT signature and replaced the old `myatp` token with the existing accepted `alumnai` token.
  - Verified the `alumnai` token returns HTTP 200 from `/alumnai/semak` for harmless placeholder data.
- **Next Steps**: Run the real local Verify flow after restarting `ng serve`; then deploy and test production, watching for any recurring gateway 504.

### Important Decisions
- Use a same-origin Angular CLI proxy for development rather than asking Chrome to access the private UiTM address directly.
- Keep the production endpoint direct but mark it with Angular's `ngsw-bypass` query parameter.
- Reuse the repo's accepted `alumnai` token to restore service now; move credentials server-side as a future security improvement.
- Treat backend 504 monitoring separately from browser CORS and authentication.

## Session Recap (For AI Restart)
- **Previous Session Summary**: The 10 Sep session completed and verified the Ukuran Jubah feature for convocation attendance.
- **Where We Left Off**: Registration verification transport and token fixes are committed as `1060f85` and `c127164`; production build passes and the accepted token was validated against FastAPI.
- **Important Context**: A private-network OPTIONS request still receives 400 from FastAPI. Local development avoids it through the Angular proxy; production uses `ngsw-bypass`, but backend CORS/gateway hardening remains desirable.
- **User's Current State**: Fendy tested each stage directly in Chrome and commits changes quickly as they land.

## Session Achievements
- ✅ Distinguished the initial HTTP 504 from the service-worker CORS/preflight symptoms.
- ✅ Proved the frontend and API occupy public and private network address spaces respectively.
- ✅ Added and built the Angular service-worker bypass.
- ✅ Added and exercised the localhost same-origin proxy end to end.
- ✅ Converted the browser failure from CORS to an observable backend 401.
- ✅ Retrieved the exact invalid-signature response and verified the replacement `alumnai` token with HTTP 200.
- ✅ Completed production builds after the final environment, proxy, and token changes.
- ✅ Fendy committed the changes in `1060f85` and `c127164`.

## Quick Context for Next Session
- **Where We Left Off**: Ready for a real lookup after restarting `ng serve`.
- **What's Working**: Local proxy routing, production service-worker bypass, accepted `alumnai` token, and production compilation.
- **What Needs Attention**: Real user lookup confirmation, deployed production verification, recurring 504 investigation, and eventual removal of bearer credentials from the public Angular bundle.

---
*Session updated: 2026-09-11 12:32*
