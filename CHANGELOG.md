# Changelog

All notable changes made to the Timmy's Yummy Bakes website are documented here.
Dates use the format YYYY-MM-DD. Each Part 3 entry matches one or more commits in the Git history.

## [Part 3] - 2026-11-02

### Added
- **Images:** moved images from `css/images/` to `images/`, renamed them descriptively (e.g. `red-velvet-sponge-cake-layers.jpg`), added nine close-up crops for the gallery and menu, and saved compressed progressive JPEGs with 480px thumbnails for `srcset`.
- **Shared interactions (`js/main.js`):** accessible hamburger menu, sticky header shadow, back-to-top button, scroll-reveal animations, FAQ accordion with keyboard support and an image slider with dots, auto-play, pause on hover and swipe.
- **Home page:** hero section, customer favourites linking to a pre-filtered menu, "Fresh From the Oven" slider, ordering steps and a call-to-action banner.
- **About page:** values, a five-question FAQ accordion, and a credits and references section.
- **Menu page:** products stored in `js/products.js` and rendered dynamically. Live case-insensitive search with highlighting, category filter buttons, sorting, a result count, a no-results message, URL-synced filters and an Enquire button on each product.
- **Gallery page (new):** twelve lazy-loaded photos, category filters and a lightbox with caption, counter, next/previous, arrow keys, Esc, click-outside, swipe and focus trapping.
- **Enquiry form:** occasion, product, quantity, collection method and consent fields. Real-time inline validation of every field (SA phone, email, date not in the past, weekend-only market stall, message length). Instant estimated cost with a bulk discount, an availability check, a reference number, sending via Formspree and clearing the form.
- **Contact form:** phone and subject fields, the same validation, and email sending via Formspree with loading, success and error states and a spam honeypot.
- **Interactive map:** Leaflet and OpenStreetMap map of Ermelo with a branded market-stall pin, popup with a directions link, privacy-friendly pickup area, "Show on map" buttons and an offline fallback.
- **SEO:** unique titles (50–60 characters), meta descriptions (150–160 characters), keywords, canonical URLs, Open Graph and Twitter tags on every page, schema.org Bakery JSON-LD, `sitemap.xml`, a custom `404.html` and an SVG favicon.
- **Accessibility:** skip link, one `h1` per page, focus-visible styles, ARIA attributes on every widget, reduced-motion support and fallbacks for visitors without JavaScript.
- `js/config.js` holds the Formspree endpoint and pricing rules in one place.
- Comprehensive `README.md` with setup, email set-up, deployment steps, screenshots and Harvard references.

### Changed
- Rebuilt `css/style.css` around CSS custom properties (design tokens) and added Google Fonts (Playfair Display and Nunito).
- Moved the site name out of `<h1>` into a logo link, so each page's main heading is its only `<h1>`.
- Navigation now includes the Gallery page and marks the current page with `aria-current`.
- The footer now has quick links, a clickable phone number and a credits link.

### Fixed
- **Broken images:** HTML pointed to `images/` but the files were in `css/images/`.
- Contact page maps pointed to **Sandton** instead of Ermelo.
- Invalid CSS: `margin-bottom: 1 rem` (space in the unit) and a stray `;` that broke the product-card `box-shadow`.
- Removed duplicated media-query and `img` blocks in the stylesheet.
- `enquiry.html` linked to a missing `js/script.js`.
- The lightbox close button did not receive focus on open, because the visibility transition started as hidden.
- A malformed class attribute on the 404 page.

## [Part 2] - 2026-09-25

### Added
- Created an external CSS stylesheet.
- Added a CSS reset for consistent styling.
- Added typography styles for headings and paragraphs.
- Styled the website header and navigation.
- Added active navigation states.
- Added hover effects for navigation links.
- Added responsive navigation.
- Created a responsive three-column product grid for larger screens.
- Added responsive product cards.
- Added styling for buttons and forms.
- Added focus states for form fields and buttons.
- Added menu item styling.
- Added borders, rounded corners and box shadows.
- Added responsive layouts for tablet and mobile screens.
- Added an images folder for website images.
- Created project documentation using README.md.

### Changed
- Improved the overall visual appearance of the website.
- Improved navigation layout and spacing.
- Improved the layout of products and menu items.
- Added responsive behaviour using CSS media queries.

### Fixed
- Corrected the navigation list styling.
- Corrected the product grid layout.
- Corrected menu list styling.
- Fixed website image file paths.

## [Part 1]

### Added
- HTML structure and content for the Home, About, Menu, Enquiry and Contact pages.
