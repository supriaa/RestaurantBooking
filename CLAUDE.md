# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the site

No build step. Open directly in a browser:

```
open index.html
```

Or serve locally to avoid any browser file:// restrictions:

```
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Architecture

Three-file vanilla stack — no framework, no bundler, no dependencies.

| File | Role |
|------|------|
| `index.html` | All markup. Sections in order: `#navbar`, `#hero`, `#menu`, `#testimonials`, `#reservations`, `#footer`. |
| `styles.css` | All styling. CSS custom properties at `:root` drive the entire palette and font stack. |
| `script.js` | All behaviour: nav scroll effect, hamburger, IntersectionObserver scroll-reveal, testimonial carousel, form validation. |

### Design tokens (styles.css `:root`)
`--dark`, `--cream`, `--cream-light`, `--gold`, `--gold-dark`, `--text`, `--text-muted` — change these to retheme the whole site.

Fonts: **Cormorant Garamond** (headings, `--serif`) + **Montserrat** (body/UI, `--sans`) loaded from Google Fonts.

### Scroll-reveal pattern
Any element with class `reveal` starts at `opacity:0; transform:translateY(28px)`. The `IntersectionObserver` in `script.js` adds `.visible` when the element enters the viewport, triggering the CSS transition.

### Testimonial carousel
Three `.testimonial-card` elements sit stacked via `position:absolute`. The active card gets `opacity:1`; others are `opacity:0`. `setInterval` (5 s) cycles through them. Pauses on hover/focus.

### Form validation
`validateForm()` in `script.js` runs on submit, checks each field against a rules array, and writes error text into sibling `.error-msg` spans. On success, the `<form>` is hidden and `#confirmation` is shown with an interpolated message. No backend — client-side only.

## Unsplash images
All photos use direct `images.unsplash.com/photo-{ID}` URLs with `?auto=format&fit=crop&w=800&q=80`. If an image 404s, replace the `photo-{ID}` portion in `index.html` with a valid Unsplash photo ID.

## Responsive breakpoints
- `≤ 900px` — menu grid drops from 3 → 2 columns
- `≤ 768px` — hamburger nav, all grids go 1-column, hero parallax disabled
- `≤ 480px` — font sizes reduced, submit button goes full-width
