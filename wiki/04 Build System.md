# Build System

← [[00 Home]]

## Commands

```bash
python3 tools/build_index.py
python3 tools/validate_profile.py
python3 tools/validate_site.py
python3 -m unittest discover -s tests -v
```

`build_index.py` removes the old generated `dist/`, copies `website/public/`,
bundles CSS and JavaScript, renders profile-backed sections, renders the
under-construction page, and exports the static profile API.

| Generated output | Source |
|---|---|
| `dist/index.html` | `profile/`, `website/content/`, `website/src/templates/index.html` |
| `dist/css/*.css` | `website/src/styles/` |
| `dist/js/*.js` | `website/src/scripts/` |
| `dist/assets/` | `website/public/assets/` |
| `dist/under_construction.html` | under-construction content + template |
| `dist/api/profile/current/` | `profile/` |
| `dist/api/profile/v1/` | `profile/` under the v1 compatibility contract |

Never edit or stage `dist/`. GitHub Actions performs the same build, validation,
and tests before uploading `dist/` to GitHub Pages.
