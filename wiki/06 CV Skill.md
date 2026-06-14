# CV Skill

← [[00 Home]]

## Overview

`/tailor-cv` generates a tailored CV + motivation letter PDF for a given job posting.

**Core principle:** same real work, different framing. All content must be truthful. STRETCH items (interest without direct experience) appear only in "Exploring next" or as forward-looking letter sentences.

---

## Files

```
cv_assets/
  cv_tailor_core.md          ← single source of truth for all skill logic
  templates/
    cv_base_A.tex            — Template A: Palatino, deep navy (minimal)
    cv_base_B.tex            — Template B: Latin Modern, black only (academic mono)
    cv_base_C.tex            — Template C: Palatino, teal header block
  cv/                        ← GITIGNORED — built CVs, local only
    <company>_cv.tex
    <company>_cv.pdf
    <company>_cv.synctex.gz

.claude/skills/tailor-cv.md  ← Claude Code overhead (thin wrapper → reads core)
```

All logic lives in `cv_tailor_core.md`. The overhead file just maps tools and points to the core. Edit the core only — never the overhead.

---

## Invoking

```
/tailor-cv
```

With inline args (any subset):
```
/tailor-cv COMPANY=C12 ROLE=spontaneous ANGLE=4
```

---

## 5 Phases

| Phase | What happens | User action needed |
|---|---|---|
| 0 Intake | Collects AD, COMPANY, ROLE, ANGLE, PROJECT, HOOK | Provide missing fields |
| 1 Profile Fetch | Reads web data files silently | None |
| 2 AD Analysis | Classifies ad signals as DIRECT / RELEVANT / STRETCH | None |
| 3 Draft | Shows all 5 tailored blocks for review | Approve or flag changes |
| 4 Review | Iterates on flagged blocks | Approve each change |
| 5 Build | Copies template, splices content, compiles, cleans residuals | Say "build / go / ok" |

Phase 5 asks which template (A / B / C) before building.

---

## What Gets Tailored vs Fixed

| Part | Tailored | Fixed |
|---|---|---|
| About Me tail (2–4 sentences) | ✓ | — |
| About Me intro (2 sentences) | — | ✓ |
| Research Interests (order + framing) | ✓ | 4 themes fixed |
| Letter P2 — intellectual gap | ✓ | — |
| Letter P3 — company hook | ✓ | — |
| Addressee line | ✓ | — |
| Education | — | ✓ |
| Projects | — | ✓ |
| Publications | — | ✓ |
| Presentations | — | ✓ |
| Technical Skills | — | ✓ (STRETCH → "Exploring next") |
| Letter P1 | — | ✓ |
| Letter P4 | — | ✓ |
| Sign-off name | — | ✓ always: Mohammed Bilal Puthuveedu Shebeek |

---

## 6 Framing Angles

| # | Name | Lead theme |
|---|---|---|
| 1 | theory-to-experiment | Optimal/robust control leads |
| 2 | control-methods-first | Breadth: analytical + numerical + RL |
| 3 | RL-and-data-driven | Data-driven leads |
| 4 | hardware-proximity | Want to work close to experiment |
| 5 | open-systems-bridge | Lindblad/dissipative → bridge to hardware |
| 6 | custom | User writes the framing sentence |

---

## Built CVs (as of 2026-06-14)

| File | Application | Template | Notes |
|---|---|---|---|
| `c12_cv` | C12 Quantum Electronics, spontaneous | A | Angle 4, Cargèse hook (Grégoire Charleux) |
| `pasqal_cv` | Pasqal, internship | A | Locked structure, see memory: `project_pasqal_cv_structure` |

---

## Related

- [[01 Architecture]] — where the CV layer fits
- [[02 Data Layer]] — data the skill reads in Phase 1
- [[07 Open Items]] — Codex overhead pending, research.html → JSON unblocks Phase 1 improvement
