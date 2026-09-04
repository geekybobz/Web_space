# Public Profile Data

This directory is the canonical, public, machine-readable profile for the
portfolio and other read-only consumers.

## Editing model

- Edit the JSON files under `data/` whenever profile information changes.
- Add or remove records freely; Git provides history.
- `schema_version` describes the data contract, not a frozen profile snapshot.
- Change the major schema version only when an incompatible structural change
  would break existing consumers.
- Keep website layout, CSS classes, animation settings, image crops, job ads,
  private contact details, and application notes outside this directory.

## Consumer model

Consumers start at `manifest.json`, inspect the declared resources, and read
only the categories they understand. Collection records use stable IDs when
cross-references are needed; singleton and nested values do not require IDs.

The website build publishes two generated views:

- `api/profile/current/` for consumers that always want the latest contract.
- `api/profile/v1/` for consumers pinned to the version 1 contract.

Both views contain the current profile content. They are read-only exports, not
historical snapshots.

Run `python3 tools/validate_profile.py` before building or consuming the data.
