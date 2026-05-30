# Site Context

This file is the fast handoff for future threads working on this site.

Read this first before making changes.

## Purpose

This repo contains a static personal portfolio site for Mohammed Bilal P S, focused on quantum control, physics, and related research/technical work.

The site is built as a single-page experience with a custom "page engine" that transitions between full-screen sections.

## Start Here

If you are new to this repo, inspect these files first:

1. `docs/index.template.html` — top-level HTML shell with `{{SECTIONS}}` placeholder
2. `docs/sections/hero.html` — first section partial
3. `tools/build_index.py` — orchestrator: runs renderers, bundles assets, assembles index.html
4. `tools/site_builder.py` — renders experience section and gallery pages from JSON data
5. `tools/build_assets.py` — bundles CSS src files → style.css, JS src files → main.js

## Repo Layout

```
docs/
  index.template.html      — HTML shell (edit this, not index.html)
  index.html               — generated output, do not edit directly
  sections/                — source HTML partials for each page section
  data/                    — JSON data sources for generated sections
    experience.json        — drives experience section + standalone gallery page
    galleries/             — drives gallery-*.html prototype pages
    under_construction.json
  css/
    src/                   — source CSS modules (edit these)
    style.css              — generated bundle, do not edit directly
    gallery.css            — generated bundle for gallery pages
    under-construction.css — generated bundle for under_construction page
  js/
    src/                   — source JS modules (edit these)
    main.js                — generated bundle, do not edit directly
    under-construction.js  — generated bundle for under_construction page
  assets/
    images/                — web-ready image assets
    pdfs/                  — PDF downloads
  templates/
    under_construction.template.html
  gallery-experience-review-d.html  — generated standalone experience page
  gallery-*.html           — generated gallery prototype pages
  under_construction.html  — generated from template + data
tools/
  build_index.py           — main build orchestrator (run this to rebuild)
  build_assets.py          — CSS/JS bundler
  site_builder.py          — HTML renderer for data-driven pages
  render_under_construction.py
  local_preview_server.py  — local only, not committed
local_run.sh               — local only, gitignored
```

## Source Of Truth

**Never edit generated files directly.** Always edit the source and rebuild.

| Generated file | Source to edit |
|---|---|
| `docs/index.html` | `docs/index.template.html` + `docs/sections/*.html` |
| `docs/css/style.css` | `docs/css/src/**/*.css` |
| `docs/js/main.js` | `docs/js/src/**/*.js` |
| `docs/sections/experience.html` | `docs/data/experience.json` |
| `docs/gallery-experience-review-d.html` | `docs/data/experience.json` |
| `docs/gallery-*.html` | `docs/data/galleries/gallery-*.json` |
| `docs/under_construction.html` | `docs/data/under_construction.json` + `docs/templates/under_construction.template.html` |

Rebuild everything:

```bash
python3 tools/build_index.py
```

Or via the `webspace` alias (rebuilds + serves on port 2026).

## Page Map

The builder assembles section partials in this order:

| Index | File | Nav label |
|---|---|---|
| 0 | `hero.html` | Home |
| 1 | `about.html` | About |
| 2 | `philosophy.html` | Philosophy |
| 3 | `experience.html` (generated) | Experience |
| 4 | `research.html` | Works |
| 5 | `contact.html` | Contact |

Nav links in `index.template.html` use `data-page-link` attributes matching these indexes.

## Local Preview Controls

The "Exit Preview" button is **not** in any HTML template. It is injected into the DOM dynamically by JS (`js/src/theme-mode.js`) only when `?localPreview=1` is present in the URL. This ensures local-only UI never ships to production HTML.

The local preview server (`tools/local_preview_server.py`) handles the `/__exit_preview__` POST endpoint that the button calls.

## Data-Driven Sections

Sections where content will grow over time are driven by JSON:

- **Experience** (`data/experience.json`): chapters support `copy` as a string (single paragraph) or array of strings (multiple paragraphs). Newlines within a string render as `<br>`.
- **Gallery prototypes** (`data/galleries/`): each file drives one gallery-*.html page.

Sections still as static HTML (stable prose, rarely changes):
- `about.html`, `philosophy.html`, `contact.html`, `hero.html`, `research.html`

`research.html` is a candidate for future data-driven conversion when the works list grows.

## External Dependencies

- Google Fonts (Inter, Outfit, IBM Plex Mono)
- Font Awesome 6
- GoatCounter analytics (`billabobz.goatcounter.com`) — privacy-first, no cookies

## Known State (as of 2026-05-30)

- CV button in hero links to `under_construction.html` — intentional placeholder
- `profile.tex` at repo root is the LaTeX CV source; not wired into a committed PDF
- `perf-reports/` exists locally with its own `.gitignore`; audit JSON files are not committed

## Editing Rules

- Edit source files in `docs/sections/`, `docs/css/src/`, `docs/js/src/`, `docs/data/`
- Always rebuild after editing
- Update this file when structure, routing, or build flow changes
