# Current Session Memory - 2026-07-03
*Active working memory for current conversation*

## Session Context
**Session Type**: Work (Feature + Bugfix + UI polish)
**Current Project**: Sakura CLI (`/Applications/Sites/jiraiya/sakura/`)
**Status**: Wrapping up — task complete, diary saved
**Time**: 2026-07-03 (afternoon, 15:11)

## Current Focus
- **Primary Task**: Fixed per-model tool-calling detection (some Groq/OpenRouter models genuinely don't support it), then a run of UI follow-ups: agentic star marker, full color palette, boxed picker matching the banner, progressive widening to 120 columns
- **Technical Context**: Node.js CLI (`sakura.js`), capability detection via provider metadata (`supported_features`/`supported_parameters`), shared color/box-drawing helpers with visible-width-aware padding
- **Progress**: Complete — all asks implemented and verified live (real API calls, real pty terminal tests, byte-level alignment checks)

## Working Memory
### Active Context
- **Current Topic**: Sakura CLI — tool-capability honesty, banner/picker visual design
- **Immediate Goals**: Done for this session
- **Recent Progress**:
  - Diagnosed why `groq/compound-mini` "cannot read files": Groq's own `supported_features` metadata confirms it (and `groq/compound`, `allam-2-7b`) genuinely lack tool-calling support — a real platform limitation, not a bug
  - Rewired model discovery to capture `supportsTools` per model (from Groq's `supported_features` / OpenRouter's `supported_parameters`) instead of guess-and-retry
  - Split system prompt into tools/no-tools variants (`systemFor(activeSupportsTools)`) so the model is never told it has capabilities it doesn't have this turn — fixed the earlier hallucination bug at the root, not just the crash
  - Verified live: switching to `groq/compound-mini` now shows an immediate warning, and asking it to read a file gets an honest refusal instead of fabricated content
  - Redesigned `models` picker to render as the same bordered box as the startup banner (was a plain bullet list before), redrawn in place — verified via raw cursor-reposition escape codes in the byte stream, not just visual inspection
  - Added `★` marker for agentic-capable models; reassigned the pre-existing "active model" indicator from `★` to `❯` to resolve a symbol clash
  - Built a shared `CLR` color palette + `visLen()`/`padVisible()` helpers (pad/clip on visible width, colorize after) so ANSI codes never break box alignment
  - Widened the shared table progressively: 80 → 96 → 120 columns, refactored into one `BOX_W` constant used by both banner and picker so they can't drift apart
  - Verified alignment integrity at each width with a byte-level check (0 misaligned lines across 136 bordered lines)

### Important Decisions
- Kept the earlier no-tools-retry fallback as a safety net even after adding proper upfront capability detection, in case provider metadata is ever stale/wrong
- Chose `❯` for "active model" and reserved `★` exclusively for "agentic-capable" — one symbol, one meaning, in both banner and picker

## Session Recap (For AI Restart)
- **This session (2026-07-03)**: Continued Sakura CLI work. Fixed the root cause of "can't read files" on certain Groq models (no tool-calling support, detected via provider metadata, with an honest system-prompt fallback instead of hallucination). Then handled a rapid sequence of UI polish requests: agentic star marker, full color palette, picker redesigned to match the banner's bordered-box style, and progressive widening from 80 to 120 columns — all verified live via pty tests and byte-level alignment checks, not just visual inspection.
- **Where We Left Off**: All requested work complete and verified. Still outstanding from earlier today: user should rotate `OPENROUTER_API_KEY` and `GROQ_API_KEY` (exposed earlier in the transcript) — not yet confirmed done.
- **Important Context**: `sakura.js` now has `BOX_W` as a single source of truth for table width, and `CLR`/`visLen`/`padVisible` as shared color/alignment helpers — any future banner/picker tweaks should reuse these rather than reintroducing local width constants.

## Session Achievements
- ✅ Diagnosed and fixed why certain Groq models (`groq/compound`, `groq/compound-mini`, `allam-2-7b`) couldn't use file tools — genuine platform limitation, now detected via provider metadata
- ✅ Fixed the hallucination root cause: system prompt no longer claims capabilities a model doesn't have that turn
- ✅ Verified honest refusal behavior live (no more fabricated file contents)
- ✅ Redesigned the `models` picker to match the startup banner's bordered-box style, redrawn in place
- ✅ Added unambiguous `★` (agentic) vs `❯` (active) markers with an on-screen legend
- ✅ Built a reusable color palette + alignment-safe padding system
- ✅ Widened the shared table to 120 columns via one `BOX_W` constant, verified zero misalignment

## Quick Context for Next Session
- **Where We Left Off**: Sakura CLI's banner and picker are now colorized, 120 columns wide, and share all layout logic; tool-calling support is accurately detected and honestly communicated per model
- **What's Working**: Everything tested this session — model switching, honest no-tools handling, picker redraw, color/alignment at 120 cols
- **What Needs Attention**: User should still rotate the two exposed API keys (OpenRouter, Groq) from earlier today — not yet confirmed done

---
*Session updated: 2026-07-03 15:11*
