const sectionOrder = [
    "hero",
    "about",
    "philosophy",
    "experience",
    "education",
    "research",
    "current-research",
    "contact",
];

async function loadSections() {
    const pageEngine = document.getElementById("page-engine");
    if (!pageEngine) return;

    const root = pageEngine.dataset.sectionsRoot || "sections";
    const fragments = await Promise.all(
        sectionOrder.map(async (name) => {
            const response = await fetch(`${root}/${name}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load section: ${name}`);
            }
            return response.text();
        })
    );

    pageEngine.innerHTML = fragments.join("\n\n");

    const script = document.createElement("script");
    script.src = "js/main.js?v=18";
    document.body.appendChild(script);
}

window.addEventListener("DOMContentLoaded", () => {
    loadSections().catch((error) => {
        console.error(error);
    });
});
