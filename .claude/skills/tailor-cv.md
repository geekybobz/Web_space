Use this skill when the user invokes /tailor-cv or asks to tailor, adapt,
or customise the CV for a specific job posting, company, or opportunity.

---

## THIS FILE IS AN OVERHEAD WRAPPER ONLY

All logic, phases, rules, constraints, and field definitions live in:
  /Users/billabobz/Web_space/cv_assets/cv_tailor_core.md

Read that file in full before doing anything else.
Execute exactly what is described there.
Do not infer, shortcut, or substitute steps from memory.

---

## TOOL MAPPING FOR THIS ENVIRONMENT (Claude Code)

  Read        →  read site source files, base templates, and the core
  WebFetch    →  fetch AD content if the AD field is a URL
  Edit        →  splice %%TAILOR: blocks into the output .tex file
  Bash        →  compile with pdflatex, remove aux files, verify page count

---

## INVOCATION

Triggered by: /tailor-cv
Arguments may be passed inline on the same line, e.g.:
  /tailor-cv COMPANY=C12 ROLE=spontaneous ANGLE=4

Parse any inline arguments before prompting for missing fields.
Then follow the core file from Phase 0 onwards.
