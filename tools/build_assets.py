from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "website" / "src"
DIST = ROOT / "dist"


MAIN_CSS_MODULES = [
    "styles/base/root-variables.css",
    "styles/base/reset-base.css",
    "styles/components/cursor.css",
    "styles/components/background-shapes.css",
    "styles/base/typography-utils.css",
    "styles/components/ui-components.css",
    "styles/components/navbar.css",
    "styles/sections/hero-visuals.css",
    "styles/sections/sections-structure.css",
    "styles/sections/skills-tech.css",
    "styles/sections/experience.css",
    "styles/sections/cards-projects.css",
    "styles/sections/research-works.css",
    "styles/sections/philosophy.css",
    "styles/sections/contact-footer.css",
    "styles/base/responsive.css",
    "styles/components/theme-toggle.css",
    "styles/themes/all-themes.css",
    "styles/components/page-engine-shell.css",
    "styles/sections/hero-card-redesign.css",
    "styles/components/page-dots-arrows.css",
    "styles/effects/loader.css",
    "styles/effects/intro-typewriter.css",
    "styles/effects/performance-budget.css",
    "styles/mobile.css",
    "styles/themes/professional-dark.css",
    "styles/themes/semi-bright.css",
]

GALLERY_CSS_MODULES = [
    "styles/gallery/base.css",
    "styles/gallery/git.css",
    "styles/gallery/museum.css",
    "styles/gallery/journey.css",
    "styles/gallery/hybrid.css",
    "styles/gallery/responsive.css",
]

UNDER_CONSTRUCTION_CSS_MODULES = [
    "styles/under-construction/base.css",
    "styles/under-construction/blobs.css",
    "styles/under-construction/topbar.css",
    "styles/under-construction/card.css",
    "styles/under-construction/content.css",
    "styles/under-construction/cursor.css",
    "styles/under-construction/responsive.css",
]

MAIN_JS_MODULES = [
    "scripts/loader.js",
    "scripts/hero-typewriter.js",
    "scripts/theme-mode.js",
    "scripts/avatar-theme-init.js",
    "scripts/project-toggles.js",
    "scripts/poster-toggles.js",
    "scripts/avatar-tilt.js",
    "scripts/custom-cursor.js",
    "scripts/navbar-mobile.js",
    "scripts/mobile-scroll.js",
    "scripts/layout-health.js",
    "scripts/page-engine.js",
    "scripts/crt-terminal.js",
    "scripts/analytics-toast.js",
    "scripts/page-avatars.js",
    "scripts/philosophy-reveal.js",
    "scripts/page-lifecycle.js",
]

UNDER_CONSTRUCTION_JS_MODULES = [
    "scripts/under-construction/cursor.js",
    "scripts/under-construction/progress.js",
    "scripts/under-construction/entrance.js",
    "scripts/under-construction/theme-local-preview.js",
]


def _bundle(module_paths: list[str], output: Path, header: str) -> None:
    chunks = []
    for relative_path in module_paths:
        source_path = SOURCE / relative_path
        source_text = source_path.read_text(encoding="utf-8").rstrip()
        chunks.append(f"/* Source: website/src/{relative_path} */\n{source_text}")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(f"{header}\n\n" + "\n\n".join(chunks) + "\n", encoding="utf-8")


def build_assets() -> None:
    _bundle(MAIN_CSS_MODULES, DIST / "css" / "style.css", "/* Generated file. Edit website/src/styles/**, not dist/css/style.css. */")
    _bundle(GALLERY_CSS_MODULES, DIST / "css" / "gallery.css", "/* Generated file. Edit website/src/styles/gallery/**, not dist/css/gallery.css. */")
    _bundle(UNDER_CONSTRUCTION_CSS_MODULES, DIST / "css" / "under-construction.css", "/* Generated file. Edit website/src/styles/under-construction/**, not dist/css/under-construction.css. */")
    _bundle(MAIN_JS_MODULES, DIST / "js" / "main.js", "/* Generated file. Edit website/src/scripts/**, not dist/js/main.js. */")
    _bundle(UNDER_CONSTRUCTION_JS_MODULES, DIST / "js" / "under-construction.js", "/* Generated file. Edit website/src/scripts/under-construction/**, not dist/js/under-construction.js. */")


if __name__ == "__main__":
    build_assets()
