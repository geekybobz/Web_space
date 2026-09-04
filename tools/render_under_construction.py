import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
WEBSITE = ROOT / "website"
TEMPLATE = WEBSITE / "src" / "templates" / "under_construction.html"
DATA = WEBSITE / "content" / "under_construction.json"
OUTPUT = ROOT / "dist" / "under_construction.html"


def render_under_construction(asset_version: str) -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    status_items = "\n".join(
        f"""                    <li>
                        <i class="fa-solid {item['icon']} {item['class']}"></i>
                        {item['text']}
                    </li>"""
        for item in data["status_items"]
    )
    body = f"""    <!-- Generated from website/content/under_construction.json -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>

    <div class="cursor-dot" id="cursor-dot"></div>
    <div class="cursor-outline" id="cursor-outline"></div>

    <a href="index.html" class="back-link" aria-label="Back to home">
        <i class="fa-solid fa-arrow-left"></i> MBPS. Home
    </a>

    <!-- Theme toggle temporarily disabled while bright mode is being redesigned.
    <div class="mode-toggle" aria-label="Theme mode toggle" role="group">
        <button class="mode-toggle-btn" data-theme-mode="dark" aria-label="Select dark mode">
            <span class="mode-state" aria-hidden="true">◐</span>
        </button>
        <button class="mode-toggle-btn" data-theme-mode="mid" aria-label="Select bright mode">
            <span class="mode-state" aria-hidden="true">◯</span>
        </button>
    </div>
    -->

    <main class="uc-card" role="main">
        <div class="uc-header">
            <div class="uc-heading">
                <div class="status-badge">
                    <span class="dot"></span>
                    {data['badge']}
                </div>
                <span class="uc-meta">{data['meta']}</span>
                <h1 class="uc-title">{data['heading']}</h1>
                <p class="uc-subtitle">{data['subtitle_html']}</p>
            </div>

            <div class="progress-section">
                <div class="progress-label">
                    <span class="label-text">{data['progress_label']}</span>
                    <span class="label-pct" id="pct-display">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
            </div>
        </div>

        <div class="uc-core">
            <div class="cartoon-wrap">
                <img src="{data['image']['src']}" alt="{data['image']['alt']}" class="cartoon-img" draggable="false">
            </div>

            <div class="uc-copy">
                <p class="uc-note">{data['note']}</p>

                <ul class="status-list" aria-label="Current build status">
{status_items}
                </ul>
            </div>
        </div>

        <div class="uc-actions">
            <a href="{data['cta']['href']}" class="btn-home">
                <i class="fa-solid fa-house"></i>
                {data['cta']['label']}
            </a>

            <p class="uc-footer">{data['footer_html']}</p>
        </div>
    </main>
"""
    template = TEMPLATE.read_text(encoding="utf-8")
    output = template.replace("{{META_DESCRIPTION}}", data["meta_description"])
    output = output.replace("{{TITLE}}", data["title"])
    output = output.replace("{{BODY}}", body)
    output = output.replace("{{ASSET_VERSION}}", asset_version)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(output, encoding="utf-8")


if __name__ == "__main__":
    render_under_construction("dev")
