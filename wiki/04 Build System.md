# Build System

← [[00 Home]]

## Rebuild Command

```bash
python3 tools/build_index.py
```

Or via the `webspace` alias (rebuilds + serves). See [[05 Dev Workflow]].

## Build Orchestration

`tools/build_index.py` runs in this order:

1. `site_builder.py` — renders `experience.html` and `gallery-*.html` from JSON
2. `build_assets.py` — bundles CSS `src/` → `style.css`, JS `src/` → `main.js`
3. `render_under_construction.py` — renders `under_construction.html` from template + JSON
4. Assembler — inserts section partials into `index.template.html`, writes `index.html`

Cache-busting: `--asset-version <unix timestamp>` is passed automatically by `webspace`/`local_run.sh` to break CDN caches.

## Source of Truth

| Generated file | Edit this instead |
|---|---|
| `docs/index.html` | `docs/index.template.html` + `docs/sections/*.html` |
| `docs/css/style.css` | `docs/css/src/**/*.css` |
| `docs/js/main.js` | `docs/js/src/**/*.js` |
| `docs/sections/experience.html` | `docs/data/experience.json` |
| `docs/gallery-experience-review-d.html` | `docs/data/experience.json` |
| `docs/gallery-*.html` | `docs/data/galleries/gallery-*.json` |
| `docs/under_construction.html` | `docs/data/under_construction.json` + `docs/templates/under_construction.template.html` |

**Never edit generated files.** Always edit the source and rebuild.

## Data-Driven Sections

- **Experience** (`data/experience.json`): fully wired — `site_builder.py` renders `experience.html`.
- **Gallery prototypes** (`data/galleries/`): each file drives one `gallery-*.html` page.
- **Research / Works**: `projects.json` and `posters.json` exist but `research.html` is still hand-authored. See [[07 Open Items]].

## Related

- [[02 Data Layer]] — JSON schemas and what each file drives
- [[03 Web Layer]] — section partial types and directory layout
- [[05 Dev Workflow]] — how to run the build locally
