"""Adapters from the reusable profile contract to this website's HTML."""

import json
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PROFILE = ROOT / "profile"
SITE_CONFIG = ROOT / "website" / "content" / "site.json"
EXPERIENCE_CONFIG = ROOT / "website" / "content" / "experience.json"
PUBLIC_SITE = "https://geekybobz.github.io/Web_space/"


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_profile() -> dict:
    """Load resources via the manifest so consumers do not hard-code data files."""
    manifest = _read_json(PROFILE / "manifest.json")
    resources = {}
    for name, descriptor in manifest["resources"].items():
        payload = _read_json(PROFILE / descriptor["path"])
        resources[name] = payload if descriptor["cardinality"] == "one" else payload["items"]
    return {"manifest": manifest, **resources}


def _index(profile: dict, collection: str) -> dict[str, dict]:
    return {item["id"]: item for item in profile[collection]}


def _skills(profile: dict, refs: list[str]) -> list[str]:
    skill_index = _index(profile, "skills")
    return [skill_index[ref]["name"] for ref in refs]


def _tags(values: list[str]) -> str:
    return "\n".join(f'<span class="project-tag">{escape(value)}</span>' for value in values)


def _website_href(url: str) -> str:
    """Use local asset paths in the site while keeping canonical API URLs absolute."""
    return url.removeprefix(PUBLIC_SITE) if url.startswith(PUBLIC_SITE) else url


def render_hero(profile: dict, site: dict) -> str:
    person = profile["person"]
    contacts = person["public_contacts"]
    ticker = f' <span class="t-sep">⟡</span> '.join(escape(item) for item in site["hero"]["ticker"])
    ticker = f'{ticker} <span class="t-sep">⟡</span>'
    phrases = "||".join(site["hero"]["typewriter_phrases"])
    return f'''<!-- Generated from profile/data/person.json and website/content/site.json -->
<section class="page hero-page" id="page-hero" data-page="0" data-label="Home">
    <div class="page-inner page-center">
        <div class="hero-content panel">
            <div class="badge intro-fade" data-delay="0.1">{escape(person['headline'])}</div>
            <div class="hero-visual-row hero-visual-row--avatar-only intro-fade" data-delay="0.25">
                <div class="hero-avatar"><img src="{escape(site['hero']['avatar'], quote=True)}" alt="{escape(person['display_name'], quote=True)} profile picture" class="profile-pic" width="320" height="320" decoding="async" fetchpriority="high"></div>
            </div>
            <h1 class="hero-title intro-fade" data-delay="0.45">{escape(person['display_name'])}</h1>
            <h2 class="hero-subtitle intro-fade" data-delay="0.6"><span id="hero-typewriter" data-phrases="{escape(phrases, quote=True)}"></span><span class="hero-tw-cursor" aria-hidden="true"></span></h2>
            <div class="hero-desc-container intro-fade" data-delay="0.75"><p class="hero-desc">{escape(site['hero']['description'])}</p></div>
            <div class="hero-actions intro-fade" data-delay="0.9">
                <a href="#research" data-page-link="3" class="btn btn-primary">Works</a>
                <a href="#contact" data-page-link="4" class="btn btn-outline">Contact</a>
            </div>
            <div class="mobile-connect-strip intro-fade" data-delay="1.0" aria-label="Quick contact links">
                <a href="mailto:{escape(contacts['email'], quote=True)}"><i class="fa-regular fa-envelope"></i> Email</a>
                <a href="{escape(contacts['linkedin'], quote=True)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
                <a href="{escape(contacts['google_scholar'], quote=True)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-graduation-cap"></i> Scholar</a>
            </div>
        </div>
    </div>
    <div class="hero-ticker" aria-hidden="true"><div class="hero-ticker-track"><span class="hero-ticker-item">{ticker}</span><span class="hero-ticker-item">{ticker}</span></div></div>
</section>'''


def _linked_people(people: list[dict]) -> str:
    rendered = []
    for person in people:
        name = escape(person["name"])
        if person.get("url"):
            name = f'<a class="inline-link" href="{escape(person["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{name}</a>'
        rendered.append(name)
    return " and ".join(rendered)


def render_about(profile: dict, site: dict) -> str:
    education = _index(profile, "education")
    bsms = education["education.bsms-iiser"]
    phd = education["education.phd-ube"]
    skills = "\n".join(f'<span class="skill-tag">{escape(name)}</span>' for name in _skills(profile, site["about"]["selected_skill_refs"]))
    focus = "\n".join(f'<li>{escape(item)}</li>' for item in site["about"]["focus"])
    return f'''<!-- Generated from profile education and skills plus website/content/site.json -->
<section class="page section" id="about" data-page="1" data-label="About">
    <div class="page-avatar" data-page-avatar="1" data-icon="fa-terminal" data-color="accent-1" aria-hidden="true"><div class="page-avatar-ring"></div></div>
    <div class="page-inner">
        <div class="section-header"><div class="section-label">Profile</div><h2 class="section-title">About</h2></div>
        <div class="about-rows">
            <div class="panel about-card"><div class="about-card-inner">
                <div class="about-card-meta"><div class="section-label">Background</div><h3 class="about-card-title">Who I Am</h3></div>
                <div class="about-card-body">
                    <p class="text-muted" style="margin-bottom: 1.1em;">I completed my {escape(bsms['degree'])} in {escape(bsms['field'])} at {escape(bsms['institution'])}, supported by the Chanakya Fellowship. My master's thesis, supervised by {_linked_people(bsms['supervisors'])}, focused on quantum batteries via reinforcement learning, which drew me toward control, optimization, and how algorithms learn and generalize.</p>
                    <p class="text-muted">I am now a {escape(phd['degree'])} candidate at {escape(phd['organization'])} in {escape(phd['location']['city'])}, working with {_linked_people(phd['supervisors'])} on optimal and robust quantum control. The long-term aim is control methods and computational tools that hold up under noise, realistic constraints, and contact with implementation.</p>
                </div>
            </div></div>
            <div class="panel about-card"><div class="about-card-inner">
                <div class="about-card-meta"><div class="section-label">Toolkit</div><h3 class="about-card-title">What I Work With</h3></div>
                <div class="about-card-body"><div class="skills-container">{skills}</div><div class="mt-4"><h3 class="subsection-title">Focus</h3><ul class="clean-list text-muted">{focus}</ul></div></div>
            </div></div>
        </div>
    </div>
</section>'''


def build_experience_view(profile: dict, config: dict) -> dict:
    records = {**_index(profile, "experience"), **_index(profile, "education")}
    presentations = _index(profile, "presentations")
    view = {"hero": config["hero"], "chapters": [], "poster_section": {"label": config["poster_section"]["label"], "title": config["poster_section"]["title"], "events": []}, "roles_section": {"label": config["roles_section"]["label"], "title": config["roles_section"]["title"], "roles": []}}
    for display in config["chapters"]:
        record = records[display["profile_ref"]]
        role = display.get("role_label") or record.get("role") or f"{record['degree']} {record['field']}"
        copy = [record["summary"]] if record.get("summary") else []
        copy.extend(record.get("highlights", []))
        view["chapters"].append({
            "year": display["year_label"], "title": display["title"], "role": role,
            "org": display["org_label"], "copy": copy,
            "tags": _skills(profile, record.get("skill_refs", [])), "links": display.get("links", []), "frame": display["frame"],
        })
    for display in config["poster_section"]["events"]:
        record = presentations[display["profile_ref"]]
        event = {**display, "title": display.get("display_title", record["event"]), "copy": record.get("teaser", record["summary"][0])}
        if not event.get("link") and record.get("artifact"):
            event["link"] = {"href": _website_href(record["artifact"]["url"]), "label": record["artifact"]["label"], "external": True}
        view["poster_section"]["events"].append(event)
    for display in config["roles_section"]["roles"]:
        record = records[display["profile_ref"]]
        view["roles_section"]["roles"].append({**display, "title": record["role"], "org": display["org_label"], "copy": record["summary"]})
    return view


def _artifact_link(artifact: dict) -> str:
    return f'<a href="{escape(_website_href(artifact["url"]), quote=True)}" class="project-link" target="_blank" rel="noopener noreferrer">{escape(artifact["label"])} <i class="fa-solid fa-arrow-right"></i></a>'


def render_research(profile: dict, site: dict) -> str:
    projects = _index(profile, "projects")
    publications = _index(profile, "publications")
    presentations = _index(profile, "presentations")
    completed_cards = []
    ongoing_cards = []
    for number, ref in enumerate(site["research"]["project_order"], start=1):
        project = projects[ref]
        tags = _tags(_skills(profile, project.get("skill_refs", [])))
        summaries = "".join(f'<p class="rc-desc">{escape(paragraph)}</p>' for paragraph in project["summary"])
        if project.get("highlights"):
            summaries += '<ul class="clean-list rc-desc">' + "".join(f'<li>{escape(item)}</li>' for item in project["highlights"]) + "</ul>"
        if project["status"] == "ongoing":
            ongoing_cards.append(f'''<article class="research-card panel rc-inprogress"><div class="rc-num"><i class="fa-solid fa-atom" style="font-size:0.85rem;"></i></div><div class="rc-body"><div class="rc-summary"><div class="rc-summary-main"><h3 class="rc-title">{escape(project['name'])}</h3><div class="rc-tags">{tags}</div></div></div>{summaries}</div></article>''')
            continue
        meta = " · ".join([", ".join(project.get("contributors", [])), project.get("period", "")]).strip(" ·")
        if project.get("publication_refs"):
            publication = publications[project["publication_refs"][0]]
            meta = " · ".join([", ".join(publication["authors"]), publication.get("submitted_to", ""), str(publication["year"])])
        footer = ""
        if project.get("artifact"):
            footer = f'<div class="rc-footer rc-footer--detail">{_artifact_link(project["artifact"])}</div>'
        elif project.get("publication_refs"):
            publication = publications[project["publication_refs"][0]]
            footer = f'<div class="rc-footer rc-footer--detail"><a href="{escape(publication["url"], quote=True)}" class="project-link" target="_blank" rel="noopener noreferrer">Read on arXiv <i class="fa-solid fa-arrow-right"></i></a></div>'
        status = site["research"].get("status_labels", {}).get(project["status"])
        badge = f'<span class="rc-status-tag rc-status-tag--prl">{escape(status)}</span>' if status else ""
        detail_id = f"project-detail-{number}"
        completed_cards.append(f'''<article class="research-card panel research-card--toggleable"><div class="rc-num">{number:02d}</div><div class="rc-body"><div class="rc-summary"><div class="rc-summary-main"><h3 class="rc-title">{escape(project['name'])} {badge}</h3><div class="rc-meta-line">{escape(meta)}</div><div class="rc-tags">{tags}</div></div><button class="project-toggle" type="button" aria-expanded="false" aria-controls="{detail_id}">View Abstract</button></div><div class="rc-detail" id="{detail_id}" hidden>{summaries}{footer}</div></div></article>''')
    poster_cards = []
    for number, ref in enumerate(site["research"]["presentation_order"], start=1):
        item = presentations[ref]
        tags = _tags(["Poster", *_skills(profile, projects[item["project_ref"]].get("skill_refs", []))])
        detail_id = f"poster-detail-{number}"
        body = "".join(f'<p class="rc-desc">{escape(paragraph)}</p>' for paragraph in item["summary"])
        embed = ""
        if item.get("artifact"):
            view_id = f"poster-view-{number}"
            embed = f'''<div class="rc-footer rc-footer--detail"><button class="poster-toggle" type="button" aria-expanded="false" aria-controls="{view_id}">View Poster <i class="fa-solid fa-arrow-right"></i></button></div><div class="poster-embed" id="{view_id}" hidden><iframe data-src="{escape(_website_href(item['artifact']['url']), quote=True)}" title="{escape(item['artifact']['label'], quote=True)}"></iframe></div>'''
        year = item["date"][:4]
        badge = site["research"].get("presentation_badges", {}).get(ref, item["event"].split()[0])
        poster_cards.append(f'''<article class="research-card panel research-card--toggleable"><div class="rc-num rc-num--poster"><span class="rc-num-conf">{escape(badge)}</span><span class="rc-num-year">{year}</span></div><div class="rc-body"><div class="rc-summary"><div class="rc-summary-main"><h3 class="rc-title">{escape(item['title'])}</h3><div class="rc-meta-line">{escape(', '.join(item['authors']))} · {escape(item['location'])}</div><div class="rc-tags">{tags}</div></div><button class="project-toggle" type="button" aria-expanded="false" aria-controls="{detail_id}">View Abstract</button></div><div class="rc-detail" id="{detail_id}" hidden>{body}{embed}</div></div></article>''')
    return f'''<!-- Generated from profile projects, publications, presentations, and skills -->
<section class="page section" id="research" data-page="3" data-label="Works"><div class="page-avatar" data-page-avatar="3" data-icon="fa-microchip" data-color="accent-2" aria-hidden="true"><div class="page-avatar-ring"></div></div><div class="page-inner">
    <div class="section-header"><div class="section-label">Research</div><h2 class="section-title">Works</h2></div>
    <div class="works-block-label">Published &amp; Submitted</div><div class="research-cards">{"".join(completed_cards)}</div>
    <div class="works-block-label"><span class="works-active-dot" aria-hidden="true"></span> In Progress</div><div class="research-cards">{"".join(ongoing_cards)}</div>
    <div class="works-block-label">Posters &amp; Abstracts</div><div class="research-cards">{"".join(poster_cards)}</div>
</div></section>'''


def render_contact(profile: dict, site: dict) -> str:
    person = profile["person"]
    contacts = person["public_contacts"]
    contact = site["contact"]
    return f'''<!-- Generated from profile/data/person.json and website/content/site.json -->
<section class="page section" id="contact" data-page="4" data-label="Contact"><div class="page-avatar" data-page-avatar="4" data-icon="fa-paper-plane" data-color="accent-1" aria-hidden="true"><div class="page-avatar-ring"></div></div><div class="page-inner page-center"><div class="panel contact-panel text-center">
    <div class="section-label mb-2">Get In Touch</div><h2 class="section-title mb-4">{escape(contact['title'])}</h2><p class="text-muted mb-6 max-w-lg mx-auto">{escape(contact['description'])}</p>
    <div class="contact-links"><a href="mailto:{escape(contacts['email'], quote=True)}" class="contact-btn"><i class="fa-regular fa-envelope"></i> {escape(contacts['email'])}</a><a href="{escape(contacts['linkedin'], quote=True)}" target="_blank" rel="noopener noreferrer" class="contact-btn"><i class="fa-brands fa-linkedin"></i> LinkedIn</a><a href="{escape(contacts['google_scholar'], quote=True)}" target="_blank" rel="noopener noreferrer" class="contact-btn"><i class="fa-solid fa-graduation-cap"></i> Google Scholar</a></div>
    <div class="contact-footer-note"><p class="text-muted text-sm">&copy; 2026 {escape(person['display_name'])}. All rights reserved.</p><p class="text-muted text-sm">Last updated: <time datetime="{escape(contact['last_updated'], quote=True)}">{escape(contact['last_updated_label'])}</time></p></div>
</div></div></section>'''


def load_site_config() -> dict:
    return _read_json(SITE_CONFIG)


def load_experience_config() -> dict:
    return _read_json(EXPERIENCE_CONFIG)
