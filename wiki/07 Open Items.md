# Open Items

← [[00 Home]]

Known pending work. Check here before asking "what's left?"

---

## 1. research.html → data-driven

**Priority: high — this is the main architecture gap.**

`projects.json` and `posters.json` exist and are well-structured, but `docs/sections/research.html` is hand-authored HTML that duplicates them. Adding a new project or poster requires editing both the JSON and the HTML by hand.

**Fix:** extend `tools/site_builder.py` to render `research.html` from these two files, using the same pattern as `experience.html`. Add `"status": "published" | "in_progress"` to the `projects.json` schema to replace the hardcoded in-progress block in the current HTML.

**Unblocks:** once done, update `cv_assets/cv_tailor_core.md` Phase 1 to read `projects.json` and `posters.json` directly instead of parsing `research.html`. This removes HTML noise from the CV skill's profile fetch.

---

## 2. Codex overhead for /tailor-cv

`.vscode/tailor-cv.md` (VS Code Copilot / Codex overhead) not yet written.

**Blocked on:** confirming whether VS Code Copilot `@workspace` is the correct invocation method.

**Fix:** once confirmed, write `.vscode/tailor-cv.md` using the same thin-wrapper pattern as `.claude/skills/tailor-cv.md` — just tool mapping + pointer to `cv_assets/cv_tailor_core.md`.

---

## 3. CV PDF not wired to site

CV button in hero section links to `under_construction.html`.

**Decision needed:** a canonical single-page CV (not application-specific) needs to be committed to `docs/assets/pdfs/` and linked from the hero. Application-specific CVs in `cv_assets/cv/` are gitignored and stay local.

---

## 4. profile.tex at root is legacy

`profile.tex` at the repo root is an old standalone LaTeX file. The active CV workflow is now `/tailor-cv` + `cv_assets/`. Can be deleted when no longer useful as a reference.

---

## 5. Works review items (from previous session)

Flagged in a previous session: "Works review, commit, orphaned files, group photos, CV PDF." Some may be resolved. Verify against current state.
