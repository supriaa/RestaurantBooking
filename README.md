# La Maison Singa

An elegant fine-dining restaurant website for a French restaurant in Singapore, built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

## Live Demo

[View Site](https://supriaa.github.io/RestaurantBooking/)

## Features

- Sticky navigation that transitions from transparent to dark on scroll
- Mobile hamburger menu with outside-click-to-close
- Animated scroll-reveal for menu sections and content blocks (IntersectionObserver)
- Auto-rotating testimonial carousel (5 s interval, pauses on hover/focus, dot navigation)
- Full menu across three courses: Entrées, Plats Principaux, and Desserts with pricing in SGD
- Table reservation form with client-side validation (name, email, phone, guests, date, time)
- Booking confirmation message on successful submission with guest name and date interpolated
- Responsive layout: 3-column menu grid → 2-column at 900 px → 1-column at 768 px
- Hamburger nav on mobile; hero parallax disabled on small screens
- Accessible markup: ARIA roles, `aria-expanded`, `aria-live` regions, focus management

## Tech Stack

- HTML5 (semantic sections, ARIA attributes)
- CSS3 (custom properties for theming, CSS transitions, `position: absolute` carousel)
- Vanilla JavaScript (`IntersectionObserver`, `setInterval`, client-side form validation)
- Fonts: Cormorant Garamond + Montserrat (Google Fonts)
- Images: Unsplash (`images.unsplash.com`)

## Getting Started

No build step required. Open directly in a browser:

```bash
open index.html
```

Or serve locally to avoid `file://` restrictions:

```bash
python3 -m http.server 8080
# visit http://localhost:8080
```

## Project Structure

```
├── index.html          # All markup — navbar, hero, menu, testimonials, reservations, footer
├── styles.css          # All styling — CSS custom properties drive the full palette and font stack
├── script.js           # All behaviour — nav scroll, hamburger, scroll-reveal, carousel, form validation
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions — deploys to GitHub Pages on every push to main
```

## Design Tokens

Edit these CSS custom properties in `styles.css` `:root` to retheme the entire site:

| Token | Role |
|-------|------|
| `--dark` | Primary dark background |
| `--cream` | Main light background |
| `--cream-light` | Subtle off-white variant |
| `--gold` | Accent colour |
| `--gold-dark` | Accent hover state |
| `--text` | Body text |
| `--text-muted` | Secondary/muted text |

## Deployment

Deployed automatically to GitHub Pages via GitHub Actions on every push to `main`. The workflow file is at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
