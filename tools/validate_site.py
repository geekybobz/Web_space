#!/usr/bin/env python3
"""Validate the generated static artifact and its local references."""

import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
REQUIRED = [
    "index.html",
    "under_construction.html",
    "css/style.css",
    "js/main.js",
    "assets/pdfs/mohammed-bilal-ps-cv.pdf",
    "api/profile/current/manifest.json",
    "api/profile/current/profile.json",
    "api/profile/v1/manifest.json",
    "api/profile/v1/profile.json",
]


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if value is None:
                continue
            if name == "id":
                self.ids.append(value)
            if name in {"href", "src", "data-src"}:
                self.references.append((name, value))


def _is_external(reference: str) -> bool:
    return reference.startswith(("#", "//", "data:", "http://", "https://", "mailto:", "javascript:"))


def validate_site() -> dict:
    errors: list[str] = []
    for relative_path in REQUIRED:
        if not (DIST / relative_path).is_file():
            errors.append(f"missing generated file: dist/{relative_path}")

    html_files = sorted(DIST.glob("*.html"))
    checked_references = 0
    for html_path in html_files:
        text = html_path.read_text(encoding="utf-8")
        if re.search(r"{{[^{}]+}}", text):
            errors.append(f"{html_path.name}: contains an unresolved template token")
        parser = ReferenceParser()
        parser.feed(text)
        duplicate_ids = sorted({identifier for identifier in parser.ids if parser.ids.count(identifier) > 1})
        if duplicate_ids:
            errors.append(f"{html_path.name}: duplicate element IDs: {', '.join(duplicate_ids)}")
        for attribute, reference in parser.references:
            if not reference or _is_external(reference):
                continue
            path_part = unquote(urlsplit(reference).path)
            if not path_part:
                continue
            target = (html_path.parent / path_part).resolve()
            try:
                target.relative_to(DIST.resolve())
            except ValueError:
                errors.append(f"{html_path.name}: {attribute} escapes dist/: {reference}")
                continue
            checked_references += 1
            if not target.exists():
                errors.append(f"{html_path.name}: broken {attribute} reference: {reference}")

    index = DIST / "index.html"
    if index.exists():
        text = index.read_text(encoding="utf-8")
        for expected in ("Mohammed Bilal P S", "project-detail-1", "poster-detail-1", "data-profile-name"):
            if expected not in text:
                errors.append(f"index.html: expected generated marker {expected!r} is absent")
    if errors:
        raise ValueError("Site validation failed:\n- " + "\n- ".join(errors))
    return {"html_files": len(html_files), "local_references": checked_references}


def main() -> None:
    result = validate_site()
    print(f"Site valid: {result['html_files']} HTML pages, {result['local_references']} local references checked")


if __name__ == "__main__":
    main()
