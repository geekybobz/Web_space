# Profile Data Contract

← [[00 Home]]

## Entry point

Always read `profile/manifest.json` first. It declares the contract version and
the path, schema, and cardinality of every resource.

```json
{
  "schema_version": "1.0.0",
  "profile_id": "mohammed-bilal-ps",
  "resources": {
    "person": {"path": "data/person.json", "schema": "schemas/person.schema.json", "cardinality": "one"},
    "projects": {"path": "data/projects.json", "schema": "schemas/projects.schema.json", "cardinality": "many"}
  }
}
```

The resources are intentionally heterogeneous. `person` contains names and
contacts; projects contain summaries and statuses; presentations contain event
metadata; skills contain evidence references. Consumers should use the declared
schema for each category rather than forcing a universal record shape.

## Update workflow

1. Edit or add the relevant file under `profile/data/`.
2. Preserve stable IDs for existing referenced records.
3. Add or update that category's schema when its structure changes.
4. Run `python3 tools/validate_profile.py`.
5. Run `python3 tools/build_index.py` and the site validation/tests.

`profile/` is public and committed. Do not place phone numbers, addresses,
passport/visa data, private emails, application letters, or private notes here.
Website styling and photo-layout details belong under `website/`.

## Static API

The build publishes exact copies plus an aggregate `profile.json` at:

- `/api/profile/current/` - moving channel for consumers that want current data.
- `/api/profile/v1/` - same current data under the stable v1 contract.

Each channel includes `index.json`, `manifest.json`, category files, schemas, and
the aggregate. This is static read-only JSON; no server process or write API is
required.
