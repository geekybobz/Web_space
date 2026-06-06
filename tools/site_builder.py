import json
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
DATA = DOCS / "data"
GALLERIES = DATA / "galleries"
EXPERIENCE = DATA / "experience.json"


EXPERIENCE_SCRIPT = """
    <script>
    (() => {
        if (window.__experienceReviewInit) return;
        window.__experienceReviewInit = true;
        const CYCLE_MS = 3500;

        function initPhotoFrame(frame) {
            const split = key => (frame.dataset[key] || '').split('||').filter(Boolean);
            const resSrcs = split('srcs');
            const resLbls = split('labels');
            const grpSrcs = split('groupSrcs');
            const grpLbls = split('groupLabels');
            if (!resSrcs.length) return;

            const chapter = frame.closest('.er-chapter');
            const mainEl = chapter.querySelector('.er-chapter-main');
            const peekBtn = frame.querySelector('.er-group-peek-btn');
            const closeBtn = frame.querySelector('.er-photo-stage .er-group-close-btn');
            const stageImg = frame.querySelector('.er-stage-img');
            const stageLbl = frame.querySelector('.er-photo-stage .er-photo-label');
            const dotsEl = frame.querySelector('.er-dots');
            const initialStageSrc = stageImg?.getAttribute('src') || '';
            const initialStageAlt = stageImg?.getAttribute('alt') || '';
            let resIdx = 0;
            let grpIdx = 0;
            let resTimer = null;
            let grpTimer = null;

            function buildDots(container, count, active) {
                if (!container) return;
                container.innerHTML = '';
                for (let i = 0; i < count; i++) {
                    const d = document.createElement('span');
                    d.className = 'er-dot' + (i === active ? ' is-active' : '');
                    container.appendChild(d);
                }
            }

            function setActiveDot(container, active) {
                container?.querySelectorAll('.er-dot').forEach((d, i) => {
                    d.classList.toggle('is-active', i === active);
                });
            }

            function showRes(i, animate) {
                resIdx = ((i % resSrcs.length) + resSrcs.length) % resSrcs.length;
                const apply = () => {
                    stageImg.src = resSrcs[resIdx];
                    stageImg.alt = resLbls[resIdx] || '';
                    if (stageLbl) stageLbl.textContent = resLbls[resIdx] || '';
                    setActiveDot(dotsEl, resIdx);
                    if (animate) stageImg.classList.remove('is-fading');
                };
                if (animate) {
                    stageImg.classList.add('is-fading');
                    setTimeout(apply, 220);
                } else {
                    apply();
                }
            }

            function startResAuto() {
                clearInterval(resTimer);
                if (resSrcs.length < 2) return;
                resTimer = setInterval(() => showRes(resIdx + 1, true), CYCLE_MS);
            }

            function showGrp(i) {
                grpIdx = ((i % grpSrcs.length) + grpSrcs.length) % grpSrcs.length;
                stageImg.classList.add('is-fading');
                setTimeout(() => {
                    stageImg.src = grpSrcs[grpIdx];
                    stageImg.alt = grpLbls[grpIdx] || '';
                    if (stageLbl) stageLbl.textContent = grpLbls[grpIdx] || '';
                    stageImg.classList.remove('is-fading');
                }, 220);
            }

            function openGroup() {
                if (!grpSrcs.length) return;
                clearInterval(resTimer);
                mainEl.classList.add('is-blend-open');
                grpIdx = 0;
                stageImg.src = grpSrcs[0];
                stageImg.alt = grpLbls[0] || '';
                if (stageLbl) stageLbl.textContent = grpLbls[0] || '';
                clearInterval(grpTimer);
                if (grpSrcs.length > 1) {
                    grpTimer = setInterval(() => showGrp(grpIdx + 1), CYCLE_MS);
                }
            }

            function closeGroup() {
                clearInterval(grpTimer);
                mainEl.classList.remove('is-blend-open');
                stageImg.src = initialStageSrc;
                stageImg.alt = initialStageAlt;
                if (stageLbl) stageLbl.textContent = resLbls[resIdx] || '';
                showRes(resIdx, false);
                startResAuto();
            }

            buildDots(dotsEl, resSrcs.length, 0);
            showRes(0, false);
            startResAuto();

            if (peekBtn) {
                if (!grpSrcs.length) peekBtn.hidden = true;
                else peekBtn.addEventListener('click', openGroup);
            }
            if (closeBtn) closeBtn.addEventListener('click', closeGroup);
        }

        function initEventCycler(card) {
            const srcs = (card.dataset.srcs || '').split('||').filter(Boolean);
            const lbls = (card.dataset.labels || '').split('||');
            if (srcs.length < 2) return;
            const img = card.querySelector('.er-stage-img');
            const labelEl = card.querySelector('.er-photo-label');
            const dots = card.querySelectorAll('.er-dot');
            let idx = 0;
            setInterval(() => {
                idx = (idx + 1) % srcs.length;
                img.classList.add('is-fading');
                setTimeout(() => {
                    img.src = srcs[idx];
                    img.alt = lbls[idx] || '';
                    if (labelEl) labelEl.textContent = lbls[idx] || '';
                    dots.forEach((d, j) => d.classList.toggle('is-active', j === idx));
                    img.classList.remove('is-fading');
                }, 220);
            }, CYCLE_MS);
        }

        document.querySelectorAll('.er-photo-frame').forEach(initPhotoFrame);
        document.querySelectorAll('.er-event-card[data-srcs]').forEach(initEventCycler);
    })();
    </script>
""".strip()


EXPERIENCE_STANDALONE_STYLE = """
        .er-shell { display: grid; gap: 28px; }
        .er-hero {
            padding: 32px 34px 30px;
            background: var(--gallery-surface);
            border: 1px solid var(--gallery-border);
            border-radius: 28px;
            box-shadow: var(--gallery-shadow);
            backdrop-filter: blur(18px);
        }
        .er-hero-title {
            margin: 0;
            font-family: var(--gallery-heading);
            font-size: clamp(36px, 6vw, 72px);
            line-height: 0.96;
            letter-spacing: -0.05em;
        }
        .er-hero-title span {
            display: block;
            color: var(--gallery-text-muted);
            font-size: clamp(18px, 2.6vw, 28px);
            margin-top: 10px;
            line-height: 1.15;
            letter-spacing: -0.03em;
        }
        .er-hero-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
        .er-hero-links a {
            display: inline-flex;
            align-items: center;
            padding: 10px 16px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 999px;
            color: var(--gallery-cyan);
            font-size: 13px;
            font-weight: 600;
            background: rgba(255,255,255,0.03);
        }
        .er-hero-links a:hover { background: rgba(110,231,255,0.08); }
        .er-chapter {
            background: var(--gallery-surface);
            border: 1px solid var(--gallery-border);
            border-radius: 28px;
            box-shadow: var(--gallery-shadow);
            backdrop-filter: blur(18px);
            overflow: hidden;
        }
        .er-chapter-main {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 20px;
            padding: 20px;
            align-items: start;
        }
        .er-photo-frame { display: grid; gap: 10px; }
        .er-photo-stage {
            position: relative;
            aspect-ratio: 4 / 3;
            overflow: hidden;
            border-radius: 16px;
            background: #101824;
        }
        .er-stage-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: var(--stage-position, center);
            opacity: 0.9;
            display: block;
            transition: opacity 220ms ease;
        }
        .er-stage-img.is-fading { opacity: 0; }
        .er-photo-label {
            position: absolute;
            left: 12px;
            bottom: 12px;
            z-index: 2;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(6,12,20,0.82);
            border: 1px solid rgba(255,255,255,0.08);
            font-family: var(--gallery-mono);
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--gallery-text);
            pointer-events: none;
        }
        .er-group-peek-btn,
        .er-group-close-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 3;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.14);
            background: rgba(6,12,20,0.72);
            color: var(--gallery-text);
            font-size: 17px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            transition: background 180ms, border-color 180ms, transform 180ms;
            line-height: 1;
        }
        .er-group-peek-btn:hover,
        .er-group-close-btn:hover {
            background: rgba(110,231,255,0.14);
            border-color: rgba(110,231,255,0.32);
            transform: scale(1.08);
        }
        .er-frame-footer { display: flex; align-items: center; min-height: 16px; }
        .er-dots, .er-dots-copy { display: flex; gap: 6px; }
        .er-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.18);
            transition: background 200ms;
        }
        .er-dot.is-active { background: var(--gallery-cyan); }
        .er-chapter-copy { display: flex; flex-direction: column; gap: 14px; padding: 4px 0; }
        .er-kicker {
            color: var(--gallery-cyan);
            font-family: var(--gallery-mono);
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .er-chapter-title {
            margin: 0;
            font-family: var(--gallery-heading);
            font-size: clamp(26px, 3vw, 40px);
            line-height: 1;
            letter-spacing: -0.04em;
        }
        .er-role { color: #dce8f3; font-size: 16px; font-weight: 600; }
        .er-org { color: var(--gallery-text-muted); font-size: 13px; }
        .er-copy { margin: 0; color: #cddae7; font-size: 14px; line-height: 1.8; }
        .er-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .er-tags span {
            padding: 7px 11px;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(255,255,255,0.03);
            color: var(--gallery-text-muted);
        }
        .er-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
        .er-links a {
            color: var(--gallery-cyan);
            font-size: 13px;
            font-weight: 600;
            padding: 9px 14px;
            border-radius: 999px;
            border: 1px solid rgba(110,231,255,0.18);
            background: rgba(110,231,255,0.04);
        }
        .er-links a:hover { background: rgba(110,231,255,0.10); }
        .er-chapter-main.is-blend-open {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 18px;
            align-items: stretch;
        }
        .er-chapter-main.is-blend-open .er-photo-frame { display: grid; gap: 0; order: 2; }
        .er-chapter-main.is-blend-open .er-photo-stage { aspect-ratio: 2.62 / 1; border-radius: 18px; }
        .er-chapter-main.is-blend-open .er-stage-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: var(--blend-group-position, center 34%);
            opacity: 0.94;
        }
        .er-chapter-main.is-blend-open .er-photo-stage::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
                linear-gradient(180deg, rgba(4, 10, 17, 0.12) 0%, rgba(4, 10, 17, 0.04) 28%, rgba(4, 10, 17, 0.42) 100%),
                linear-gradient(90deg, rgba(9, 17, 28, 0.10) 0%, rgba(9, 17, 28, 0) 42%, rgba(9, 17, 28, 0.18) 100%);
            pointer-events: none;
            z-index: 1;
        }
        .er-chapter-main.is-blend-open .er-chapter-copy { order: 1; display: grid; gap: 6px; padding: 0 2px; }
        .er-chapter-main.is-blend-open .er-role,
        .er-chapter-main.is-blend-open .er-copy,
        .er-chapter-main.is-blend-open .er-tags,
        .er-chapter-main.is-blend-open .er-links,
        .er-chapter-main.is-blend-open .er-frame-footer,
        .er-chapter-main.is-blend-open .er-group-peek-btn { display: none; }
        .er-chapter-main.is-blend-open .er-kicker { font-size: 10px; letter-spacing: 0.16em; }
        .er-chapter-main.is-blend-open .er-chapter-title { font-size: clamp(24px, 3.4vw, 34px); }
        .er-chapter-main.is-blend-open .er-org { font-size: 12px; letter-spacing: 0.03em; }
        .er-chapter-main.is-blend-open .er-photo-stage .er-photo-label {
            z-index: 2;
            display: inline-flex;
            align-items: center;
            bottom: 14px;
            left: 14px;
            background: rgba(6,12,20,0.66);
            backdrop-filter: blur(10px);
        }
        .er-photo-stage .er-group-close-btn { display: none; }
        .er-chapter-main.is-blend-open .er-photo-stage .er-group-close-btn { display: flex; z-index: 3; }
        .er-section { display: grid; gap: 18px; }
        .er-section-header { display: grid; gap: 4px; }
        .er-section-label {
            margin: 0;
            color: var(--gallery-cyan);
            font-family: var(--gallery-mono);
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .er-section-title {
            margin: 0;
            font-family: var(--gallery-heading);
            font-size: clamp(22px, 2.8vw, 34px);
            letter-spacing: -0.04em;
        }
        .er-event-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 18px;
            align-items: stretch;
        }
        .er-event-card, .er-role-card {
            display: flex;
            flex-direction: column;
            background: var(--gallery-surface);
            border: 1px solid var(--gallery-border);
            border-radius: 24px;
            box-shadow: var(--gallery-shadow);
            backdrop-filter: blur(18px);
            overflow: hidden;
        }
        .er-event-photo, .er-role-photo { position: relative; flex: 1 1 0; min-height: 200px; overflow: hidden; }
        .er-event-copy { flex: 0 0 auto; display: grid; gap: 8px; padding: 16px 18px 20px; }
        .er-event-copy h3, .er-role-copy h3 { margin: 0; font-family: var(--gallery-heading); font-size: 20px; letter-spacing: -0.03em; }
        .er-event-copy p, .er-role-copy p { margin: 0; color: var(--gallery-text-muted); font-size: 13px; line-height: 1.7; }
        .er-event-copy a { display: inline-block; color: var(--gallery-cyan); font-size: 13px; font-weight: 600; }
        .er-role-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 18px;
            align-items: stretch;
        }
        .er-role-copy { flex: 0 0 auto; display: grid; gap: 6px; padding: 16px 18px 18px; }
        @media (max-width: 860px) { .er-chapter-main { grid-template-columns: 1fr; } }
        @media (max-width: 600px) {
            .er-hero { padding: 22px 20px; }
            .er-chapter-main { padding: 14px; gap: 14px; }
        }
        @media (max-width: 860px) {
            .er-chapter-main.is-blend-open .er-photo-stage { aspect-ratio: 1.66 / 1; }
            .er-chapter-main.is-blend-open .er-stage-img { object-position: var(--blend-group-position-mobile, center 28%); }
        }
""".strip()


def _indent(text: str, level: int) -> str:
    pad = " " * level
    return "\n".join(f"{pad}{line}" if line else "" for line in text.splitlines())


def _load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _attrs(attrs: dict) -> str:
    parts = []
    for key, value in attrs.items():
        if value is None:
            continue
        parts.append(f'{key}="{escape(str(value), quote=True)}"')
    return (" " + " ".join(parts)) if parts else ""


def _link(link: dict, label: str | None = None, cls: str | None = None) -> str:
    attrs = {"href": link["href"]}
    if link.get("external"):
        attrs["target"] = "_blank"
        attrs["rel"] = "noopener noreferrer"
    if link.get("page_link") is not None:
        attrs["data-page-link"] = link["page_link"]
    if cls:
        attrs["class"] = cls
    return f'<a{_attrs(attrs)}>{escape(label or link["label"])}</a>'


def _render_dots(count: int) -> str:
    return "".join('<span class="er-dot{}"></span>'.format(" is-active" if i == 0 else "") for i in range(count))


def _render_copy(copy_data) -> str:
    """Render copy as one or more <p class="er-copy"> elements.
    Accepts a string (single paragraph) or list of strings (multiple paragraphs).
    Newlines within a string become <br> tags."""
    items = [copy_data] if isinstance(copy_data, str) else list(copy_data)
    return "\n                    ".join(
        f'<p class="er-copy">{escape(item).replace(chr(10), "<br>")}</p>'
        for item in items
    )


def _render_experience_body(data: dict, include_topbar: bool) -> str:
    parts = []
    if include_topbar:
        parts.append("""
        <div class="gallery-topbar">
            <a class="gallery-back" href="index.html">← Back To Main Site</a>
        </div>
""".strip())
    hero = data["hero"]
    eyebrow_html = ""
    if hero.get("eyebrow"):
        kicker_cls = "gallery-kicker" if include_topbar else "section-label"
        eyebrow_html = f'\n            <p class="{kicker_cls}">{escape(hero["eyebrow"])}</p>'
    desc_html = ""
    if hero.get("description"):
        desc_html = f'\n            <p class="er-hero-desc">{escape(hero["description"])}</p>'
    links_html = ""
    if hero.get("links"):
        hero_links = "\n".join(_link(link) for link in hero["links"])
        links_html = f'\n            <div class="er-hero-links">\n{_indent(hero_links, 16)}\n            </div>'
    parts.append(f"""
        <header class="er-hero">{eyebrow_html}
            <h1 class="er-hero-title">
                {escape(hero['title'])}
                <span>{escape(hero['subtitle'])}</span>
            </h1>{desc_html}{links_html}
        </header>
""".strip())
    for chapter in data["chapters"]:
        frame = chapter["frame"]
        dots = _render_dots(len(frame["srcs"]))
        tags = "\n".join(f"<span>{escape(tag)}</span>" for tag in chapter["tags"])
        links = "\n".join(_link(link) for link in chapter["links"])
        frame_attrs = {
            "class": "er-photo-frame",
            "style": f"--blend-group-position: {frame['blend_position']}; --blend-group-position-mobile: {frame['blend_position_mobile']};",
            "data-srcs": "||".join(frame["srcs"]),
            "data-labels": "||".join(frame["labels"]),
            "data-group-srcs": "||".join(frame["group_srcs"]),
            "data-group-labels": "||".join(frame["group_labels"])
        }
        img_attrs = {
            "class": "er-stage-img",
            "src": frame["default_src"],
            "alt": frame["default_alt"]
        }
        if frame.get("stage_position"):
            img_attrs["style"] = f"--stage-position: {frame['stage_position']};"
        parts.append(f"""
        <article class="er-chapter">
            <div class="er-chapter-main">
                <div{_attrs(frame_attrs)}>
                    <div class="er-photo-stage">
                        <img{_attrs(img_attrs)}>
                        <span class="er-photo-label">{escape(frame['default_label'])}</span>
                        <button class="er-group-peek-btn" aria-label="{escape(frame['peek_title'])}" title="{escape(frame['peek_title'])}">👥</button>
                        <button class="er-group-close-btn" aria-label="Return to chapter view" title="Return">↩</button>
                    </div>
                    <div class="er-frame-footer">
                        <div class="er-dots" aria-hidden="true">{dots}</div>
                    </div>
                </div>

                <div class="er-chapter-copy">
                    <div class="er-kicker">{escape(chapter['year'])}</div>
                    <h2 class="er-chapter-title">{escape(chapter['title'])}</h2>
                    <div class="er-role">{escape(chapter['role'])}</div>
                    <div class="er-org">{escape(chapter['org'])}</div>
                    {_render_copy(chapter['copy'])}
                    <div class="er-tags">
{_indent(tags, 24)}
                    </div>
                    <div class="er-links">
{_indent(links, 24)}
                    </div>
                </div>
            </div>
        </article>
""".strip())
    poster = data["poster_section"]
    event_cards = []
    for event in poster["events"]:
        if event["type"] == "cycler":
            card_attrs = {
                "class": "er-event-card",
                "data-srcs": "||".join(event["srcs"]),
                "data-labels": "||".join(event["labels"])
            }
            dots = _render_dots(len(event["srcs"]))
            link_html = _link(event["link"]) if event.get("link") else ""
            event_cards.append(f"""
                <article{_attrs(card_attrs)}>
                    <div class="er-event-photo">
                        <img class="er-stage-img" src="{escape(event['default_src'], quote=True)}" alt="{escape(event['default_alt'], quote=True)}">
                        <span class="er-photo-label">{escape(event['default_label'])}</span>
                    </div>
                    <div class="er-event-copy">
                        <div class="er-kicker">{escape(event['kicker'])}</div>
                        <h3>{escape(event['title'])}</h3>
                        <div class="er-dots-copy" aria-hidden="true">{dots}</div>
                        <p>{escape(event['copy'])}</p>
                        {link_html}
                    </div>
                </article>
""".strip())
        else:
            link_html = _link(event["link"]) if event.get("link") else ""
            maybe_link = f"\n                        {link_html}" if link_html else ""
            event_cards.append(f"""
                <article class="er-event-card">
                    <div class="er-event-photo">
                        <img class="er-stage-img" src="{escape(event['image'], quote=True)}" alt="{escape(event['alt'], quote=True)}">
                        <span class="er-photo-label">{escape(event['label'])}</span>
                    </div>
                    <div class="er-event-copy">
                        <div class="er-kicker">{escape(event['kicker'])}</div>
                        <h3>{escape(event['title'])}</h3>
                        <p>{escape(event['copy'])}</p>{maybe_link}
                    </div>
                </article>
""".rstrip())
    parts.append(f"""
        <section class="er-section">
            <div class="er-section-header">
                <p class="er-section-label">{escape(poster['label'])}</p>
                <h2 class="er-section-title">{escape(poster['title'])}</h2>
            </div>
            <div class="er-event-grid">
{_indent("\n\n".join(event_cards), 16)}
            </div>
        </section>
""".strip())
    roles = data["roles_section"]
    role_cards = []
    for role in roles["roles"]:
        role_cards.append(f"""
                <article class="er-role-card">
                    <div class="er-role-photo">
                        <img class="er-stage-img" src="{escape(role['image'], quote=True)}" alt="{escape(role['alt'], quote=True)}">
                    </div>
                    <div class="er-role-copy">
                        <h3>{escape(role['title'])}</h3>
                        <div class="er-org">{escape(role['org'])}</div>
                        <p>{escape(role['copy'])}</p>
                    </div>
                </article>
""".strip())
    parts.append(f"""
        <section class="er-section">
            <div class="er-section-header">
                <p class="er-section-label">{escape(roles['label'])}</p>
                <h2 class="er-section-title">{escape(roles['title'])}</h2>
            </div>
            <div class="er-role-grid">
{_indent("\n\n".join(role_cards), 16)}
            </div>
        </section>
""".strip())
    return "\n\n".join(parts)


def render_experience_section() -> str:
    data = _load_json(EXPERIENCE)
    body = _render_experience_body(data, include_topbar=False)
    # Keep the standalone experience selectors unchanged here.
    # Naive selector prefixing broke nested blend-mode rules in the main site.
    style = EXPERIENCE_STANDALONE_STYLE
    section_root = """
            #experience {
                --gallery-surface: rgba(11, 20, 32, 0.72);
                --gallery-border: rgba(150, 231, 255, 0.16);
                --gallery-text: #edf6ff;
                --gallery-text-muted: #8da4b8;
                --gallery-cyan: #6ee7ff;
                --gallery-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
                --gallery-heading: var(--font-heading);
                --gallery-body: var(--font-sans);
                --gallery-mono: monospace;
            }
""".strip()
    style = section_root + "\n" + style
    script = EXPERIENCE_SCRIPT.replace("document.querySelectorAll('.er-photo-frame')", "document.querySelectorAll('#experience .er-photo-frame')")
    script = script.replace("document.querySelectorAll('.er-event-card[data-srcs]')", "document.querySelectorAll('#experience .er-event-card[data-srcs]')")
    return f"""<!-- Generated from docs/data/experience.json via tools/build_index.py -->
<section class="page section" id="experience" data-page="2" data-label="Experience">
    <div class="page-avatar" data-page-avatar="2" data-icon="fa-code-branch" data-color="accent-3" aria-hidden="true">
        <div class="page-avatar-ring"></div>
    </div>
    <div class="page-inner">
        <style>
{_indent(style, 12)}
        </style>

        <div class="er-shell">
{_indent(body, 12)}
        </div>

{_indent(script, 8)}
    </div>
</section>
"""


def render_experience_standalone() -> str:
    data = _load_json(EXPERIENCE)
    body = _render_experience_body(data, include_topbar=True)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Experience — research chapters, poster events, and teaching roles.">
    <title>Experience</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/gallery.css">
    <link rel="preload" as="image" href="assets/images/experience-review/icb-group-panoramic.jpg">
    <link rel="preload" as="image" href="assets/images/experience-review/iiser-group.jpg">
    <link rel="preload" as="image" href="assets/images/experience-review/victor-group.jpg">
    <style>
{_indent(EXPERIENCE_STANDALONE_STYLE, 8)}
    </style>
</head>
<body class="gallery-body">
    <!-- Generated from docs/data/experience.json via tools/build_index.py -->
    <main class="gallery-shell er-shell">
{_indent(body, 8)}
    </main>

{_indent(EXPERIENCE_SCRIPT, 4)}
</body>
</html>
"""


def _render_switcher(items: list[dict]) -> str:
    links = []
    for item in items:
        cls = "is-active" if item.get("active") else None
        links.append(f'<a{_attrs({"href": item["href"], "class": cls})}>{escape(item["label"])}</a>')
    return "\n".join(links)


def _render_legend(items: list[dict]) -> str:
    return "\n".join(
        f'''<div class="gallery-legend-item">
                <span class="gallery-legend-label"><span class="gallery-dot {escape(item["dot"], quote=True)}"></span>{escape(item["label"])}</span>
                <span class="gallery-legend-note">{escape(item["note"])}</span>
            </div>'''
        for item in items
    )


def _render_gallery_shell(data: dict, main_body: str, footer_note: str) -> str:
    chips = "\n".join(f"<span class=\"gallery-chip\">{escape(chip)}</span>" for chip in data["hero"]["chips"])
    legend = _render_legend(data["aside"]["legend"])
    switcher = _render_switcher(data["switcher"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{escape(data['description'], quote=True)}">
    <title>{escape(data['title'])}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/gallery.css">
</head>
<body class="gallery-body">
    <!-- Generated from docs/data/galleries/{escape(Path(data['filename']).stem)}.json via tools/build_index.py -->
    <main class="gallery-shell">
        <div class="gallery-topbar">
            <a class="gallery-back" href="index.html">← Back To Main Site</a>
            <nav class="gallery-switcher" aria-label="Gallery prototypes">
{_indent(switcher, 16)}
            </nav>
        </div>

        <section class="gallery-hero">
            <div class="gallery-hero-card">
                <p class="gallery-kicker">{escape(data['hero']['kicker'])}</p>
                <h1 class="gallery-title">{escape(data['hero']['title'])}<span>{escape(data['hero']['subtitle'])}</span></h1>
                <p class="gallery-lead">{escape(data['hero']['lead'])}</p>
                <div class="gallery-hero-meta">
{_indent(chips, 20)}
                </div>
            </div>

            <aside class="gallery-aside-card">
                <h2 class="gallery-aside-title">{escape(data['aside']['title'])}</h2>
                <p class="gallery-aside-copy">{escape(data['aside']['copy'])}</p>
                <div class="gallery-legend">
{_indent(legend, 20)}
                </div>
            </aside>
        </section>

{_indent(main_body, 8)}

        <footer class="gallery-footer">
            <strong>Prototype note:</strong> {escape(footer_note)}
        </footer>
    </main>
</body>
</html>
"""


def render_gallery_git(data: dict) -> str:
    rows = []
    for row in data["rows"]:
        rows.append(f"""
                <article class="git-row {escape(row['row_class'], quote=True)}">
                    <div class="gallery-card git-card">
                        <div class="git-meta">
                            <span>{escape(row['commit'])}</span>
                            <span>{escape(row['state'])}</span>
                        </div>
                        <div class="gallery-card-image">
                            <img src="{escape(row['image'], quote=True)}" alt="{escape('Placeholder ' + row['title'].lower() + ' milestone', quote=True)}">
                            <div class="gallery-card-image-label">{escape(row['image_label'])}</div>
                        </div>
                        <h3 class="git-title">{escape(row['title'])}</h3>
                        <p class="git-copy">{escape(row['copy'])}</p>
                        <div class="git-actions">
                            <span class="git-tag">{escape(row['tag'])}</span>
                            <a class="gallery-link" href="under_construction.html">Open Placeholder →</a>
                        </div>
                    </div>
                </article>
""".strip())
    main = f"""
        <section>
            <div class="gallery-section-heading">
                <h2>{escape(data['section_heading']['title'])}</h2>
                <p>{escape(data['section_heading']['copy'])}</p>
            </div>

            <div class="git-rail">
{_indent("\n\n".join(rows), 16)}
            </div>
        </section>
""".strip()
    return _render_gallery_shell(data, main, data["footer"])


def render_gallery_museum(data: dict) -> str:
    rows = []
    for idx, row in enumerate(data["rows"], start=1):
        pills = "\n".join(f"<span class=\"museum-pill\">{escape(pill)}</span>" for pill in row["pills"])
        rows.append(f"""
                <article class="museum-row">
                    <div class="gallery-card-image">
                        <img src="{escape(row['image'], quote=True)}" alt="{escape(row['alt'], quote=True)}">
                        <div class="gallery-card-image-label">{escape(row['image_label'])}</div>
                    </div>
                    <div class="gallery-card museum-copy-card">
                        <div class="museum-phase">{escape(row['phase'])}</div>
                        <h3 class="museum-title">{escape(row['title'])}</h3>
                        <p class="museum-copy">{escape(row['copy'])}</p>
                        <div class="museum-strip">
{_indent(pills, 28)}
                            <a class="gallery-link" href="under_construction.html">Open Placeholder →</a>
                        </div>
                    </div>
                </article>
""".strip())
    main = f"""
        <section>
            <div class="gallery-section-heading">
                <h2>{escape(data['section_heading']['title'])}</h2>
                <p>{escape(data['section_heading']['copy'])}</p>
            </div>

            <div class="museum-stack">
{_indent("\n\n".join(rows), 16)}
            </div>
        </section>
""".strip()
    return _render_gallery_shell(data, main, data["footer"])


def render_gallery_journey(data: dict) -> str:
    nodes = []
    for node in data["nodes"]:
        bullets = "\n".join(f"<li>{escape(b)}</li>" for b in node["bullets"])
        mini_note = ""
        if node.get("mini_note"):
            mini_note = f"""
                            <div class="journey-mini-panel">
                                <strong>Future Slot</strong>
                                {escape(node['mini_note'])}
                            </div>
""".rstrip()
        nodes.append(f"""
                <article class="journey-node{(' ' + escape(node['class'], quote=True)) if node.get('class') else ''}">
                    <div class="journey-year">{escape(node['year'])}</div>
                    <div class="gallery-card journey-card">
                        <div>
                            <h3>{escape(node['title'])}</h3>
                            <p>{escape(node['copy'])}</p>
                            <ul>
{_indent(bullets, 32)}
                            </ul>
                        </div>
                        <div class="journey-mini">
                            <div class="gallery-card-image">
                                <img src="{escape(node['image'], quote=True)}" alt="{escape(node['alt'], quote=True)}">
                                <div class="gallery-card-image-label">Chapter Image</div>
                            </div>{mini_note}
                        </div>
                    </div>
                </article>
""".rstrip())
    sidebar = data["sidebar"]
    main = f"""
        <section class="journey-grid">
            <aside class="gallery-panel journey-sidebar">
                <h2>{escape(sidebar['title'])}</h2>
                <p>{escape(sidebar['copy'])}</p>
                <a class="gallery-link" href="{escape(sidebar['link']['href'], quote=True)}">{escape(sidebar['link']['label'])}</a>
            </aside>

            <div class="journey-axis">
{_indent("\n\n".join(nodes), 16)}
            </div>
        </section>
""".strip()
    return _render_gallery_shell(data, main, data["footer"])


def render_gallery_hybrid(data: dict) -> str:
    nodes = []
    for node in data["nodes"]:
        points = "\n".join(f"<span>{escape(p)}</span>" for p in node["points"])
        thumb = ""
        if node.get("thumb"):
            thumb = f"""
                            <div class="gallery-card-image hybrid-thumb">
                                <img src="{escape(node['thumb']['image'], quote=True)}" alt="{escape(node['thumb']['alt'], quote=True)}">
                                <div class="gallery-card-image-label">{escape(node['thumb']['label'])}</div>
                            </div>
""".rstrip()
        branch = ""
        if node.get("subcards"):
            subcards = []
            for sub in node["subcards"]:
                subcards.append(f"""
                                <div class="hybrid-subcard">
                                    <img src="{escape(sub['image'], quote=True)}" alt="{escape(sub['alt'], quote=True)}">
                                    <div>
                                        <h4>{escape(sub['title'])}</h4>
                                        <p>{escape(sub['copy'])}</p>
                                    </div>
                                    <a href="under_construction.html">Open →</a>
                                </div>
""".strip())
            branch = f"""
                        <div class="hybrid-branch">
                            <p class="hybrid-branch-label">{escape(node['branch_label'])}</p>
                            <div class="hybrid-subgrid">
{_indent("\n\n".join(subcards), 32)}
                            </div>
                        </div>
""".rstrip()
        nodes.append(f"""
                <article class="hybrid-node{(' ' + escape(node['class'], quote=True)) if node.get('class') else ''}">
                    <div class="hybrid-index">{escape(node['index'])}</div>
                    <div class="gallery-card hybrid-card">
                        <div class="hybrid-card-header">
                            <div>
                                <h3>{escape(node['title'])}</h3>
                                <p>{escape(node['copy'])}</p>
                            </div>
                            <span class="hybrid-state">{escape(node['state'])}</span>
                        </div>
                        <div class="hybrid-inline">
                            <div class="hybrid-points">
{_indent(points, 32)}
                            </div>{thumb}
                        </div>{branch}
                    </div>
                </article>
""".rstrip())
    rules = "\n".join(
        f'''                <div class="hybrid-rule">
                    <strong>{escape(rule["title"])}</strong>
                    <span>{escape(rule["note"])}</span>
                </div>'''
        for rule in data["sidepanel"]["rules"]
    )
    main = f"""
        <section class="hybrid-layout">
            <div class="hybrid-rail">
{_indent("\n\n".join(nodes), 16)}
            </div>

            <aside class="gallery-panel hybrid-sidepanel">
                <h2>{escape(data['sidepanel']['title'])}</h2>
                <p>{escape(data['sidepanel']['copy'])}</p>

{rules}
            </aside>
        </section>
""".strip()
    return _render_gallery_shell(data, main, data["footer"])


def render_gallery_page(path: Path) -> str:
    data = _load_json(path)
    stem = path.stem
    if stem == "gallery-git":
        return render_gallery_git(data)
    if stem == "gallery-museum":
        return render_gallery_museum(data)
    if stem == "gallery-journey":
        return render_gallery_journey(data)
    if stem == "gallery-hybrid":
        return render_gallery_hybrid(data)
    raise ValueError(f"Unsupported gallery config: {path}")


def render_generated_pages() -> None:
    (DOCS / "sections" / "experience.html").write_text(render_experience_section(), encoding="utf-8")
    (DOCS / "gallery-experience-review-d.html").write_text(render_experience_standalone(), encoding="utf-8")
    for config in sorted(GALLERIES.glob("gallery-*.json")):
        data = _load_json(config)
        (DOCS / data["filename"]).write_text(render_gallery_page(config), encoding="utf-8")
