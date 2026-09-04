# Web_space - Project Hub

Personal portfolio plus a reusable, public profile contract.

## Project map

| Topic | Note |
|---|---|
| Boundaries and data flow | [[01 Architecture]] |
| Profile contract | [[02 Data Layer]] |
| Website source | [[03 Web Layer]] |
| Reproducible build | [[04 Build System]] |
| Local development | [[05 Dev Workflow]] |
| Temporary CV workspace | [[06 CV Skill]] |
| Follow-up work | [[07 Open Items]] |
| UI change protocol | [[08 Change Preview Protocol]] |

## Current state

- `profile/` is canonical for person, education, experience, projects, publications, presentations, awards, and skills.
- Website sections are generated from profile records plus website-only display configuration.
- The deployable site and static profile API are generated into ignored `dist/`.
- GitHub Pages builds `dist/` in CI; generated output is not committed.
- CV sources/templates are temporarily kept in ignored `cv_workspace/` pending extraction to another project.
- The downloadable CV stays at `website/public/assets/pdfs/mohammed-bilal-ps-cv.pdf` because it is a public website artifact.
