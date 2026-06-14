# Architecture

← [[00 Home]]

## Overview

Two domains, one data spine:

```
┌─────────────────────────────────────────────────────────┐
│  DATA LAYER  (JSON — edit here to add content)          │
│  docs/data/experience.json                              │
│  docs/data/projects.json                                │
│  docs/data/posters.json                                 │
│  docs/data/galleries/*.json                             │
│  docs/data/under_construction.json                      │
└──────────────┬──────────────────────────────────────────┘
               │  python3 tools/build_index.py
               ▼
┌─────────────────────────────────────────────────────────┐
│  WEB LAYER  (generated + static HTML → GitHub Pages)    │
│  docs/sections/experience.html  ← generated from JSON  │
│  docs/sections/research.html    ← SHOULD be generated  │
│  docs/sections/about.html       ← static (personal prose) │
│  docs/sections/hero.html        ← static               │
│  docs/sections/contact.html     ← static               │
│  docs/index.html                ← assembled             │
└──────────────┬──────────────────────────────────────────┘
               │  /tailor-cv reads data + about prose
               ▼
┌─────────────────────────────────────────────────────────┐
│  CV LAYER  (local only, gitignored)                     │
│  cv_assets/templates/cv_base_*.tex  ← base templates   │
│  cv_assets/cv/<company>_cv.pdf      ← built output     │
└─────────────────────────────────────────────────────────┘
```

## Design Principle

JSON is the single source of truth for content that changes over time. HTML is always generated from JSON or is static personal prose — never a manual duplicate of JSON. The CV layer consumes the same data the website uses; no facts are maintained in two places.

## Current State vs Target

| Section | Now | Target |
|---|---|---|
| Experience | JSON → generated ✓ | done |
| Research / Works | Hand-authored HTML | JSON → generated |
| Posters | Hand-authored HTML (inside research.html) | JSON → generated |
| About, Hero, Contact | Static prose | static (correct — rarely changes) |
| CV builder data source | reads research.html (messy HTML) | reads projects.json + posters.json |

See [[07 Open Items]] for the conversion plan.

## Related

- [[02 Data Layer]] — JSON file schemas
- [[03 Web Layer]] — section partials and generated pages
- [[06 CV Skill]] — how the CV layer works
