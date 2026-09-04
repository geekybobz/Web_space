# Change Preview Protocol

← [[00 Home]]

Use this for website UI, content, route, behavior, or styling changes.

## Before editing

- Read `SITE_CONTEXT.md` and the relevant profile/website source.
- Run `git status --short` and preserve unrelated changes.
- For substantial visual work, state the intended result and acceptance checks.
- Keep profile facts separate from website-only presentation decisions.

## Source-only edits

- Public facts: `profile/data/` plus the matching category schema.
- Site content/order/layout: `website/content/`.
- HTML shells: `website/src/templates/`.
- Styling and behavior: `website/src/styles/`, `website/src/scripts/`.
- Public images/PDFs: `website/public/assets/`.
- Never edit `dist/` directly.

## Validation

```bash
python3 tools/build_index.py
python3 tools/validate_profile.py
python3 tools/validate_site.py
python3 -m unittest discover -s tests -v
```

For visual changes, also inspect the actual browser result and relevant desktop
and mobile interactions. A build-only check does not establish visual parity.

## Preview

Use the project wrapper rather than a separate ad hoc server:

```bash
webspace current
```

```text
http://localhost:2026/dist/index.html?localPreview=1
```

Use `webspace main` or `webspace branch <name>` only when that matches the real
checkout the user should inspect. Report build/test results, remaining visual
checks, staged state, and the exact preview command.
