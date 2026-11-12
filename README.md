# MoveMyCar.ae frontend demo

Static HTML, CSS, and JavaScript. No backend, database, payment collection, real GPS, SMS, or WhatsApp integration.

## Run locally

With Node.js installed, from this folder:

```powershell
npm.cmd start
```

Open http://127.0.0.1:4173. The preview server is a development file server only, not an application backend. No runtime packages are needed.

## Demo panels

| Route | Email | Password |
| --- | --- | --- |
| `/dealer-panel/` | `dealer@MoveMyCar.ae` | `dealer123` |
| `/admin-panel/` | `admin123@MoveMyCar.ae` | `admin123` |
| `/driver-panel/` | `driver@MoveMyCar.ae` | `driver123` |
| `/customer-panel/` | `customer@MoveMyCar.ae` | `customer123` |

Username aliases: `dealer`, `admin123`, `driver`, and `customer`. Emails are case insensitive. Sessions last eight hours in the current browser tab. Sign out from the dashboard. These public frontend credentials and route checks are demonstration UX, not secure authentication. The driver login represents Joseph Paul (DRV-102); the customer login represents Aisha Al Mansoori (CUS-101).

Dealer features: reference-inspired sidebar, movement statistics and charts, searchable movement lists with detail panels, single and batch bookings with itemised quotes, handovers, invoice previews, reporting exports, and saved account preferences.

Admin features: operations overview, booking demand and driver charts, searchable movements, map-based dispatch with driver allocation, delivery completion, driver directory and locally saved registration requests, searchable dealership details, invoice creation and recorded payment status, reporting charts, and CSV exports. Recording a payment changes local status only; no payment is collected.

Presentation data includes 60 seeded movements, 10 drivers, 10 dealerships, 10 customers, and two registration requests. Dates are relative to the current UAE day, with realistic booking/collection/delivery chronology, seven-day chart activity, completed trips, pending trips, paid/unpaid invoices, and cancellations. The dealer account has its own active moves and completed history.

All four roles share the same records. Driver assignment reserves availability; pickup requires an eight-point inspection and digital signature; transit follows pickup; delivery requires a signed inspection and mileage validation. Delivery updates invoices, availability, history, and earnings. Payments are idempotent previews and create downloadable/printable payment slips. Cancellations cannot silently refund paid bookings. Reports exclude cancelled value where appropriate.

Bookings, assignments, and preferences use localStorage on the same origin. Session state uses sessionStorage. A versioned `mmc-presentation-v2` store preserves new presentation records and synchronizes other open tabs. Older `mmc-jobs-v1` storage is retained; non-seed legacy bookings are copied into the new dataset. To restore clean presentation data, clear `mmc-presentation-v2` in browser storage and reload. Driver/customer panels are now connected workspaces, replacing the old independent phone simulator.

## Folder structure

- `index.html`: public website, shared dealer and dispatch layouts, dialogs.
- `dealer-panel/`, `admin-panel/`, `driver-panel/`, `customer-panel/`: generated static entry pages with correct asset base paths and noindex metadata.
- `css/variables.css`: shared indigo palette and design tokens.
- `css/style.css`: public website styles.
- `css/portals.css`: shared portal, signature, and document styling.
- `css/responsive.css`: responsive corrections, accessible focus, workspace styles, print layout.
- `css/combobox.css`, `js/combobox.js`: searchable, grouped, keyboard-accessible select enhancement, including dynamically created controls. Native selects retain form values and validation. Popups are portalled above content and constrained to the viewport.
- `css/dashboard.css`: sidebar workspaces, cards, charts, list/detail layouts, booking charges, and documents.
- `assets/movemycar-logo.png`: supplied brand logo, preserved without image edits.
- `js/booking-ui.js`: itemised quotes, collection dates, field labels, and modal focus management.
- `css/calendar.css`, `js/calendar.js`: shared responsive date picker for the booking bar and booking dialog. Supports month navigation, Today/Tomorrow shortcuts, arrow keys, Page Up/Down, native ISO values, and min/max/required validation.
- `css/maps.css`, `js/google-maps.js`: responsive Google Maps route and position links. These official Maps URLs need no API key or billing. Position links follow the simulated vehicle marker.
- `js/maps-config.js`: optional browser-restricted Google Maps Embed API key. When configured, tracking and dashboard maps offer an inline Google route preview. Without a key, the free OpenStreetMap tracking view stays active and no keyed Google API requests are made.
- `js/demo-store.js`: storage helpers, HTML escaping, reference generation.
- `js/mock-data.js`: UAE locations and illustrative records.
- `js/calculator.js`: estimated distances and sample quotes.
- `js/map-tracker.js`: OpenStreetMap basemap and simulated movement.
- `js/main.js`: navigation, booking wizard, fleet filters, modals.
- `js/panels.js`: route handling, demo login, dashboard tabs and actions.
- `js/operations.js`: shared presentation data, scoped records, workflow transitions, money/status consistency, persistence, and cross-tab synchronization.
- `js/role-views.js`: connected driver inspections, signatures, history, earnings, and customer bookings/payments.
- `js/payments.js`: payment simulation and downloadable payment slips; no payment-provider requests or card details.
- `js/table-pager.js`: accessible pagination for larger movement and invoice tables.
- `css/audit.css`: final responsive layout, contrast, inspection, and keyboard-accessibility refinements.
- Other `js/` modules: dealer movements, admin dispatch, and documents.
- `scripts/build-pages.cjs`: regenerate all four panel entry pages and package `dist/` after editing shared HTML.
- `scripts/serve.cjs`: local static preview server.
- `scripts/check.cjs`: syntax, data logic, asset, and entry-page checks.

## Verification and deployment

```powershell
npm.cmd run build
npm.cmd run check
```

`npm run build` generates all four route entry pages, adds content-hashed stylesheet/script URLs, validates the JavaScript/data logic, and packages the static website in `dist/`. Deploy `dist/` to a static host with directory index support. Refreshing any panel route works without a SPA fallback. `dist/` excludes development scripts, dependencies, and Git metadata.

The existing application remains HTML/CSS/JavaScript; no framework migration or backend was introduced. There is no TypeScript project to type-check. Build validation includes syntax, local assets, duplicate IDs, route entry points, and business-rule tests.

Leaflet and the existing stock images are bundled under `assets/` so they load locally. OpenStreetMap tiles and optional Google Fonts require internet access. The map has an unavailable state and attribution. Routes are illustrative straight lines; positions, speeds, and ETAs are simulated. Distances and quotes are estimates. Invoices and inspection photographs are samples, not tax documents or vehicle condition evidence. Arabic translation is not implemented; the misleading language toggle was removed.

Browser checks are available with `npm.cmd run test:browser` while the preview server is running. Install development dependencies with `npm.cmd install` and a browser with `npx.cmd playwright install chromium` first. Alternatively set `MMC_BROWSER_PATH` to an existing Chromium executable. Checks cover widths from 320 to 1440 pixels, role login, persistence, batch submission, documents, dispatch, delivery completion, and booking.

The browser suite uses Playwright and axe-core to check the public site, four role workflows, payment slips, signed handovers, table pagination, search/filter states, and automated WCAG A/AA rules. Additional checks are `scripts/presentation-extras.cjs`, `scripts/calendar-check.cjs`, `scripts/select-check.cjs`, and `scripts/google-maps-check.cjs`. QA screenshots and machine-readable reports are generated in ignored `artifacts/`. See `AUDIT.md` for the client presentation walkthrough and limitations.

The site uses a vanilla JavaScript combobox rather than adding React solely for shadcn/ui. It supports search, separate UAE city/emirate groups, selected and active states, disabled options, arrows, Home/End, Enter, Escape, Tab, outside-click dismissal, programmatic value changes, and native required-field validation. Unsupported JavaScript environments retain the original native selects.

The public demo banner and repeated demo labels have been removed from the product UI. Frontend-only limitations still apply: browser storage is local to each origin/device; authentication cannot secure data; maps use estimated positions; documents use reference photographs; invoice previews lack a registered tax identity; SMS, remote applications, and payments are not connected. The driver workspace shares the operations records and supports saved inspections and signatures.

## Research

Google documents [Maps URLs as free and keyless](https://developers.google.com/maps/architecture/maps-url). The [Maps Embed API](https://developers.google.com/maps/documentation/embed/quickstart) has no usage charge, but requires a Google Cloud project, enabled API, billing account, and API key. To enable inline Google route previews, set `googleEmbedApiKey` in `js/maps-config.js` to a key restricted to your website origins and the Maps Embed API. The key is public browser configuration, not a server secret. The Google Maps JavaScript API is not enabled by this project; do not assume its custom live tracking features are unlimited or free. The embedded view shows a route, not a live GPS feed.

Dashboard scope follows common dispatch, proof-of-delivery, and reporting workflows described by [Onfleet](https://onfleet.com/data-and-analytics). Map implementation follows [Leaflet documentation](https://leafletjs.com/reference.html) and the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/). The public tile service has no availability guarantee; review provider requirements before a production launch.
