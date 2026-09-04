# Website Layer

← [[00 Home]]

## Layout

```text
website/
  content/
    site.json                 site prose, selection, order, labels
    experience.json           photo/layout adapter keyed by profile_ref
    under_construction.json
  public/
    .nojekyll
    assets/images/
    assets/pdfs/              public downloads, including the current CV
  src/
    templates/                HTML shells
    styles/                   CSS modules
    scripts/                  browser behavior modules
  experiments/
    galleries/                prototype data
    previews/                 non-production previews
```

`tools/profile_site.py` turns canonical profile records into the hero, about,
research, and contact HTML. `tools/site_builder.py` merges profile records with
the image/layout adapter for the experience page. This keeps factual copy in the
profile while leaving presentation choices in the website.

The production page order remains Home, About, Experience, Works, Contact.
Navigation uses matching `data-page-link` values. The local preview controls are
injected only when `?localPreview=1` is present.

External browser dependencies are Google Fonts, Font Awesome, and GoatCounter.
