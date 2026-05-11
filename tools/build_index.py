from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SECTIONS = DOCS / "sections"
TEMPLATE = DOCS / "index.template.html"
OUTPUT = DOCS / "index.html"

ORDER = [
    "hero.html",
    "about.html",
    "philosophy.html",
    "experience.html",
    "education.html",
    "research.html",
    "current-research.html",
    "contact.html",
]


def main() -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    fragments = []
    for name in ORDER:
        fragments.append((SECTIONS / name).read_text(encoding="utf-8").strip())
    sections_html = "\n\n".join(f"        {line}" if line else "" for fragment in fragments for line in fragment.splitlines())
    output = template.replace("{{SECTIONS}}", sections_html)
    OUTPUT.write_text(output + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
