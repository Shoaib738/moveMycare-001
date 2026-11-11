/**
 * MoveMyCar UAE - Live GPS Map & Telemetry Engine
 * Smooth real-time telemetry animation, live road tracking, and ETA calculation
 */

class MapTracker {
  constructor(containerId = 'leafletLiveMap') {
    this.containerId = containerId;
    this.map = null;
    this.routeLine = null;
    this.completedLine = null;
    this.vehicleMarker = null;
    this.startMarker = null;
    this.endMarker = null;
    this.animationTimer = null;
    this.currentIndex = 0;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || !window.L) return;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Center on Dubai / Abu Dhabi highway corridor
    this.map = L.map(this.containerId, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView([25.0805, 55.1403], 11);

    // Modern Dark Luxury Carto Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.isInitialized = true;

    // Load default demo booking
    this.trackBooking('MMC-7821');
  }

  // Generates curved highway route points between two coords
  generateHighwayPath(startCoords, endCoords, segments = 30) {
    const pts = [];
    const midPoint = [
      (startCoords[0] + endCoords[0]) / 2 + (endCoords[1] - startCoords[1]) * 0.05,
      (startCoords[1] + endCoords[1]) / 2 - (endCoords[0] - startCoords[0]) * 0.05
    ];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = (1 - t) * (1 - t) * startCoords[0] + 2 * (1 - t) * t * midPoint[0] + t * t * endCoords[0];
      const lng = (1 - t) * (1 - t) * startCoords[1] + 2 * (1 - t) * t * midPoint[1] + t * t * endCoords[1];
      pts.push([lat, lng]);
    }
    return pts;
  }

  trackBooking(bookingRef) {
    if (!this.map) this.init();
    if (!this.map) return;

    clearInterval(this.animationTimer);

    // Find job from mock data or default
    const job = window.INITIAL_JOBS.find(j => j.ref === bookingRef) || window.INITIAL_JOBS[0];
    const fromLoc = window.UAE_LOCATIONS[job.from] || window.UAE_LOCATIONS.alquoz;
    const toLoc = window.UAE_LOCATIONS[job.to] || window.UAE_LOCATIONS.yas;

    const pathPoints = this.generateHighwayPath(fromLoc.coords, toLoc.coords, 40);

    // Cleanup previous layers
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (this.completedLine) this.map.removeLayer(this.completedLine);
    if (this.vehicleMarker) this.map.removeLayer(this.vehicleMarker);
    if (this.startMarker) this.map.removeLayer(this.startMarker);
    if (this.endMarker) this.map.removeLayer(this.endMarker);

    // Planned Route Background Line
    this.routeLine = L.polyline(pathPoints, {
      color: '#1E293B',
      weight: 6,
      opacity: 0.9,
      dashArray: '4, 8'
    }).addTo(this.map);

    // Real-time Completed Trajectory Line
    this.completedLine = L.polyline([pathPoints[0]], {
      color: '#FF5C00',
      weight: 5,
      opacity: 0.95
    }).addTo(this.map);

    // Origin Marker
    const startIcon = L.divIcon({
      className: 'custom-map-pin start',
      html: `<div style="width:16px;height:16px;background:#10B981;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(16,185,129,0.8);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    this.startMarker = L.marker(pathPoints[0], { icon: startIcon }).addTo(this.map).bindTooltip(fromLoc.name);

    // Destination Marker
    const endIcon = L.divIcon({
      className: 'custom-map-pin end',
      html: `<div style="width:18px;height:18px;background:#FF5C00;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(255,92,0,0.8);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    this.endMarker = L.marker(pathPoints[pathPoints.length - 1], { icon: endIcon })
      .addTo(this.map)
      .bindTooltip(toLoc.name, { permanent: true, direction: 'top', offset: [0, -10] });

    // Vehicle Marker (Pulsing orange GPS beacon)
    const carIcon = L.divIcon({
      className: 'vehicle-beacon',
      html: `
        <div style="position:relative;width:32px;height:32px;background:#FF5C00;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(255,92,0,0.8);">
          <div style="width:10px;height:10px;background:#fff;border-radius:50%;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    this.vehicleMarker = L.marker(pathPoints[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(this.map);

    this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });

    // Update Telemetry Panel UI
    this.updateTelemetryCard(job, fromLoc, toLoc);

    // Start Live Driver Progress Simulation
    this.currentIndex = 0;
    this.animationTimer = setInterval(() => {
      this.currentIndex++;
      if (this.currentIndex < pathPoints.length) {
        const currentCoord = pathPoints[this.currentIndex];
        this.vehicleMarker.setLatLng(currentCoord);
        this.completedLine.addLatLng(currentCoord);

        // Fluctuate speed naturally between 78 and 92 km/h
        const currentSpeed = Math.floor(78 + Math.random() * 14);
        const speedEl = document.getElementById('liveSpeedDisplay');
        if (speedEl) speedEl.textContent = `${currentSpeed} km/h`;

        const progressPct = this.currentIndex / pathPoints.length;
        const remainKm = Math.max(1, Math.round(job.km * (1 - progressPct)));
        const remainMins = Math.max(1, Math.round(remainKm / 1.2));

        const etaEl = document.getElementById('liveEtaDisplay');
        if (etaEl) etaEl.textContent = `${remainMins} min (${remainKm} km)`;
      } else {
        clearInterval(this.animationTimer);
        const speedEl = document.getElementById('liveSpeedDisplay');
        if (speedEl) speedEl.textContent = '0 km/h (Arrived)';
        const etaEl = document.getElementById('liveEtaDisplay');
        if (etaEl) etaEl.textContent = 'Delivered';
        if (window.showToast) {
          window.showToast(`Vehicle ${job.ref} arrived at ${toLoc.name}. Handover report ready.`);
        }
      }
    }, 450);
  }

  updateTelemetryCard(job, fromLoc, toLoc) {
    const refEl = document.getElementById('liveJobRef');
    if (refEl) refEl.textContent = job.ref;

    const carEl = document.getElementById('liveCarName');
    if (carEl) carEl.textContent = job.vehicle;

    const routeEl = document.getElementById('liveRouteDisplay');
    if (routeEl) routeEl.textContent = `${fromLoc.name} → ${toLoc.name}`;

    const driverEl = document.getElementById('liveDriverName');
    if (driverEl) driverEl.textContent = job.driver || 'Omar Saeed (Vetted)';

    const etaEl = document.getElementById('liveEtaDisplay');
    if (etaEl) etaEl.textContent = job.eta || '35 min';
  }
}

window.MapTracker = MapTracker;
