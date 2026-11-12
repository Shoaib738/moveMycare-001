# MoveMyCar UAE presentation audit

The frontend keeps the supplied logo and indigo design. It now has connected admin, dealer, driver, and customer workspaces backed by one browser-local presentation dataset: 60 seeded movements and 10 records each for drivers, dealerships, and customers. Existing non-seed bookings are retained during migration.

## Changes

- Replaced the disconnected driver simulator with assigned jobs, collection/delivery inspections, required checks and signatures, pickup/transit/delivery transitions, history, and calculated earnings.
- Added a customer workspace, booking confirmation actions, payment previews, paid/unpaid invoice states, and downloadable/printable payment slips. No card or bank credentials are requested.
- Centralized assignment and status rules. A driver cannot be allocated two active jobs. Pickup/delivery require inspections; delivery mileage cannot decrease. Completed jobs release availability and appear in invoices, reports, and history.
- Added customer records to admin; populated dealership accounts, drivers, movements, and activity charts. Added table pagination and retained scoped search, status/period filters, CSV exports, and invoice previews.
- Preserved responsive searchable selects and compact calendars. Fixed muted-text and green-status contrast, range-label accessibility, focus/skip navigation, and cancelled-value/report calculations.
- Kept Google Maps links and the optional keyed Embed API setup. GPS progress and map route lines remain simulated/estimated.
- Made font loading non-blocking, retained local imagery/Leaflet and lazy fleet images, and generated hashed CSS/JS URLs. The static production build is `dist/`, with four refreshable role routes.

## Verification

`npm run build` runs static-page generation, syntax/asset checks, and business-rule tests. Browser checks cover 320, 375, 640, 768, 1024, and 1440px widths using Chromium. Tested flows include public booking and confirmation, customer payments/slips, a driver collection-to-delivery journey with signatures, dealer bulk quotes and history, admin dispatch/invoices/customer records, exports, pagination, period/status filters, persistence, direct-route refresh, browser navigation, and cross-tab synchronization.

The main Playwright/axe run found no JavaScript errors, missing local assets, or automated WCAG A/AA violations in the tested public and role-based states. Supporting checks exercise native form validation, searchable dropdowns, compact calendars, official Google Maps URL construction, and the optional Embed API toggle. This is automated coverage, not an accessibility certification or a physical-device/Safari/Firefox audit.

QA artifacts are written to `artifacts/presentation-audit.json`, `artifacts/accessibility-audit.json`, and role screenshots. Test-created bookings are confined to the automated browser context and do not change the seeded source data.

## Presentation walkthrough

1. Run `npm.cmd start` and open `http://127.0.0.1:4173`.
2. Show a public quote, date/location selection, booking confirmation, payment preview, and payment slip.
3. Open `/customer-panel/`: `customer@MoveMyCar.ae` / `customer123`. Show the same booking, invoice, and payment history.
4. Open `/driver-panel/`: `driver@MoveMyCar.ae` / `driver123`. Joseph Paul has an assigned movement. Complete collection checks, provide a name and an example/drawn signature, confirm pickup, start the journey, then complete the delivery inspection. Show its signed report and history.
5. Open `/dealer-panel/`: `dealer@MoveMyCar.ae` / `dealer123`. Show charts, movement history, handovers, invoices/slips, and a three-vehicle bulk quote with an 18% combined dealer/volume discount.
6. Open `/admin-panel/`: `admin123@MoveMyCar.ae` / `admin123`. Show all accounts, customers, driver availability, dispatch, invoices, analytics, and report downloads. The completed driver job is visible in the same data.

Use the same browser origin for shared records. Separate tabs may use different role sessions. To start a clean presentation, clear the `mmc-presentation-v2` localStorage key and reload. Never enter sensitive customer details in this prototype.

## Remaining limitations

- Frontend-only authentication and role filtering are not security boundaries. Browser data has no server backup, authorization, conflict resolution, or multi-device synchronization.
- Payments, receipts, earnings, identity checks, and tax invoices are presentation previews. No money is charged, transferred, or refunded. No legally valid tax identity is configured.
- Signatures and checklists persist locally. Seeded inspection photos/signatures are references, and real vehicle photo upload/storage is not implemented.
- GPS, ETAs, and route distances are simulated/estimated. OpenStreetMap tiles need internet; Google Embed requires the site's restricted Google key and Cloud setup. No background tracking is performed.
- PDF output uses the browser's Print / Save PDF dialog; CSV exports download directly. Messaging and remote driver applications are not connected.
- The repository is a static HTML/JavaScript app, not a Next.js/TypeScript build. Its existing structure was retained for this audit.
