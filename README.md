# MoveMyCar UAE

A working frontend prototype for a UAE vehicle relocation service: instant quotes,
live GPS tracking, dealership fleet tools, and driver workflows, all in one page.

## How to Run

No build tools or dependencies needed. Open the page directly in a browser:

```powershell
Start-Process "e:\movemycar-uae\index.html"
```

Or serve it locally:

```powershell
cd "e:\movemycar-uae"
npx serve .
# or: python -m http.server 8080
```

## Project Structure

```
movemycar-uae/
├── index.html                   # Single-page layout, modals, and view switching
├── css/
│   ├── variables.css            # Design tokens and color palette (modern indigo theme)
│   ├── style.css                # Hero, fleet grid, booking bar, footer, responsiveness
│   └── portals.css              # Dealer portal, dispatch hub, phone simulator, invoice
└── js/
    ├── mock-data.js             # UAE locations (GPS coords), fleet, driver roster, demo jobs
    ├── calculator.js            # Distance, duration, and 5% UAE VAT pricing
    ├── map-tracker.js           # Leaflet GPS tracking with animated route and ETA
    ├── handover-report.js       # 8-point inspection, signature pad, VAT invoice
    ├── dealer-portal.js         # Dealer portal, batch VIN manager, fleet table
    ├── dispatch-dashboard.js    # Dispatch hub, unassigned queue, driver allocation
    ├── driver-app.js            # Driver mobile app simulator
    └── main.js                  # Global controller, fleet filter, booking wizard
```

## Main Features

1. **Public booking flow.** Floating booking bar with instant quote calculation,
   a three-step booking wizard, and a hero with a transparent car visual.
2. **Luxury fleet showcase.** Filterable cards for Rolls-Royce, BMW, Mercedes-AMG,
   Porsche, and Range Rover, each loading straight into the booking engine.
3. **Dealership portal.** Single and bulk fleet movements with multi-VIN entry,
   an orders table with status filters, and consolidated billing stats.
4. **Dispatch hub.** Unassigned queue, driver proximity roster, and one-click
   driver allocation that syncs back to the dealer table.
5. **Live tracking.** Leaflet map along UAE highway corridors with a moving vehicle
   marker, speed readout, and ETA countdown.
6. **Handover reports and invoices.** 8-point photographic inspection, canvas
   e-signatures, printable handover certificates, and FTA-format 5% VAT invoices.
7. **Driver app simulator.** Phone mockup walking through trip alert, inspection,
   navigation, and payment stages.
