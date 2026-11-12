/**
 * MoveMyCar UAE - Booking & Distance Engine
 * Estimates distance, duration, and illustrative demo pricing.
 */

const PricingEngine = {
  // Great-circle distance in km adjusted for UAE road network
  calculateDistance(fromKey, toKey) {
    const fromLoc = window.UAE_LOCATIONS[fromKey];
    const toLoc = window.UAE_LOCATIONS[toKey];
    if (!fromLoc || !toLoc) return 35;
    if (fromKey === toKey) return 8;

    const lat1 = fromLoc.coords[0];
    const lon1 = fromLoc.coords[1];
    const lat2 = toLoc.coords[0];
    const lon2 = toLoc.coords[1];

    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;

    // Multiply by UAE road routing index (1.30)
    return Math.max(10, Math.round(straightKm * 1.30));
  },

  // Estimates drive duration accounting for UAE traffic
  estimateDuration(distanceKm) {
    const avgHighwaySpeed = 82; // km/h
    const minutes = Math.round((distanceKm / avgHighwaySpeed) * 60) + 12; // 12 min handover buffer
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainMins = minutes % 60;
    return `${hours}h ${remainMins}m`;
  },

  // Calculates total trip cost
  computeQuote({ from, to, vehicleType = 'suv', qty = 1, isDealer = false }) {
    const distanceKm = this.calculateDistance(from, to);
    const veh = window.VEHICLE_TYPES[vehicleType] || window.VEHICLE_TYPES.suv;

    // Flagfall AED 120 + AED 2.10 per km
    let baseRate = (120 + distanceKm * 2.10) * veh.mult;

    // Multi-vehicle bulk discount
    let discountPct = 0;
    if (isDealer) {
      discountPct += 0.10; // 10% B2B corporate trade discount
    }
    if (qty >= 3) {
      discountPct += 0.08; // Bulk volume discount
    }

    const subtotal = Number((baseRate * qty * (1 - discountPct)).toFixed(2));
    const vat = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + vat).toFixed(2));

    return {
      baseCharge: 120 * qty,
      distanceCharge: Number((distanceKm * 2.10 * qty).toFixed(2)),
      vehicleAdjustment: Number(((120 + distanceKm * 2.10) * (veh.mult - 1) * qty).toFixed(2)),
      discountAmount: Number((baseRate * qty * discountPct).toFixed(2)),
      distanceKm,
      duration: this.estimateDuration(distanceKm),
      subtotal,
      vat,
      total,
      discountPct: Math.round(discountPct * 100),
      perVehicle: Number((total / qty).toFixed(2))
    };
  },

  formatAED(amount) {
    return 'AED ' + Number(amount).toLocaleString('en-US');
  }
};

window.PricingEngine = PricingEngine;
