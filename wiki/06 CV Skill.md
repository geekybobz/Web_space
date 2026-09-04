# Temporary CV Workspace

← [[00 Home]]

CV-authoring material is temporarily consolidated under ignored
`cv_workspace/`. It is deliberately outside the website architecture and will
later move to its own repository.

```text
cv_workspace/
  README.md
  profile.tex                 legacy reference
  tailor-cv.claude.md         inactive wrapper
  cv_assets/
    cv_tailor_core.md
    templates/cv_base_*.tex
    cv/                        local generated applications
```

The future builder should load `/api/profile/current/manifest.json` over HTTP,
or `profile/manifest.json` from a read-only local checkout, then follow declared
resources. It must not parse `dist/index.html` and must not assume every resource
shares the same fields.

Application-specific CVs, motivation letters, templates, and private intake stay
outside Git. The public PDF linked by the website is a publication artifact and
therefore remains at `website/public/assets/pdfs/mohammed-bilal-ps-cv.pdf`.
