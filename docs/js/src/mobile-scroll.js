// ========== MOBILE SINGLE-SCROLL MODE ==========
const MobileScrollMode = (() => {
    let initialized = false;

    function pages() {
        return Array.from(document.querySelectorAll('.page'));
    }

    function closeMenu() {
        navLinksEl?.classList.remove('active');
        const icon = mobileToggle?.querySelector('i');
        mobileToggle?.setAttribute('aria-expanded', 'false');
        mobileToggle?.setAttribute('aria-label', 'Open navigation menu');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    function sectionForLink(link) {
        const href = link.getAttribute('href') || '';
        if (href === '#' || link.dataset.pageLink === '0') {
            return document.getElementById('page-hero');
        }
        if (href.startsWith('#')) {
            return document.querySelector(href);
        }
        const idx = parseInt(link.dataset.pageLink || '', 10);
        return Number.isNaN(idx) ? null : pages()[idx] || null;
    }

    function setActive(section) {
        const allPages = pages();
        const idx = allPages.indexOf(section);
        document.querySelectorAll('[data-page-link]').forEach((link) => {
            const target = sectionForLink(link);
            link.classList.toggle('active', target === section || parseInt(link.dataset.pageLink || '-1', 10) === idx);
        });
        allPages.forEach((page) => page.classList.toggle('active', page === section));
    }

    function scrollToSection(section, { updateHash = true } = {}) {
        if (!section) return;
        setActive(section);
        section.scrollIntoView({ behavior: 'auto', block: 'start' });
        if (updateHash && window.history?.replaceState) {
            const url = section.id === 'page-hero'
                ? window.location.pathname + window.location.search
                : `#${section.id}`;
            window.history.replaceState(null, '', url);
        }
        closeMenu();
    }

    function goTo(idx) {
        scrollToSection(pages()[idx] || pages()[0]);
    }

    function init() {
        if (initialized) return;
        initialized = true;

        document.querySelectorAll('[data-page-link]').forEach((link) => {
            link.addEventListener('click', (event) => {
                if (!isMobileViewport()) return;
                const section = sectionForLink(link);
                if (!section) return;
                event.preventDefault();
                scrollToSection(section);
            });
        });

        const observer = new IntersectionObserver((entries) => {
            if (!isMobileViewport()) return;
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible?.target) setActive(visible.target);
        }, {
            root: null,
            threshold: [0.25, 0.45, 0.65],
        });

        pages().forEach((page) => observer.observe(page));
        const initial = window.location.hash ? document.querySelector(window.location.hash) : document.getElementById('page-hero');
        setActive(initial || pages()[0]);
    }

    return { init, goTo };
})();

if (typeof isMobileViewport === 'function' && isMobileViewport()) {
    MobileScrollMode.init();
}

window.addEventListener('resize', () => {
    if (typeof isMobileViewport === 'function' && isMobileViewport()) {
        MobileScrollMode.init();
    }
});
