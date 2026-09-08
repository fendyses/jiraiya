# Kad Prihatin Siswa — Session Memory
*Last updated: 2026-09-02*

## Session Context
**Session Type**: Work
**Current Project**: Kad Prihatin (slug: `kadprihatin-siswa`) — `/Applications/Sites/kadprihatin-siswa` — UiTM
**Status**: Complete, committed and pushed by Fendy (`031b243`, `99fc371`)
**Time**: Evening session, ~19:55–21:18 GMT+8

## Current Focus
First ever session on this repo — cloned today. Registered it in the JIRAIYA registry,
fixed dead Google OAuth, built admin impersonation, reworked the users table, made the
DB connection host-aware, and redesigned the login page. Every change verified against
the live local site at `https://kps.es`.

## Working Memory

### Active Context
- Branch `main`. Fendy also merged to `production` (`7fe8215`), which is what triggered
  the failing `publish to docker` job.
  Fendy committed and pushed mid-session: `031b243` (14 files: OAuth, impersonation,
  users table, config, test.php deletion, .gitignore) and `99fc371` (index.php redesign).
  `main` is the dev branch, so this is already deployed to `kps-training`.
- Stack: plain PHP 8.3, **no framework** (Guzzle + DataTables only), `mysqli`, role
  folders `maker/checker/viewer/admin/superadmin`. Remote `git.uitm.edu.my/apprentice/kadprihatin-siswa`.
- Local host is **`kps.es`** via ServBay (nginx vhost → this folder). Cert is ServBay's
  own private CA, so `curl` needs `-k`.
- **DB is reachable from this machine**: `10.0.26.121` / `spkps` / db `spkps`. 91 users,
  86 active + 5 inactive. `users.username` is `int(11)`; `users.role_id` is `varchar(20)`.
  Roles: 1 Maker, 2 Checker, 3 Viewer, 4 Admin, 5 Super Admin.
- **`grep` in this shell is a function that honours `.gitignore`** — it silently skipped
  `login/config.php` and `login/login.php` all session. Use
  `find . -name "*.php" -exec command grep -Hn ... {} \;` in this repo.
- Production deploy = `docker run` with **no `-e` flags** (see `.gitlab-ci.yml`), so no
  environment variables exist on the server at all.

### Recent Progress
- **OAuth fixed.** `google-oauth.php` read creds via `getenv()`; nothing populated the
  FPM environment. Added `servbayConfigValue()` parsing `.servbay.config`, kept behind
  `getenv()` so Docker/production are unchanged. Verified: `login.php` now 302s to
  `accounts.google.com` instead of bouncing to `../index.php`.
- **Impersonation built.** `login/impersonate.php`, `login/leave-impersonate.php`,
  `etc/impersonate-bar.php` wired into all 5 sidebars, button in the users table.
  Verified live: impersonate → maker sidebar, admin pages blocked, leave → identity
  restored. Guards confirmed blocking: nested, non-admin, logged-out, admin→superadmin,
  self, `?username=1 OR 1=1`, inactive.
- **Users table** reworked: equal-width stacked buttons, Name/Picture header-body swap
  corrected, Email + Phone merged into `Contact`, picture before name, Impersonate
  disabled for inactive accounts, Operations excluded from CSV/PDF (`.no-export` class +
  a body formatter turning `<br>` into ` / `).
- **`config.php` host-aware**: `kps.uitm.edu.my` → **`antartika.uitm.edu.my`**,
  `kps-training.uitm.edu.my` and `kps.es` → `10.0.26.121`, unknown/CLI → dev.
  Governs all 72 pages. Fendy corrected the production target from the IP
  `10.0.13.175` to the hostname in `67126e2` — the hostname is the correct one for
  prod. **`antartika.uitm.edu.my` is the same DB server Nilam uses.**
- **Deleted `login/test.php`** — the only file bypassing `config.php`. Removed both stale
  `.gitignore` entries.
- **Login page redesigned** — glassmorphism, animated brand orbs, real Google mark.
  Also fixed a favicon path pointing above the docroot and invalid `<a><button>` nesting.

### Important Decisions
- **Admin cannot impersonate a Super Admin** (role 4 → role 5 blocked); a Super Admin can
  impersonate anyone. Prevents privilege escalation.
- **Inactive accounts cannot be impersonated** — mirrors the login check in
  `google-callback.php`. UI shows the button disabled rather than hidden.
- **Unknown host falls back to dev, never production** — a dev box writing to prod is far
  worse than the reverse.
- **Export column filtering keyed on a `.no-export` class, not a column index** — survives
  the DataTables colvis show/hide feature.
- **Credentials stay inline in `config.php`** at Fendy's explicit request; no `.env`.

## Session Recap (For AI Restart)
First session on a repo cloned the same day, so there was no prior memory. Google sign-in
was dead because `getenv()` never sees `.servbay.config`; fixed with a file fallback that
is also what will make OAuth work in production, since the Docker deploy sets no env vars.
Built and verified a full admin impersonation mode. Reworked the users table over several
rounds of feedback. Replaced the commented dev/prod DB toggle with host-based selection.
All of it was committed and pushed by Fendy during the session.

## What Needs Attention
- **`publish to docker` CI job fails**: `Cannot connect to the Docker daemon at
  tcp://docker:2375`. Only the `production` branch runs it (runner `DockerD3-runner`);
  the dev job is a plain `git pull` on a `development`-tagged shell runner with no dind,
  which is why dev pipelines stay green. The job had not run since **24 Dec 2025**.
  Fix staged locally in `.gitlab-ci.yml` (`DOCKER_TLS_CERTDIR: ""`, `DOCKER_HOST`,
  pinned `docker:27` / `docker:27-dind`) but **not committed**. If the runner already
  sets `DOCKER_TLS_CERTDIR=""`, the real cause is the runner not being `privileged`
  — check the collapsed `docker:dind` service section in the job log.
- **`.git` is downloadable over HTTP** — `/.git/config`, `/.git/HEAD`, `/.git/packed-refs`
  all return 200, enough to reconstruct full source + history including DB and Google
  credentials. `COPY . /var/www/html` had no `.dockerignore`. Fix staged locally
  (`.dockerignore` + an Apache deny-dotfiles conf in the `Dockerfile`), **not committed**,
  and never tested in a built image because the local Docker daemon was off.
- **`.servbay.config` is downloadable over HTTP** — `curl https://kps.es/.servbay.config`
  returns 200 with the Google client secret in plaintext. No `.dockerignore`, so it ships
  in the image and will be public on `kps.uitm.edu.my` after the next push.
- **Reverse-proxy Host risk** — production runs in a container on port 7001. If the proxy
  does not preserve the original `Host`, `config.php` falls through to the **dev database**
  silently. Offered a fail-loud variant; Fendy has not decided.
- **`kps-training.uitm.edu.my` SSL expired 24 Aug 2024** (Sectigo). Production was reissued
  to SSL.com in July 2026 (valid to 8 Feb 2027) but training was never updated, and serves
  only the leaf with no intermediate. Needs infra team.
- **Register `https://kps.uitm.edu.my/login/google-callback.php`** as an authorised redirect
  URI on client `431891505865-…`, or production OAuth fails `redirect_uri_mismatch`.
- **`.gitlab-ci.yml` may be stale** — it describes the dev deploy as `git pull` with Docker
  gated to `production`; Fendy says both branches auto-build Docker.
- Login page never visually confirmed on a real phone (browser resize did not apply).

---
*Session updated: 2026-09-02 21:18*
