# NILAM — System Instruction

**Repo path:** `~/Sites/Nilam`
**Stack:** Laravel 8.x, PHP, MySQL, Bootstrap 4 (Skote theme)
**Purpose:** MOU/MOA agreement lifecycle management system for UiTM

---

## Commands

```bash
# Install dependencies
composer install
npm install

# Setup
cp .env.example .env
php artisan key:generate
php artisan migrate:refresh --seed

# Frontend assets
npm run dev          # development build
npm run watch        # watch mode
npm run prod         # production build

# Tests
php artisan test
php artisan test tests/Unit/ExampleTest.php
./vendor/bin/phpunit --filter ExampleTest

# Add CRUD permissions for a new model
php artisan auth:permission ModelName
# Remove permissions
php artisan auth:permission ModelName --remove
```

---

## Architecture

### Application Workflow
`Application` (MOU/MOA submission) → vetting (`VettingController`) → MEU committee approval (`MeuApprovalController`) → LPU board approval (`LpuApprovalController`) → signing → activity monitoring (`ActivityController`).

Each stage tracked via `application_status_id` and `document_status_id`.

### Authentication
UiTM SSO OAuth2 (`/auth/ssoweb`) via `league/oauth2-client`. Google OAuth (`/redirect`) is secondary. Self-registration disabled. Users created/synced from SSO response including department info.

### Authorization
Two-layer system:
1. **`spatie/laravel-permission`** — permission names follow `{action}_{plural_model}` (e.g. `view_applications`, `add_applications`, `edit_applications`, `delete_applications`)
2. **`App\Authorizable` trait** — include `use Authorizable;` in every resource controller. Auto-calls `$this->authorize()` before each method by mapping HTTP verbs to permission names.

Application ownership: `App\Policies\ApplicationPolicy`

**Roles:** Admin, Legal Advisor, Assistant Superadmin, PIC, Applicant, Drafter/Vetter, LPU Secretariat, MEU Secretariat

### Adding a New Resource
```bash
php artisan make:model Comment -mcr
php artisan auth:permission Comment
```
Register route inside `auth` middleware group in `routes/web.php`. Add `use Authorizable;` to the controller.

### Models
- All use `SoftDeletes` — never hard delete
- All `belongsTo()` use `->withDefault()` to avoid null pointer errors
- Date inputs (`signing_date`, `aggmt_st_date`, etc.) use `d/m/Y` format, converted via mutators with `Carbon::createFromFormat('d/m/Y', $value)`
- `Application` and similar models auto-set `created_by`/`updated_by` in `boot()` via model events

### Controllers & API
- `ApiController` — all modal content (partner create/edit/search, application assign/decline) and Select2 AJAX endpoints
- DataTables via `yajra/laravel-datatables-oracle`; controllers return `DataTables::of(...)` when `$request->ajax()` is true
- `App\Traits\DepartmentHelper::createOrFindDepartment()` — always use this instead of raw `Department::create()` or `firstOrCreate` to avoid soft-delete duplicates

### Frontend
- **Skote** Bootstrap 4 admin theme
- Third-party libs (jQuery, DataTables, Select2, SweetAlert2) bundled via Laravel Mix → `public/assets/libs/{name}/{name}.min.js|css`
- App SCSS in `resources/scss/` → `public/assets/css/`
- Custom JS in `resources/js/` → `public/assets/js/`. Page-specific scripts in `resources/js/pages/`
- Form rendering uses `bgaze/bootstrap-form` blade helpers (e.g. `@text(...)`, `@select(...)`, `@open(...)`, `@close`, `@submit(...)`)
- Sidebar menu built via `MenuServiceProvider` using `spatie/laravel-menu` macros

### Document Generation
- PDFs via `barryvdh/laravel-dompdf`
- Word docs via `phpoffice/phpword`
- Templates stored in `templates` table, rendered per application

### Database
- Table prefix: `tbl_` (e.g. `tbl_applications`, `tbl_application_statuses`)
- DB host (production): `antartika.uitm.edu.my`, database: `nilams`
- Key status slugs:
  - `submit-for-lpu-notified` — LPU Notification track (`lpu_approval = 0`)
  - `submit-for-lpu-approval` — LPU Approval track (`lpu_approval = 1`)
  - `submit-for-meu-approval`, `assigned-draftervetter`, `final-draft`, `executed-document`

---

## Notes
- `.github/copilot-instructions.md` is intentionally NOT committed to git — this file serves as the canonical instruction reference
- Instructions stored here: `~/Sites/jiraiya/Repo-instruction/nilam.md`
