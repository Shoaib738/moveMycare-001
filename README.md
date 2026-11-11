# MoveMyCar UAE — Premium Luxury Vehicle Logistics & Driver Management Platform
### Interactive Working Frontend Prototype (Light Luxury & Supercars Edition)

Built for **Mohamed Sharif** (MoveMyCar UAE expansion), designed to match the Dribbble design reference (`https://dribbble.com/shots/22968052-Super-Cars-Rental-Car-Service-Website`):
- **Vibrant Carmine/Crimson Fluid Wave Curve** on a clean, radiant white canvas (`#FFFFFF`)
- **High-Resolution Modern Cars (Rolls-Royce, BMW, Mercedes-AMG, Porsche, Range Rover)** with engine specs and 1-click booking
- **Interactive 3D Showroom Vehicle (Three.js)** with 360° mouse-drag rotation and real-time metallic paint customizer (Carmine Red, Pearl White, Stealth Onyx, UAE Gold)
- **Floating Horizontal Booking Bar** with instant quote calculation
- **Zero Wordy Fluff** — concise, actionable data, live telemetry, and interactive workflows
- **No Intrusive Demo Bars** — clean, production-grade navigation with seamless portal switching

---

## 🚀 How to Run & Preview

Open the prototype directly in any web browser without any build tools or dependencies:

1. **Direct Browser Open:**
   - Double-click [`index.html`](file:///C:/Users/tanwe/.gemini/antigravity/scratch/movemycar-uae/index.html) or run in PowerShell:
   ```powershell
   Start-Process "C:\Users\tanwe\.gemini\antigravity\scratch\movemycar-uae\index.html"
   ```

2. **Or via Local Web Server:**
   ```powershell
   cd "C:\Users\tanwe\.gemini\antigravity\scratch\movemycar-uae"
   npx serve .
   # or: python -m http.server 8080
   ```

---

## 🗂️ Clean Modular Architecture (Separated Files)

```
movemycar-uae/
├── index.html                   # Core semantic single-page layout & modal views
├── README.md                    # Platform documentation
├── css/
│   ├── variables.css            # Light luxury tokens & crimson red palette
│   ├── style.css                # Fluid crimson wave hero, fleet grid, floating booking bar
│   └── portals.css              # Dealership portal, dispatch hub, phone simulator, invoice
└── js/
    ├── three-car.js             # Three.js 3D luxury car viewer with showroom lighting & paint picker
    ├── mock-data.js             # UAE locations (GPS coords), luxury fleet, driver roster, demo jobs
    ├── calculator.js            # Highway distance calculation, duration estimator, UAE 5% VAT
    ├── map-tracker.js           # Real-time Leaflet GPS telemetry, speed indicator, animated marker
    ├── handover-report.js       # 8-point condition inspection, canvas signature pad, VAT invoice
    ├── dealer-portal.js         # B2B dealership portal, batch VIN manager, fleet table
    ├── dispatch-dashboard.js    # Operations hub, unassigned queue, 1-click driver allocation
    ├── driver-app.js            # Driver mobile app simulator (alert, inspection, navigation, payout)
    └── main.js                  # Global controller, fleet filter, booking wizard, language toggle
```

---

## 🌟 Key Features Delivered

1. **High-Resolution Modern Luxury Fleet Showcase:**
   - **Rolls-Royce Ghost Extended** (6.75L V12 Twin-Turbo · VIP White-Glove Handover)
   - **BMW M8 Competition Gran Coupe** (4.4L V8 · 617 HP · M xDrive)
   - **Mercedes-AMG G63 BiTurbo** (4.0L V8 · 577 HP · Prestige 4x4 Transit)
   - **Porsche 911 GT3 RS** (4.0L Flat-6 · 518 HP · Exotic Supercar Relocation)
   - **Range Rover SV Autobiography** (4.4L V8 Twin-Turbo · Executive Long Wheelbase)
   - **BMW 7 Series 760i xDrive** (TwinPower Turbo V8 · Flagship Luxury Sedan)
   - Category filtering: All Vehicles, Luxury Sedans, Prestige SUVs, Sports & Exotic.
   - 1-Click "Book Relocation" loads that exact car into the booking engine.
2. **Floating Horizontal Booking Search Bar:**
   - Collection & Delivery dropdowns (Dubai Marina, Downtown, Al Quoz, Abu Dhabi, Yas Island, Sharjah, etc.)
   - Vehicle category multipliers (Sedan, SUV, Prestige & Exotic, Commercial Van)
   - Dynamic highway distance & drive time calculation with 5% UAE VAT.
3. **Interactive 3D Showroom Car (Three.js):**
   - Metallic physical car paint shader with dynamic specular reflections
   - 360° mouse-drag rotation and smooth idle animation
   - Interactive paint switcher: Carmine Red, Pearl White, Stealth Onyx, UAE Gold.
4. **Dealership & Trader Portal (`🏢 Dealership Portal`):**
   - Single & bulk fleet movement creation with multi-VIN / plate tagging
   - Active orders table with live status badges, live GPS tracking, and handover PDF access
   - Consolidated monthly billing summary.
5. **Operations & Dispatch Hub (`📡 Dispatch Hub`):**
   - Live unassigned movements queue
   - Driver proximity roster with ratings and current trip status
   - One-click driver allocation and push notification dispatch.
6. **Live GPS Vehicle Tracking & Telemetry:**
   - Real-time Leaflet map along UAE highway corridors (E11 / E311)
   - Live speed indicator (`84 km/h`), waypoint checkpoint timeline, and ETA countdown.
7. **8-Point Vehicle Condition & Handover Report:**
   - Photographic evidence modal (Front, Rear, Sides, Cockpit, Dash, Wheels, Boot)
   - HTML5 canvas e-signature pad with customer & driver sign-offs
   - Downloadable/printable official handover certificate.
8. **Official UAE FTA Electronic VAT Tax Invoice:**
   - Conforming to UAE Federal Tax Authority (FTA) regulations with TRN (`100482910400003`)
   - Itemized line items, 5% VAT breakdown, and print/save to PDF.
9. **Driver Native Mobile App Simulator (`📱 Driver App`):**
   - Realistic smartphone app viewport previewing trip alert (`+AED 340`), condition inspection, e-signatures, and navigation.
