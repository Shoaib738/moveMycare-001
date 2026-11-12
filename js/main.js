/**
 * MoveMyCar UAE - Core Application Controller
 * Manages views, hero visual, luxury fleet showcase, floating booking bar, and modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Toast Function
  window.showToast = function(msg) {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // 1. Populate Dropdown Selects with UAE Locations
  function populateLocationSelects() {
    const selects = ['barFrom', 'barTo', 'modalFrom', 'modalTo', 'dealerBulkFrom', 'dealerBulkTo'];
    const groups = {};
    Object.values(window.UAE_LOCATIONS).forEach(loc => {
      const name = ({RAK:'Ras Al Khaimah',UAQ:'Umm Al Quwain'})[loc.emirate] || loc.emirate;
      (groups[name] ||= []).push(loc.id);
    });

    let optionsHtml = '';
    for (const [groupName, keys] of Object.entries(groups)) {
      optionsHtml += `<optgroup label="${groupName}">`;
      for (const key of keys) {
        const loc = window.UAE_LOCATIONS[key];
        if (loc) {
          optionsHtml += `<option value="${key}">${loc.name} (${loc.emirate})</option>`;
        }
      }
      optionsHtml += `</optgroup>`;
    }

    selects.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = optionsHtml;
    });

    // Defaults
    if (document.getElementById('barFrom')) document.getElementById('barFrom').value = 'alquoz';
    if (document.getElementById('barTo')) document.getElementById('barTo').value = 'yas';
    if (document.getElementById('dealerBulkFrom')) document.getElementById('dealerBulkFrom').value = 'alquoz';
    if (document.getElementById('dealerBulkTo')) document.getElementById('dealerBulkTo').value = 'auh';
  }

  populateLocationSelects();

  // 2. Hero 2D Visual (no 3D engine needed)

  // 3. Render High-Res Luxury Fleet (BMW, Rolls-Royce, AMG, Porsche)
  function renderLuxuryFleet(categoryFilter = 'all') {
    const grid = document.getElementById('luxuryFleetGrid');
    if (!grid || !window.LUXURY_FLEET) return;

    let cars = window.LUXURY_FLEET;
    if (categoryFilter !== 'all') {
      cars = cars.filter(c => c.category === categoryFilter);
    }

    grid.innerHTML = cars.map(car => `
      <div class="fleet-card">
        <div class="fleet-img-wrap">
          <img src="${car.photo}" alt="${car.name}" loading="lazy">
          <span class="fleet-tag-pill">${car.tag}</span>
        </div>
        <div class="fleet-body">
          <div>
            <h4 class="fleet-car-name">${car.name}</h4>
            <div class="fleet-specs-row">
              <span>Photo handover</span>
              <span>Collection &amp; delivery</span>
            </div>
          </div>
          <div class="fleet-footer">
            <div>
              <span style="font-size:11px;color:var(--text-muted);display:block;text-transform:uppercase;">Indicative starting price</span>
              <span class="fleet-price">AED ${car.basePrice}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.selectFleetCar('${car.id}')">
              Book Relocation →
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderLuxuryFleet('all');

  // Fleet Filter Buttons
  const fleetFilterBtns = document.querySelectorAll('.fleet-filter-btn');
  fleetFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fleetFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLuxuryFleet(btn.dataset.category);
    });
  });

  window.selectFleetCar = function(carId) {
    const car = window.LUXURY_FLEET.find(c => c.id === carId);
    if (!car) return;

    if (barVeh) barVeh.value = car.vehType;
    const wizCar = document.getElementById('wizCarModel');
    if (wizCar) wizCar.value = car.name;

    window.openBookingWizard();
    window.showToast(`Selected ${car.name}! Complete details to book driver.`);
  };

  // 4. Floating Booking Bar Handler
  const barFrom = document.getElementById('barFrom');
  const barTo = document.getElementById('barTo');
  const barVeh = document.getElementById('barVeh');
  const btnFloatingBook = document.getElementById('btnFloatingBook');

  if (btnFloatingBook) {
    btnFloatingBook.addEventListener('click', (e) => {
      e.preventDefault();
      const from = barFrom ? barFrom.value : 'alquoz';
      const to = barTo ? barTo.value : 'yas';
      const veh = barVeh ? barVeh.value : 'suv';

      if (from === to) return window.showToast('Choose different collection and delivery locations.');
      const date = document.getElementById('barDate');
      if (!date.reportValidity()) return;
      const quote = window.PricingEngine.computeQuote({
        from,
        to,
        vehicleType: veh,
        qty: 1
      });

      if (document.getElementById('modalFrom')) document.getElementById('modalFrom').value = from;
      if (document.getElementById('modalTo')) document.getElementById('modalTo').value = to;

      window.openBookingWizard();
      window.showToast(`Instant rate calculated: AED ${quote.total} (${quote.distanceKm} km · ${quote.duration})`);
    });
  }

  // 5. Render Popular Routes Grid
  const routesData = [
    { from: 'alquoz', to: 'yas', price: 'AED 440', km: 118, label: 'Al Nabooda ➔ Yas Showroom' },
    { from: 'downtown', to: 'auh', price: 'AED 490', km: 135, label: 'Downtown ➔ Abu Dhabi Corniche' },
    { from: 'marina', to: 'dxb', price: 'AED 195', km: 38, label: 'Marina ➔ Dubai Airport (DXB)' },
    { from: 'shj', to: 'downtown', price: 'AED 210', km: 34, label: 'Sharjah Auto Hub ➔ Dubai' },
    { from: 'dip', to: 'ain', price: 'AED 420', km: 122, label: 'DIP Logistics ➔ Al Ain' },
    { from: 'rak', to: 'dxb', price: 'AED 380', km: 104, label: 'RAK ➔ Dubai Free Zone' }
  ];

  function renderPopularRoutes() {
    const grid = document.getElementById('popularRoutesGrid');
    if (!grid) return;

    grid.innerHTML = routesData.map(r => {
      const fromLoc = window.UAE_LOCATIONS[r.from]?.name || r.from;
      const toLoc = window.UAE_LOCATIONS[r.to]?.name || r.to;
      const estimate = window.PricingEngine.computeQuote({from:r.from,to:r.to,vehicleType:'suv'});

      return `
        <div class="route-card">
          <div style="font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;margin-bottom:6px;">
            ${r.label}
          </div>
          <div class="route-endpoints">
            <span>${fromLoc}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span>${toLoc}</span>
          </div>
          <div class="route-meta">
            <span>📏 ${estimate.distanceKm} km</span>
            <span>⚡ Estimated route</span>
          </div>
          <div class="route-footer">
            <span class="route-price-tag">AED ${estimate.total.toFixed(2)}</span>
            <button class="btn btn-outline btn-sm" onclick="window.loadRouteIntoFloatingBar('${r.from}', '${r.to}')">
              Select
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPopularRoutes();

  window.loadRouteIntoFloatingBar = function(from, to) {
    if (barFrom) barFrom.value = from;
    if (barTo) barTo.value = to;
    const floatingBar = document.getElementById('floatingBookingSection');
    if (floatingBar) floatingBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.showToast('Route loaded into booking bar!');
  };

  // 6. Navigation Click Handler & View Switcher (Guarantees single active item)
  window.handleNavClick = function(navKey) {
    // 1. Remove active class from ALL links (never allow multiple links to be active)
    document.querySelectorAll('.nav-links a, .mobile-nav-drawer a').forEach(el => {
      el.classList.remove('active');
    });

    // 2. Set active ONLY on the clicked link
    document.querySelectorAll(`[data-nav="${navKey}"]`).forEach(el => {
      el.classList.add('active');
    });

    // 3. Switch view or scroll to section
    if (navKey === 'dealer') {
      window.switchView('dealer');
    } else if (navKey === 'driver') {
      window.switchView('driver');
    } else if (navKey === 'dispatch') {
      window.switchView('dispatch');
    } else {
      // First ensure the public view is visible
      window.switchView('public');
      const targetSec = document.getElementById(navKey);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    window.closeMobileDrawer();
  };

  window.switchView = function(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewId === 'dealer') window.DealerPortal.init();
    if (viewId === 'dispatch') window.DispatchDashboard.init();

    if (viewId === 'public') {
      setTimeout(() => {
        if (window.mapTrackerInstance?.map) window.mapTrackerInstance.map.invalidateSize();
      }, 250);
    }
  };

  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      const view = el.dataset.view;
      if (view) {
        e.preventDefault();
        window.handleNavClick(view);
      }
    });
  });

  // ScrollSpy: Automatically highlights ONLY the section currently on screen
  const sectionIds = ['booking', 'fleet', 'routes', 'tracking'];
  const scrollObserver = new IntersectionObserver((entries) => {
    const isPublicActive = document.getElementById('view-public')?.classList.contains('active');
    if (!isPublicActive) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.nav-links a, .mobile-nav-drawer a').forEach(a => {
          a.classList.toggle('active', a.dataset.nav === id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sectionIds.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) scrollObserver.observe(sec);
  });

  // 7. Initialize Live GPS Map Tracker
  const mapTracker = new window.MapTracker('leafletLiveMap');
  window.mapTrackerInstance = mapTracker;
  mapTracker.init();

  window.trackJobRef = function(ref) {
    window.switchView('public');
    const trackSec = document.getElementById('liveTrackingSection');
    if (trackSec) trackSec.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      mapTracker.trackBooking(ref);
    }, 350);
  };

  const trackBtn = document.getElementById('btnSearchTrack');
  const trackInput = document.getElementById('inputTrackRef');
  if (trackBtn && trackInput) {
    trackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ref = trackInput.value.trim().toUpperCase() || 'MMC-7821';
      window.trackJobRef(ref);
    });
  }

  // 8. Multi-Step Booking Wizard Modal
  const bookingModal = document.getElementById('bookingWizardModal');
  let currentStep = 1;

  window.openBookingWizard = function() {
    currentStep = 1;
    document.getElementById('modalFrom').value = barFrom.value;
    document.getElementById('modalTo').value = barTo.value;
    showStep(1);
    if (bookingModal) bookingModal.classList.add('active');
  };

  window.closeAllModals = function() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  };

  document.querySelectorAll('.modal-close-btn, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', window.closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeAllModals();
    });
  });

  function showStep(stepNum) {
    document.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
    const stepEl = document.getElementById(`wizardStep${stepNum}`);
    if (stepEl) stepEl.style.display = 'block';

    const titleEl = document.getElementById('wizardStepTitle');
    const titles = {
      1: 'Step 1 of 3: Movement Details',
      2: 'Step 2 of 3: Vehicle & Contact',
      3: 'Step 3 of 3: Instant Confirmation'
    };
    if (titleEl) titleEl.textContent = titles[stepNum] || 'Book a Driver';

    const nextBtn = document.getElementById('wizardNextBtn');
    const backBtn = document.getElementById('wizardBackBtn');

    if (backBtn) backBtn.style.visibility = stepNum !== 2 ? 'hidden' : 'visible';
    if (nextBtn) {
      if (stepNum === 2) nextBtn.textContent = 'Confirm & Generate Job Ref';
      else if (stepNum === 3) nextBtn.textContent = 'Track Live GPS →';
      else nextBtn.textContent = 'Continue →';
    }
  }

  const nextBtn = document.getElementById('wizardNextBtn');
  const backBtn = document.getElementById('wizardBackBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep === 1) {
        if (document.getElementById('modalFrom').value === document.getElementById('modalTo').value) return window.showToast('Choose different collection and delivery locations.');
        const fields = document.querySelectorAll('#wizardStep1 input');
        for (const input of fields) { input.required = true; if (!input.reportValidity()) return; }
        currentStep = 2;
        showStep(2);
      } else if (currentStep === 2) {
        if (!document.getElementById('modalDate').reportValidity()) return;
        for (const input of document.querySelectorAll('#wizardStep2 input')) { input.required = true; if (!input.reportValidity()) return; }
        const ref = window.DemoStore.ref();
        const car = document.getElementById('wizCarModel')?.value || 'Rolls-Royce Ghost Extended';
        const from = document.getElementById('modalFrom')?.value || 'alquoz';
        const to = document.getElementById('modalTo')?.value || 'yas';

        const newJob = {
          ref: ref,
          dealer: window.PanelApp?.isDealer() ? 'Al Nabooda Automobiles' : window.CUSTOMERS[0].name,
          dealerId: window.PanelApp?.isDealer() ? 'DLR-101' : null,
          customerId: window.PanelApp?.isDealer() ? null : 'CUS-101',
          paymentStatus: 'Unpaid',
          vehicleType: document.getElementById('modalVehicle').value,
          createdAt: new Date().toISOString(),
          vehicle: car.trim(),
          vin: document.querySelector('#wizardStep2 input[placeholder*="Dubai"]').value.trim(),
          plate: document.querySelector('#wizardStep2 input[placeholder*="Dubai"]').value.trim(),
          from: from,
          to: to,
          driver: null,
          status: 'Unassigned',
          speed: 0,
          time: 'Just now',
          eta: 'Awaiting dispatch',
          date: document.getElementById('modalDate').value,
          collectionAddress: document.querySelectorAll('#wizardStep1 input')[0].value.trim(),
          deliveryAddress: document.querySelectorAll('#wizardStep1 input')[1].value.trim(),
          contact: document.querySelector('#wizardStep2 input[type=tel]').value.trim(),
          cost: window.PricingEngine.computeQuote({ from, to, vehicleType: document.getElementById('modalVehicle').value, isDealer: !!window.PanelApp?.isDealer() }).total,
          quote: window.PricingEngine.computeQuote({ from, to, vehicleType: document.getElementById('modalVehicle').value, isDealer: !!window.PanelApp?.isDealer() }),
          km: window.PricingEngine.calculateDistance(from, to)
        };

        window.Operations.add(newJob);

        const refDisplay = document.getElementById('wizGeneratedRef');
        if (refDisplay) refDisplay.textContent = ref;

        currentStep = 3;
        showStep(3);
      } else if (currentStep === 3) {
        const refDisplay = document.getElementById('wizGeneratedRef');
        const ref = refDisplay ? refDisplay.textContent : 'MMC-7821';
        window.closeAllModals();
        window.trackJobRef(ref);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep === 2) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }

  // 9. Driver Registration Modal
  window.openDriverRegisterModal = function() {
    const modal = document.getElementById('driverRegisterModal');
    if (modal) modal.classList.add('active');
  };

  const driverForm = document.getElementById('driverRegisterForm');
  if (driverForm) {
    driverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.closeAllModals();
      window.DemoStore.write('mmc-driver-applications', [...window.DemoStore.read('mmc-driver-applications', []), {name:driverForm.querySelector('input[type=text]').value.trim(), mobile:driverForm.querySelector('input[type=tel]').value.trim(), area:driverForm.querySelector('select').value, submittedAt:new Date().toISOString()}]);
      window.showToast('Application details saved on this device. Online submission is not connected.');
    });
  }

  // 10. Driver Earnings Slider
  const jobsSlider = document.getElementById('driverWeeklyJobsRange');
  if (jobsSlider) {
    jobsSlider.addEventListener('input', () => {
      const val = parseInt(jobsSlider.value, 10);
      const jobsCountEl = document.getElementById('driverJobsCountDisplay');
      const earnDisplay = document.getElementById('driverEarningsDisplay');
      if (jobsCountEl) jobsCountEl.textContent = `${val} trips / week`;
      if (earnDisplay) earnDisplay.textContent = window.PricingEngine.formatAED(val * 280);
    });
  }

  // 12. Mobile & Tablet Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(mobileNavDrawer.classList.contains('open')));
    });
  }

  window.closeMobileDrawer = function() {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
  };

  document.addEventListener('click', (e) => {
    if (mobileNavDrawer && mobileNavDrawer.classList.contains('open')) {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
        window.closeMobileDrawer();
      }
    }
  });

  // Initialize Sub-Engines
  window.DealerPortal.init();
  window.DispatchDashboard.init();

});
