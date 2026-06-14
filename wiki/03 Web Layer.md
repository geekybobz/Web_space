# Web Layer

← [[00 Home]]

## Section Partials

`build_index.py` assembles these in order:

| Page | File | Nav Label | Type |
|---|---|---|---|
| 0 | `hero.html` | Home | Static |
| 1 | `about.html` | About | Static — philosophy panel is embedded here |
| 2 | `experience.html` | Experience | **Generated** from `experience.json` |
| 3 | `research.html` | Works | Static (pending JSON conversion) |
| 4 | `contact.html` | Contact | Static |

Nav links in `index.template.html` use `data-page-link` attributes matching these page numbers.

---

## Directory Layout

```
docs/
  index.template.html      — HTML shell with {{SECTIONS}} + {{ASSET_VERSION}} placeholders
  index.html               — GENERATED, never edit directly
  sections/                — source partials assembled into index.html
  data/                    — JSON sources (see [[02 Data Layer]])
  css/
    src/
      base/                — reset, root variables, typography, responsive
      components/          — navbar, cursor, page engine shell, UI components, theme toggle
      effects/             — typewriter, loader
      sections/            — per-section styles (hero, about, experience, research, contact, skills)
      themes/              — all theme definitions
      gallery/             — gallery page styles (5 layout variants)
      under-construction/  — under_construction page styles
    style.css              — GENERATED bundle (never edit)
    gallery.css            — GENERATED bundle
    under-construction.css — GENERATED bundle
  js/
    src/
      page-engine.js       — core page transition engine
      page-lifecycle.js    — init orchestrator
      theme-mode.js        — theme switching + local preview panel injection
      hero-typewriter.js   — hero animation
      poster-toggles.js    — poster expand/collapse
      project-toggles.js   — project card expand/collapse
      avatar-tilt.js       — avatar tilt effect
      poster-popup.js      — poster popup handling
      (+ other modules)
    main.js                — GENERATED bundle (never edit)
    under-construction.js  — GENERATED bundle
  assets/
    images/                — web-ready image assets
      experience-review/   — photos for experience section
    pdfs/                  — PDF downloads (posters, thesis)
  templates/
    under_construction.template.html
  gallery-*.html           — GENERATED standalone gallery pages
  under_construction.html  — GENERATED
```

---

## Local Preview Panel

Not in any HTML template — injected by `js/src/theme-mode.js` **only when** `?localPreview=1` is in the URL. Ensures local-only UI never ships to production.

Endpoints handled by `local_preview_server.py`:
- `GET /__preview_status__` — panel status check
- `POST /__wifi_preview__` — start/stop parallel WiFi server on port 2032
- `POST /__exit_preview__` — stop button

## Phone / LAN Testing

Start `webspace` normally → click **Start WiFi :2032** in the preview panel → open `http://<laptop-LAN-IP>:2032/docs/index.html` on phone.

Desktop stays on port 2026. Phone uses 2032 because `localhost` on a phone points to the phone itself.

## External Dependencies

- Google Fonts: Inter, Outfit, IBM Plex Mono
- Font Awesome 6
- GoatCounter (`billabobz.goatcounter.com`) — privacy-first, no cookies

## Related

- [[02 Data Layer]] — JSON files that drive generated sections
- [[04 Build System]] — full build pipeline
- [[05 Dev Workflow]] — how to run the preview
