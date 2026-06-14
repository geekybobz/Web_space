# Data Layer

← [[00 Home]]

The JSON files in `docs/data/` are the canonical source of content that changes over time. Edit these to add projects, experience entries, posters, or gallery items — then rebuild.

---

## experience.json

**Drives:** `docs/sections/experience.html` + `docs/gallery-experience-review-d.html`
**Renderer:** `tools/site_builder.py`

Top-level structure:
```json
{
  "hero": { "title": "...", "subtitle": "..." },
  "chapters": [ ...experience entries... ],
  "poster_section": { "label": "...", "title": "...", "events": [...] },
  "roles_section": { "label": "...", "title": "...", "roles": [...] }
}
```

Each chapter:
```json
{
  "year": "2024 – 2027",
  "title": "Institution name",
  "role": "Role description",
  "org": "Organisation detail",
  "copy": ["paragraph 1", "paragraph 2"],
  "tags": ["Tag1", "Tag2"],
  "links": [{ "href": "#section", "label": "Label ↗", "page_link": 3 }],
  "frame": { ...photo frame config... }
}
```

`copy` can be a string (one paragraph) or an array of strings (multiple paragraphs). Newlines within a string render as `<br>`.

---

## projects.json

**Should drive:** Projects block of `docs/sections/research.html`
**Currently:** JSON exists but research.html is hand-authored — see [[07 Open Items]]

Each project:
```json
{
  "id": "qoste",
  "title": "Full paper title",
  "status_tag": { "label": "PRL ⏳", "cls": "rc-status-tag--prl" },
  "meta": "Authors · venue · year",
  "tags": ["Tag1", "Tag2"],
  "abstract": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "link": { "href": "https://arxiv.org/abs/...", "label": "arXiv:..." }
}
```

No `"status"` field yet. When research.html is converted, add `"status": "published" | "in_progress"` to replace the hardcoded in-progress block in the HTML.

---

## posters.json

**Should drive:** Posters & Abstracts block of `docs/sections/research.html`
**Currently:** JSON exists but research.html is hand-authored

Each poster:
```json
{
  "id": "jed-2025",
  "conf": "JED",
  "year": "2025",
  "title": "Poster title",
  "meta": "Authors · Affiliation · event",
  "tags": ["Poster", "Tag2"],
  "abstract": ["paragraph 1", "paragraph 2"],
  "ref": "Context note (conference, arXiv, etc.)",
  "ref_arxiv": "2503.20130",
  "pdf": "assets/pdfs/filename.pdf",
  "pdf_title": "Label for PDF link"
}
```

---

## galleries/gallery-*.json

**Drives:** `docs/gallery-git.html`, `docs/gallery-hybrid.html`, `docs/gallery-journey.html`, `docs/gallery-museum.html`
**Renderer:** `tools/site_builder.py`

Four layout variants. Each file is a standalone gallery definition. Schema varies by type.

---

## under_construction.json

**Drives:** `docs/under_construction.html`
**Renderer:** `tools/render_under_construction.py` + `docs/templates/under_construction.template.html`

Content for the placeholder page shown for sections not yet live on site.

---

## Related

- [[01 Architecture]] — how data feeds the web and CV layers
- [[04 Build System]] — which renderer reads which file
- [[07 Open Items]] — projects.json and posters.json not yet wired to the build
