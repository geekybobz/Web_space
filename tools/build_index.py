import argparse
import os
from pathlib import Path

from build_assets import build_assets
from render_under_construction import render_under_construction
from site_builder import render_generated_pages


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SECTIONS = DOCS / "sections"
TEMPLATE = DOCS / "index.template.html"
OUTPUT = DOCS / "index.html"
DEFAULT_ASSET_VERSION = "dev"

ORDER = [
    "hero.html",
    "about.html",
    "philosophy.html",
    "experience.html",
    "research.html",
    "contact.html",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--asset-version",
        default=os.environ.get("WEBSPACE_ASSET_VERSION", DEFAULT_ASSET_VERSION),
        help="Cache-busting token injected into CSS/JS asset URLs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    render_generated_pages()
    build_assets()
    render_under_construction(args.asset_version)
    template = TEMPLATE.read_text(encoding="utf-8")
    fragments = []
    for name in ORDER:
        fragments.append((SECTIONS / name).read_text(encoding="utf-8").strip())
    sections_html = "\n\n".join(f"        {line}" if line else "" for fragment in fragments for line in fragment.splitlines())
    output = template.replace("{{SECTIONS}}", sections_html)
    output = output.replace("{{ASSET_VERSION}}", args.asset_version)
    OUTPUT.write_text(output + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
