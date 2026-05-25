# Site Performance Review

## Scope

This report reviews the browser-side performance characteristics of the site in `/Users/billabobz/Web_space/docs`, with emphasis on:

- responsiveness and smoothness
- memory-related behavior
- browser rendering/compositing cost
- opportunities to optimize **without removing visual effects**

The goal is not to simplify the design, but to preserve the site’s visual identity while making the runtime behavior smoother on weaker machines, including 8 GB MacBooks.

## Executive Summary

The site is **not primarily constrained by JavaScript heap size or bundle size**. Its main problem is that too many visual systems are treated as **always-active runtime systems**.

The current implementation keeps multiple decorative and interaction effects running continuously:

- permanent `requestAnimationFrame` loops
- multiple recurring timers
- many simultaneous CSS animations
- fixed blurred/glass layers with compositor cost
- hidden embedded content that still exists as live DOM content

This creates a runtime profile where:

- transfer size is acceptable
- heap usage is low
- DOM size is moderate
- but continuous rendering pressure is high

In practical terms, this means the page can feel unresponsive on weaker laptops even though it is not "large" in the traditional sense.

## Key Findings

### 1. The site is animation-heavy rather than memory-heavy

Measured runtime signals indicated:

- low JavaScript heap usage
- moderate DOM size
- acceptable network payload for a portfolio site
- persistent animation activity
- observable frame spikes consistent with perceived jank

This indicates the main bottleneck is **rendering/compositing smoothness**, not raw memory exhaustion.

### 2. Too many effects are always alive

Several effects are implemented as permanent systems rather than conditional systems.

Examples include:

- loader wave animation loop in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:69)
- custom cursor outline loop in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:448)
- typewriter cycle in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:166)
- CRT log message cycling in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:932)
- hero ticker animation in [`docs/css/style.css`](/Users/billabobz/Web_space/docs/css/style.css:4235)

The issue is not that these effects exist. The issue is that they continue to consume browser budget even when the user is no longer actively engaging with the section that needs them.

### 3. The hero section carries disproportionate runtime cost

The hero area combines many simultaneous systems:

- atom/orbit animation
- CRT terminal flicker and logging
- avatar hover tilt
- typewriter loop
- ticker motion
- intro fade staging
- custom cursor interactions

Together these make the hero visually rich, but they also turn it into the most expensive part of the page from a runtime perspective.

### 4. Large blur and glass effects likely raise compositor/GPU cost

The site uses several expensive visual patterns:

- fixed blurred background shapes in [`docs/css/style.css`](/Users/billabobz/Web_space/docs/css/style.css:165)
- `backdrop-filter` based glass panels, for example [`docs/css/style.css`](/Users/billabobz/Web_space/docs/css/style.css:92)
- multiple glow-heavy box shadows and animated transforms

These effects are visually aligned with the design language, but on weaker hardware they increase the cost of painting and compositing.

### 5. Hidden embedded content is still live content

Poster content includes `iframe` elements in the DOM:

- [`docs/index.html`](/Users/billabobz/Web_space/docs/index.html:984)
- [`docs/index.html`](/Users/billabobz/Web_space/docs/index.html:1060)

Although hidden by UI state, they still exist structurally. That is not ideal for a site that is already visually expensive. These should be mounted only when needed.

### 6. Runtime work is fragmented across independent loops and timers

The site uses many separate timing systems:

- `requestAnimationFrame`
- `setInterval`
- `setTimeout`
- mutation observers
- per-feature event listeners

Examples:

- loader timers in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:87), [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:114), [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:122)
- cursor loop in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:448)
- page avatar mutation observers in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:1011), [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:1025)

This fragmented execution model makes the site harder to tune and means the browser is often doing decorative work that could be paused, downgraded, or centralized.

### 7. The page engine is functionally fine but should be runtime-aware

The page engine in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:498) provides strong navigation behavior, but it currently does not coordinate the lifecycle of decorative systems aggressively enough.

It should become the main controller for determining:

- which section is active
- which effects should be live
- which effects should be paused
- which effects should enter a lower-power idle mode

## What Is Not The Main Problem

The following are **not** the main causes of the sluggish feel:

- oversized JavaScript bundle
- excessive application state
- large SPA framework overhead
- large JavaScript heap growth
- unusually large DOM tree

The site is a static site with relatively modest code payloads. The dominant issue is **continuous visual runtime cost**.

## Optimization Goal

The optimization goal should be:

> Preserve all current effects, but optimize **when**, **where**, and **how long** they run.

This means:

- no visual simplification by default
- no removal of signature motion or styling
- runtime gating instead of design reduction

## Recommended Optimization Strategy

The correct strategy is to move from **always-on effects** to **state-driven effects**.

Four control layers should be introduced:

### 1. Visibility gating

Effects should run only when the relevant section is active or visible.

### 2. Interaction boosting

Effects should run at full intensity during:

- pointer movement
- hover
- scrolling
- page transitions
- direct user engagement

### 3. Idle degradation

After a short idle period, the same effects should continue in a cheaper mode:

- lower update frequency
- paused nonessential loops
- slower decorative cadence

### 4. On-demand mounting

Expensive embedded content should not be present as live DOM/runtime content until the user opens it.

## Detailed Recommendations

## A. Hero Runtime Isolation

### Problem

The hero section combines several visually expensive systems and keeps them conceptually active as a cluster.

### Recommendation

Treat the hero as an isolated runtime zone.

Only run hero systems at full strength while the hero page is active.

### Apply to

- typewriter
- hero ticker
- atom/orbit motion
- CRT terminal log cycling
- avatar tilt
- hero-specific decorative loops

### Suggested implementation approach

- Introduce a hero controller in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:147)
- Connect it to `PageEngine` activation state in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:498)
- Make each effect startable and stoppable instead of self-running permanently

### Expected benefit

This is likely the single highest-value change for improving smoothness without altering the design.

## B. Cursor Effect Scheduling

### Problem

The custom cursor outline uses a permanent `requestAnimationFrame` loop in [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:448).

### Recommendation

Keep the same cursor effect, but run it only when necessary.

### Suggested behavior

- Start the loop on mouse movement
- Keep running briefly while the cursor is settling
- Stop once movement has ended and the outline is visually stable

### Implementation concept

- store `rafId`
- store a movement-active flag
- cancel the loop after a short inactivity threshold

### Expected benefit

Removes one permanent global animation loop while preserving the same visible behavior.

## C. Loader Lifecycle Tightening

### Problem

The loader is appropriate as an entry effect, but it should fully shut down once complete.

### Relevant code

- [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:4)

### Recommendation

- build loader-only effects only when needed
- explicitly stop all timers and animation handles after completion
- avoid creating loader drift/wave content when intro is skipped

### Expected benefit

Reduces startup work and prevents temporary effects from behaving like long-lived systems.

## D. Dual-Mode Decorative Systems

### Problem

Decorative systems such as typewriter text, ticker motion, and CRT updates run at full conceptual strength even when the user is inactive.

### Recommendation

Use two operational modes:

- `active mode`
- `idle mode`

### Example

- CRT log update every `1800 ms` while active, much slower while idle
- typewriter pauses after a full cycle if no user interaction occurs
- ticker continues at a slower cadence when not actively read

### Expected benefit

Preserves the effect while lowering constant rendering churn.

## E. Blur and Glass Cost Control

### Problem

Large blurred fixed layers and repeated glass surfaces likely increase compositor pressure significantly.

### Relevant code

- [`docs/css/style.css`](/Users/billabobz/Web_space/docs/css/style.css:165)
- [`docs/css/style.css`](/Users/billabobz/Web_space/docs/css/style.css:92)

### Recommendation

Keep the visual language, but simplify implementation cost:

- reduce giant blur radii where possible
- merge overlapping visual layers
- prefer animating transforms and opacity rather than expensive filter characteristics
- use fewer simultaneous high-cost translucent layers

### Expected benefit

Better smoothness during scrolling and transitions on weaker hardware without visually flattening the design.

## F. Lazy Mount Embedded Poster Content

### Problem

Poster `iframe`s exist in the DOM even before the user opens them.

### Relevant code

- [`docs/index.html`](/Users/billabobz/Web_space/docs/index.html:984)
- [`docs/index.html`](/Users/billabobz/Web_space/docs/index.html:1060)

### Recommendation

Mount iframes only on demand.

### Suggested behavior

- on first open: create iframe and assign `src`
- on close: either keep mounted for reuse or unmount after a timeout / section exit

### Expected benefit

Lowers live document and frame cost and reduces hidden runtime overhead.

## G. Page Engine As Lifecycle Controller

### Problem

The page engine currently controls navigation, but not enough of the effect lifecycle.

### Relevant code

- [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:498)

### Recommendation

Use `PageEngine` as the main runtime coordinator.

It should determine:

- active section
- active effect groups
- paused effect groups
- idle effect groups

### Expected benefit

Creates a coherent runtime model rather than many separate always-live features.

## H. Observer and Timer Discipline

### Problem

Observers and timers are distributed feature-by-feature.

### Relevant code

- [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:1011)
- [`docs/js/main.js`](/Users/billabobz/Web_space/docs/js/main.js:1025)

### Recommendation

- keep references to observers
- disconnect them when no longer useful
- centralize effect scheduling where possible

### Expected benefit

Improves maintainability and reduces the chance of decorative runtime work accumulating over time.

## Proposed Runtime Model

The optimized version should behave like this:

### On first visit

- full intro loader runs
- hero visual systems run at full strength

### While the hero is active

- hero effects remain fully active
- cursor enhancements stay live
- ticker and CRT run normally

### After short idle time

- same visuals remain visible
- decorative systems shift to lower-cost cadence

### After leaving hero

- hero-only loops pause
- section-independent minimum styling remains
- only relevant page effects stay active

### When poster content is opened

- iframe mounts on demand

### When poster content is closed or section is left

- iframe can remain cached briefly or be unmounted depending on chosen tradeoff

### When the tab is hidden

- all nonessential loops pause

### When the tab is reactivated

- effects resume according to the current section and activity state

## Proposed Implementation Order

The following order gives the best payoff while keeping risk manageable:

1. Hero effect gating
2. Custom cursor demand-start RAF scheduling
3. Lazy iframe mounting
4. Idle-mode behavior for CRT, typewriter, and ticker
5. Background blur/glass cost reduction
6. Page-engine lifecycle coordination
7. Observer/timer lifecycle cleanup

## Decision Guidance

If the question is whether the current design must be simplified, the answer is:

**No.**

The design can be preserved.

If the question is whether the current runtime model should change, the answer is:

**Yes.**

The site should transition from:

- many always-active visual systems

to:

- section-aware
- interaction-aware
- idle-aware
- on-demand visual systems

That is the correct path to smoother perceived performance without sacrificing the identity of the site.

## Final Conclusion

This site’s performance issue is mainly one of **activation strategy**, not content weight.

The most effective optimization path is:

- keep every effect
- stop running every effect all the time
- activate heavy visuals only when they are being consumed
- degrade gracefully during idle
- mount expensive embedded content only when required

This approach preserves the site’s current style while producing a much smoother user experience on weaker hardware.
