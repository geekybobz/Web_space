# Change Preview Protocol

← [[00 Home]]

Use this protocol for every Web_space UI, content, route, behavior, design, or styling request.

The goal is simple: understand the requested idea, make the change in the right source files, preview it through the project's real hosting path, and return the exact `webspace` command the user should copy-paste.

---

## 1. Read Context First

Before planning or editing, read:

- `SITE_CONTEXT.md`
- `wiki/00 Home.md`
- `wiki/03 Web Layer.md`
- `wiki/04 Build System.md`
- `wiki/05 Dev Workflow.md`
- the source files for the requested area

Always run:

```bash
git status --short
```

If the worktree is dirty, assume existing changes belong to the user or a previous task. Do not revert them.

---

## 2. Intake

For unclear or design-heavy requests, first extract the user's idea.

Clarify only what materially affects the result:

- What should change?
- What should stay unchanged?
- Is this a small fix, section redesign, homepage redesign, new route, or experiment?
- Should the result replace the current page, or be shown as a temporary preview/branch first?
- Is desktop-only acceptable, or does mobile need validation?

Do not ask unnecessary questions for small obvious fixes. State the assumption and proceed.

---

## 3. Choose the Work Mode

Classify the change before editing.

| Change type | Default mode |
|---|---|
| Small text/content/style fix | Current checkout is fine |
| Medium UI behavior or section change | Current checkout or branch, depending on user intent |
| Homepage redesign, navigation change, route change, or visual experiment | Branch preview preferred |
| Risky idea where the user wants to compare options | Temporary route or branch preview |

For branch work, prefer:

```text
codex/<short-slug>
```

unless the user gives a branch name.

Branch switching is blocked by dirty worktrees. If dirty, do not switch silently. Report the dirty state and either continue on the current checkout or ask whether to commit/stash/switch.

---

## 4. Design Gate

Before substantial visual or routing edits, give a short design gate:

- intended user-visible result
- source files likely to change
- whether the preview will be current checkout, branch, or temporary route
- acceptance checks
- exact preview command expected at that moment

For simple fixes, the design gate can be one concise sentence.

---

## 5. Source-Only Editing

Never edit generated files directly.

Edit these sources instead:

- `docs/index.template.html`
- `docs/sections/*.html`
- `docs/css/src/**/*.css`
- `docs/js/src/**/*.js`
- `docs/data/*.json`
- `docs/templates/*.html`

Generated files are rebuilt by `tools/build_index.py` through `webspace` or the build script.

Source-of-truth reminders:

| Generated file | Edit this instead |
|---|---|
| `docs/index.html` | `docs/index.template.html` + `docs/sections/*.html` |
| `docs/css/style.css` | `docs/css/src/**/*.css` |
| `docs/js/main.js` | `docs/js/src/**/*.js` |
| `docs/sections/experience.html` | `docs/data/experience.json` |
| `docs/gallery-*.html` | `docs/data/galleries/gallery-*.json` |
| `docs/under_construction.html` | `docs/data/under_construction.json` + `docs/templates/under_construction.template.html` |

---

## 6. Fully Functional Preview Rule

A preview must be functional, not just a mock screenshot.

For homepage or shell changes:

- nav links must still work
- page dots/page engine must still work
- all existing pages should remain reachable
- CV, external links, and PDF links should not be broken
- local preview panel should still load under `?localPreview=1`

For temporary routes:

- use a real browser-loadable route under `docs/`
- include the same CSS/JS bundles or a deliberate scoped preview bundle
- connect navigation enough for the user to inspect the experience naturally
- return the exact route URL in the final response

Prefer a branch preview over a temporary route for whole-homepage or global-shell changes. It keeps the real site structure intact while allowing safe comparison.

---

## 7. Rebuild and Preview

Use `webspace` for hosting. Do not spin up manual servers.

Preview URL:

```text
http://localhost:2026/docs/index.html?localPreview=1
```

`webspace` handles:

- rebuild with cache-busting
- server lifecycle on port `2026`
- opening the local preview URL

Useful commands:

```bash
webspace current
webspace main
webspace branch <branch-name>
webspace status
webspace stop
```

---

## 8. Always Return the Correct Command

Do not blindly return `webspace current`.

Return the command that matches the actual way the user should preview the work.

| Final state | Return this |
|---|---|
| Work is on the current checkout | `webspace current` |
| User should preview `main` | `webspace main` |
| User should switch to and preview an existing branch from a clean checkout | `webspace branch <branch-name>` |
| A new branch was created and is already checked out | `webspace current` |
| User may later come from another clean branch to the created branch | also mention `webspace branch <branch-name>` |
| Worktree is dirty and branch switching is blocked | explain the blocker; do not provide a misleading branch command |
| User only asked to inspect server state | `webspace status` |
| User asked to stop preview | `webspace stop` |

Example for new branch work:

```bash
git switch -c codex/homepage-redesign
webspace current
```

If the branch already exists and the worktree is clean:

```bash
webspace branch codex/homepage-redesign
```

---

## 9. Validation

Before final response, verify what changed.

Minimum checks:

- build completed
- desktop preview loads
- no direct generated-file-only edits
- expected route/page renders
- relevant interaction works
- no relevant app console errors

For visual work:

- inspect the rendered browser result
- include screenshot evidence when useful
- check for overlap, clipping, unreadable text, broken transitions, broken nav, and stale assets

Mobile is optional only when the request is explicitly desktop-only.

---

## 10. Final Response

End with:

- what changed
- files changed
- what was tested
- exact copy-paste `webspace` command
- preview URL or temporary route URL
- remaining risks or untested items

Use this shape:

````md
Changed:
- ...

Tested:
- ...

Preview command:
```bash
webspace current
```

Preview URL:
```text
http://localhost:2026/docs/index.html?localPreview=1
```
````

The preview command must be chosen from the real final state, not from habit.

## Related

- [[03 Web Layer]] — routes, sections, local preview panel
- [[04 Build System]] — source-of-truth and generated files
- [[05 Dev Workflow]] — `webspace` command behavior
