# Web Space

Personal portfolio and reusable public profile data for Mohammed Bilal P S.

- Live site: https://geekybobz.github.io/Web_space/
- Canonical public profile: `profile/`
- Website source: `website/`
- Generated deployment artifact: `dist/` (ignored by Git)
- Build: `python3 tools/build_index.py`
- Validate: `python3 tools/validate_profile.py && python3 tools/validate_site.py`

The website is a consumer of the profile contract. Other projects can read the
same category-specific JSON resources through `profile/manifest.json` or the
generated static API under `/api/profile/current/`.
