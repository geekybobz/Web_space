# Web Space

Static GitHub Pages portfolio site for Mohammed Bilal P S.

## Structure

- `docs/` contains the published site
- `docs/index.template.html` is the main source template
- `docs/sections/` contains split content sections
- `tools/build_index.py` rebuilds `docs/index.html` from the template and sections
- `docs/under_construction.html` is the secondary page for unfinished sections

## Local Preview

Two local preview paths exist:

- direct:
  - `python3 tools/build_index.py`
  - `python3 -m http.server 2026`
- shortcut:
  - `webspace`
  - or `./local_run.sh`

The `webspace` shortcut and `local_run.sh` both rebuild the generated page and open:

- `http://localhost:2026/docs/index.html`

## Theme Control

The navbar uses a fixed 3-button theme control:

- `|0>` selects the dark theme family
- `|0>+|1>` selects the mid/superposition theme
- `|1>` selects the light theme

Dark mode keeps its existing family cycling behavior on refresh. Light and mid map to their current single approved themes. If no prior mode is stored, the site falls back to the mid/superposition mode.

## Deployment

GitHub Pages publishes from `docs/`.
