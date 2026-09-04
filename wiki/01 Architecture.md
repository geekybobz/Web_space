# Architecture

← [[00 Home]]

## Ownership boundaries

```text
profile/ (public facts and schemas)
  ├── website/ adapter ──> dist/index.html
  ├── static API exporter ──> dist/api/profile/{current,v1}/
  ├── future external CV builder (read only)
  └── other projects and tools (read only)

website/ (presentation and behavior)
  ├── src/templates, styles, scripts
  ├── content/ (site-only copy and display configuration)
  ├── public/ (images and downloadable PDFs)
  └── experiments/ (non-production prototypes)
```

`profile/` never imports website or CV concerns. Consumers adapt profile records
to their own views. A photo crop, CSS class, card order, or typewriter sentence
belongs to `website/`, while a degree, project, publication, or public contact
belongs to `profile/`.

## Data flow

```text
profile/manifest.json
        │
        ├─ validate schemas, IDs, references, and public boundary
        │
        ├─ profile_site.py + website/content/*.json
        │          └─ render website sections
        │
        └─ export_profile.py
                   └─ static read-only JSON API

website/src + website/public + rendered sections
        └─ build_index.py ──> dist/
```

## Why `v1` exists

`v1` is the compatibility generation of the contract. It does not mean the
profile is frozen. Records can be added, edited, or removed whenever needed as
long as the v1 field meanings remain compatible. Breaking field changes should
create a future `v2`; ordinary profile updates appear immediately in both
`/current/` and `/v1/` after the next build.

## Future consumers

Consumers must begin with `manifest.json`, follow each declared resource path,
and respect its `cardinality`. They must not require all categories to expose a
shared `title`, `type`, or other uniform fields. Stable IDs exist where records
need cross-references, while each category has its own schema and vocabulary.
