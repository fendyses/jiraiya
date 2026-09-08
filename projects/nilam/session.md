# Nilam — Session Memory
*Last updated: 2026-09-08*

## Session Context
**Session Type**: Work
**Current Project**: Nilam (slug: `nilam`) — `/Applications/Sites/nilam` — UiTM
**Status**: Complete, staged and awaiting review/deploy
**Time**: Morning session, through 10:49 GMT+8

## Current Focus
Built and refined the returned-to-PIC missing-attachment recovery workflow for Main and Supporting Documents.

## Working Memory

### Active Context
- Recovery is available only for returned applications and only to the application owner or assigned PIC.
- A missing main attachment gates the recovery area. Supporting-only gaps do not show it.
- Existing local or confirmed MinIO files cannot be replaced; storage-check failures are treated as unknown and blocked.
- Main files accept `.doc`/`.docx`; supporting files accept `.doc`, `.docx`, `.pdf`, `.jpg`, `.jpeg`; each file is limited to 100 MB.
- PUU monitoring changes remain unstaged and must stay separate.

### Recent Progress
- Added repeatable Main and Supporting recovery forms with original-style Document, Name, and Document Type fields.
- Added client-side Add/Delete row behavior and server-side batch validation with atomic preflight checks.
- Added required markers to Main fields only; Supporting Documents remain optional.
- Restored original document-type dropdown lists while disabling types that already have files.
- Removed the blank Main Document default from create/edit forms and selected the first valid type.
- Seeded development application 3553 with Zamzunita as vetter and Saiful Effendy as PIC; removed its four attachment records while preserving its returned-to-PIC vetting record.

### Important Decisions
- Recovery sections are controlled by missing Main Documents because a supporting document is optional.
- Supporting uploads remain a separate optional batch, so PIC can skip them and still restore required Main Documents.
- Document types remain application-type-specific; the recovery form does not substitute Drafting types for Vetting types.

## Session Recap (For AI Restart)
The Nilam attachment-recovery feature is implemented and staged. It mirrors the original upload UI, validates missing-only files, preserves existing attachments, and has 20 passing feature tests. Application 3553 in `nilamsdev` is a returned-to-PIC test fixture with no active original attachment records and one preserved vetting record.

## Session Achievements
- ✅ Added guarded missing Main/Supporting attachment recovery.
- ✅ Added repeatable upload rows and original-style dropdowns.
- ✅ Added missing-main gate and optional Supporting behavior.
- ✅ Added required-field indicators for Main fields only.
- ✅ Removed blank Main Document defaults from create/edit forms.
- ✅ Verified 20 tests and the browser row-interaction checks.
- ✅ Staged attachment-recovery changes while leaving PUU monitoring unstaged.
- ✅ Prepared development application 3553 for end-to-end testing.

## Quick Context for Next Session
- **Where We Left Off**: Review/deploy the staged Nilam attachment-recovery changes.
- **What's Working**: Recovery UI, validation, storage protection, dropdown behavior, and test fixture.
- **What Needs Attention**: Deployment and final live-environment verification.

---
*Session updated: 2026-09-08 10:49*
