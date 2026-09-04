# Site Context

Fast handoff for work in this repository. Read `wiki/00 Home.md` for the map.

## Key rules

1. `profile/` owns public biographical facts. Load resources through its manifest; do not assume every category has the same fields.
2. `website/` owns templates, styling, behavior, display configuration, experiments, and public downloadable assets.
3. `dist/` is generated and ignored. Never edit it directly.
4. Build with `python3 tools/build_index.py`; validate profile, local links, and tests before staging.
5. `v1` names a stable schema contract, not a frozen person snapshot. Profile records remain editable and dynamic within that contract. `/current/` is the consumer-friendly moving channel.
6. CV-authoring material is temporarily consolidated in ignored `cv_workspace/`; only the public downloadable PDF remains a website asset.
7. Do not commit unless the user explicitly approves the staged patch and commit message.
8. For UI/design changes, follow `wiki/08 Change Preview Protocol.md` and return the correct `webspace` preview command.
