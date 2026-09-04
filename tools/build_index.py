#!/usr/bin/env python3
"""Build the complete deployable website into dist/."""

import argparse
import os
import shutil
from html import escape
from pathlib import Path

from build_assets import build_assets
from export_profile import export_profile
from profile_site import load_profile, load_site_config, render_about, render_contact, render_hero, render_research
from render_under_construction import render_under_construction
from site_builder import render_experience_section
from validate_profile import validate_profile


ROOT = Path(__file__).resolve().parent.parent
WEBSITE = ROOT / "website"
TEMPLATE = WEBSITE / "src" / "templates" / "index.html"
PUBLIC = WEBSITE / "public"
DIST = ROOT / "dist"
DEFAULT_ASSET_VERSION = "dev"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--asset-version",
        default=os.environ.get("WEBSPACE_ASSET_VERSION", DEFAULT_ASSET_VERSION),
        help="Cache-busting token injected into CSS/JS asset URLs.",
    )
    return parser.parse_args()


def _replace_tokens(template: str, values: dict[str, str]) -> str:
    output = template
    for token, value in values.items():
        output = output.replace("{{" + token + "}}", value)
    if "{{" in output or "}}" in output:
        unresolved = sorted({part.split("}}", 1)[0] for part in output.split("{{")[1:] if "}}" in part})
        raise ValueError(f"Unresolved template tokens: {', '.join(unresolved)}")
    return output


def main() -> None:
    args = parse_args()
    validate_profile()
    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(PUBLIC, DIST)
    build_assets()

    profile = load_profile()
    site = load_site_config()
    person = profile["person"]
    sections = [
        render_hero(profile, site),
        render_about(profile, site),
        render_experience_section(),
        render_research(profile, site),
        render_contact(profile, site),
    ]
    sections_html = "\n\n".join(
        "\n".join(f"        {line}" if line else "" for line in fragment.splitlines())
        for fragment in sections
    )
    template = TEMPLATE.read_text(encoding="utf-8")
    output = _replace_tokens(template, {
        "META_DESCRIPTION": escape(site["metadata"]["description"], quote=True),
        "TITLE": escape(site["metadata"]["title"]),
        "PROFILE_NAME": escape(person["display_name"], quote=True),
        "BRAND": escape(site["brand"]),
        "SCHOLAR_URL": escape(person["public_contacts"]["google_scholar"], quote=True),
        "SECTIONS": sections_html,
        "ASSET_VERSION": escape(args.asset_version, quote=True),
    })
    (DIST / "index.html").write_text(output.rstrip() + "\n", encoding="utf-8")
    render_under_construction(args.asset_version)
    export_profile()
    print(f"Built {DIST.relative_to(ROOT)}/ from profile/ and website/")


if __name__ == "__main__":
    main()
