# Site Context

This file is the fast handoff for future Codex threads working on this site.

Read this first before making changes.

## Purpose

This repo contains a static personal portfolio site for Mohammed Bilal P S, focused on quantum control, physics, and related research/technical work.

The site is built as a single-page experience with a custom "page engine" that transitions between full-screen sections. Some research-related routes intentionally lead to an under-construction page.

## Start Here

If you are new to this repo, inspect these files first:

1. [docs/index.template.html](/Users/billabobz/Web_space/docs/index.template.html)
2. [docs/sections/hero.html](/Users/billabobz/Web_space/docs/sections/hero.html)
3. [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js)
4. [docs/css/style.css](/Users/billabobz/Web_space/docs/css/style.css)
5. [tools/build_index.py](/Users/billabobz/Web_space/tools/build_index.py)

## Repo Layout

- [docs/index.template.html](/Users/billabobz/Web_space/docs/index.template.html): top-level HTML shell with `{{SECTIONS}}` placeholder.
- [docs/sections](/Users/billabobz/Web_space/docs/sections): source-of-truth HTML partials for each page section.
- [docs/index.html](/Users/billabobz/Web_space/docs/index.html): generated output assembled from the template and section partials.
- [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js): page engine, theme switching, avatar rotation, cursor effects, navigation, toast behavior, and section transitions.
- [docs/css/style.css](/Users/billabobz/Web_space/docs/css/style.css): the main styling file for the site. This file is large and central.
- [docs/under_construction.html](/Users/billabobz/Web_space/docs/under_construction.html): standalone fallback page for unfinished areas.
- [docs/posters.html](/Users/billabobz/Web_space/docs/posters.html): standalone poster-detail page for abstract-first research presentation content.
- [docs/assets/images](/Users/billabobz/Web_space/docs/assets/images): image assets used by the site.
- [tools/build_index.py](/Users/billabobz/Web_space/tools/build_index.py): simple builder that concatenates section partials into `docs/index.html`.
- [local_run.sh](/Users/billabobz/Web_space/local_run.sh): local preview helper that rebuilds then serves the site on port `2026`.
- [profile.tex](/Users/billabobz/Web_space/profile.tex): source CV in LaTeX; not currently wired into a present PDF artifact in `docs/`.

## Source Of Truth

Important rule: do not treat [docs/index.html](/Users/billabobz/Web_space/docs/index.html) as the main editing target unless there is a specific reason.

Normally edit:

- [docs/index.template.html](/Users/billabobz/Web_space/docs/index.template.html)
- [docs/sections/*.html](/Users/billabobz/Web_space/docs/sections)
- [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js)
- [docs/css/style.css](/Users/billabobz/Web_space/docs/css/style.css)

Then rebuild:

```bash
python3 /Users/billabobz/Web_space/tools/build_index.py
```

## Page Map

The builder includes section partials in this order:

1. `hero.html`
2. `about.html`
3. `philosophy.html`
4. `experience.html`
5. `education.html`
6. `research.html`
7. `current-research.html`
8. `contact.html`

These correspond to the page engine indexes:

- `0`: hero / home
- `1`: about
- `2`: philosophy
- `3`: experience
- `4`: education
- `5`: research
- `6`: current research
- `7`: contact

## Navigation Behavior

The site uses a full-screen section transition model instead of normal long-scroll navigation.

Relevant behavior in [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js):

- Theme preview buttons set `data-theme` on the root element.
- Avatar image is chosen from a small local pool and persisted in `localStorage`.
- Navigation dots and prev/next arrows are built and controlled in JS.
- Keyboard, wheel, and touch gestures are used for section navigation.
- Pages with indexes `5` and `6` currently redirect to `under_construction.html`.

This means there are two different concepts present at once:

- The site structurally contains research and current research sections.
- The runtime intentionally blocks direct navigation to those pages and sends users to the under-construction page instead.

Future work should decide whether to keep that redirect or expose the sections directly.

Poster-style research pages can live as standalone documents under `docs/` when they need more vertical reading space than the section engine provides.

## Build And Preview

Manual build:

```bash
python3 /Users/billabobz/Web_space/tools/build_index.py
```

Local preview:

```bash
/Users/billabobz/Web_space/local_run.sh
```

What `local_run.sh` does:

1. Changes into the repo root.
2. Rebuilds `docs/index.html`.
3. Starts `python3 -m http.server` on port `2026`.
4. Opens `http://localhost:2026/docs/index.html`.

Note: `local_run.sh` is currently ignored in `.gitignore`.

## Assets

Current image assets live under [docs/assets/images](/Users/billabobz/Web_space/docs/assets/images), including:

- `avatar_1.png`
- `avatar_2.png`
- `avatar_about.png`
- `avatar_experience.png`
- `avatar_philosophy.png`
- `avatar_research.png`
- `under_construction.png`

The hero avatar pool in JS currently uses only:

- `assets/images/avatar_1.png`
- `assets/images/avatar_2.png`

## External Dependencies

The site depends on external CDNs for:

- Google Fonts
- Font Awesome
- GoatCounter analytics

These are referenced directly in HTML and are not vendored locally.

## Known Issues And Current State

These are important current observations from the repo as inspected on May 11, 2026:

- `profile.pdf` is referenced in the hero CTA, but no `profile.pdf` file exists in the repo file list that was inspected. This is likely a broken download link unless the file is generated or supplied elsewhere.
- Research-related nav remains partially represented in markup, but runtime JS redirects page indexes `5` and `6` to [docs/under_construction.html](/Users/billabobz/Web_space/docs/under_construction.html).
- [docs/index.html](/Users/billabobz/Web_space/docs/index.html) is a generated file and can drift if someone edits it directly without rebuilding from section partials.
- The repo had a dirty worktree during inspection, including modifications to `.gitignore`, CSS, JS, template, and generated HTML, plus deletions of some older avatar files under `docs/`.

Before making broader changes, inspect current git status so you do not overwrite user work.

## Editing Rules For Future Threads

When changing content:

- Prefer editing the relevant file in [docs/sections](/Users/billabobz/Web_space/docs/sections).
- Rebuild `docs/index.html` afterward.

When changing layout or component visuals:

- Prefer [docs/css/style.css](/Users/billabobz/Web_space/docs/css/style.css).

When changing navigation, page transitions, theme logic, redirects, or local storage behavior:

- Edit [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js).

When changing global shell HTML:

- Edit [docs/index.template.html](/Users/billabobz/Web_space/docs/index.template.html).

When changing the standalone unfinished-state page:

- Edit [docs/under_construction.html](/Users/billabobz/Web_space/docs/under_construction.html).

## Suggested First Checks In A New Thread

Run these first:

```bash
git -C /Users/billabobz/Web_space status --short
python3 /Users/billabobz/Web_space/tools/build_index.py
```

Then inspect:

- [docs/index.template.html](/Users/billabobz/Web_space/docs/index.template.html)
- [docs/js/main.js](/Users/billabobz/Web_space/docs/js/main.js)
- [docs/css/style.css](/Users/billabobz/Web_space/docs/css/style.css)
- the specific section partial being changed in [docs/sections](/Users/billabobz/Web_space/docs/sections)

## Open Questions

These are unresolved and worth confirming before future edits:

- Should the research and current research sections remain hidden behind the under-construction redirect?
- Should `profile.tex` produce a committed PDF in `docs/`, or should the hero CTA point somewhere else?
- Should the context file be updated manually after major structural changes, or should that become part of the normal workflow?

## Maintenance Note

If the site structure, build flow, asset locations, or routing model changes, update this file in the same change set so future threads do not start from stale assumptions.
