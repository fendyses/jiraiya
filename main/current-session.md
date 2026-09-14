# Current Session Memory - 2026-09-14
*Global pointer to the latest session — full recap lives in the repo folder*

## Session Context
**Session Type**: Work — debugging, diagnosis, and UI restructure
**Current Project**: MyAlumniCard (slug: `myalumni-angular`)
**Repo**: `/Applications/Sites/myalumni-angular` (UiTM)
**Status**: Complete — all work committed, tree clean, production build passing
**Time**: Updated 16:22 GMT+8

## Latest Session
Full recap: **`projects/myalumni-angular/session.md`**

Restored `ng serve`, which was failing because `jspdf`, `html2canvas`, and
`@ng-select/ng-select` sat in `package.json` and the lockfile but never landed in
`node_modules` — their three `Module not found` errors were hidden under roughly a
hundred downstream `NG8001` template errors. Diagnosed the broken production benefit
images as split-horizon DNS plus Chrome Private Network Access rather than an app bug:
`cdn.uitm.edu.my` resolves to `10.0.21.69` on the UiTM network but `202.58.84.29`
publicly, so only on-campus viewers of the public production origin are affected.
Rebuilt the `/admin` Hot Seat Count table — three duplicated table blocks collapsed
into one loop, the hardcoded DATC venue removed from the data path, per-venue subtotals
and column alignment added. Two self-inflicted defects were caught by Fendy in the
browser: unstyled subtotal badges from SCSS nesting scope, and a production CSS budget
failure missed by verifying with a development build.

## Quick Context for Next Session
- **Where We Left Off**: `1ec7d93`, `7fff3b5`, `8e4f3bd` committed; tree clean.
- **What's Working**: `ng serve`, production build with no warnings, the rebuilt Hot Seat table.
- **What Needs Attention**: Confirm benefit banner hostnames and decide proxy vs Firebase Storage; confirm whether hot seat splitting should apply to all venues or DATC only; bearer tokens still ship in the public bundle.
- **Note**: `main/repos.md` → Active Repo still says NRHome while this session's work was entirely MyAlumniCard.

---
*Session updated: 2026-09-14 16:22*
