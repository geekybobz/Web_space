from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"


MAIN_CSS_MODULES = [
    "css/src/base/root-variables.css",
    "css/src/base/reset-base.css",
    "css/src/components/cursor.css",
    "css/src/components/background-shapes.css",
    "css/src/base/typography-utils.css",
    "css/src/components/ui-components.css",
    "css/src/components/navbar.css",
    "css/src/sections/hero-visuals.css",
    "css/src/sections/sections-structure.css",
    "css/src/sections/skills-tech.css",
    "css/src/sections/experience.css",
    "css/src/sections/cards-projects.css",
    "css/src/sections/research-works.css",
    "css/src/sections/philosophy.css",
    "css/src/sections/contact-footer.css",
    "css/src/base/responsive.css",
    "css/src/components/theme-toggle.css",
    "css/src/themes/all-themes.css",
    "css/src/components/page-engine-shell.css",
    "css/src/sections/hero-card-redesign.css",
    "css/src/components/page-dots-arrows.css",
    "css/src/effects/loader.css",
    "css/src/effects/intro-typewriter.css"
]

GALLERY_CSS_MODULES = [
    "css/src/gallery/base.css",
    "css/src/gallery/git.css",
    "css/src/gallery/museum.css",
    "css/src/gallery/journey.css",
    "css/src/gallery/hybrid.css",
    "css/src/gallery/responsive.css",
]

UNDER_CONSTRUCTION_CSS_MODULES = [
    "css/src/under-construction/base.css",
    "css/src/under-construction/blobs.css",
    "css/src/under-construction/topbar.css",
    "css/src/under-construction/card.css",
    "css/src/under-construction/content.css",
    "css/src/under-construction/cursor.css",
    "css/src/under-construction/responsive.css",
]

MAIN_JS_MODULES = [
    "js/src/loader.js",
    "js/src/hero-typewriter.js",
    "js/src/theme-mode.js",
    "js/src/avatar-theme-init.js",
    "js/src/project-toggles.js",
    "js/src/poster-toggles.js",
    "js/src/avatar-tilt.js",
    "js/src/custom-cursor.js",
    "js/src/navbar-mobile.js",
    "js/src/page-engine.js",
    "js/src/crt-terminal.js",
    "js/src/analytics-toast.js",
    "js/src/page-avatars.js",
    "js/src/philosophy-reveal.js",
    "js/src/page-lifecycle.js"
]

UNDER_CONSTRUCTION_JS_MODULES = [
    "js/src/under-construction/cursor.js",
    "js/src/under-construction/progress.js",
    "js/src/under-construction/entrance.js",
    "js/src/under-construction/theme-local-preview.js",
]


def _bundle(module_paths: list[str], output: Path, header: str) -> None:
    chunks = []
    for rel in module_paths:
        path = DOCS / rel
        text = path.read_text(encoding="utf-8").rstrip()
        chunks.append(f"/* Source: {rel} */\n{text}")
    output.write_text(f"{header}\n\n" + "\n\n".join(chunks) + "\n", encoding="utf-8")


def build_assets() -> None:
    _bundle(
        MAIN_CSS_MODULES,
        DOCS / "css" / "style.css",
        "/* Generated file. Edit docs/css/src/**, not docs/css/style.css. */",
    )
    _bundle(
        GALLERY_CSS_MODULES,
        DOCS / "css" / "gallery.css",
        "/* Generated file. Edit docs/css/src/gallery/**, not docs/css/gallery.css. */",
    )
    _bundle(
        UNDER_CONSTRUCTION_CSS_MODULES,
        DOCS / "css" / "under-construction.css",
        "/* Generated file. Edit docs/css/src/under-construction/**, not docs/css/under-construction.css. */",
    )
    _bundle(
        MAIN_JS_MODULES,
        DOCS / "js" / "main.js",
        "/* Generated file. Edit docs/js/src/**, not docs/js/main.js. */",
    )
    _bundle(
        UNDER_CONSTRUCTION_JS_MODULES,
        DOCS / "js" / "under-construction.js",
        "/* Generated file. Edit docs/js/src/under-construction/**, not docs/js/under-construction.js. */",
    )


if __name__ == "__main__":
    build_assets()
