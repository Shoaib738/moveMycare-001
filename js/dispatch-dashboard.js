/**
 * MoveMyCar UAE - Operations & Dispatch Allocation Hub
 * Fleet management, driver matching, automated dispatch routing, and live driver assignment
 */

const DispatchDashboard = {
  init() {
    this.renderUnassignedQueue();
    this.renderDriverRoster();
    this.renderKPIs();
  },

  renderKPIs() {
    const unassignedCount = window.INITIAL_JOBS.filter(j => j.status === 'Unassigned').length;
    const activeTrips = window.INITIAL_JOBS.filter(j => window.Operations.active.includes(j.status)).length;
    const availableDrivers = window.DRIVER_ROSTER.filter(d => d.status === 'Available').length;

    const unassignedEl = document.getElementById('kpiUnassigned');
    if (unassignedEl) unassignedEl.textContent = unassignedCount;

    const activeEl = document.getElementById('kpiActiveTrips');
    if (activeEl) activeEl.textContent = activeTrips;

    const driversEl = document.getElementById('kpiAvailableDrivers');
    if (driversEl) driversEl.textContent = availableDrivers;
  },

  renderUnassignedQueue() {
    const container = document.getElementById('unassignedQueueList');
    if (!container) return;

    const unassigned = window.INITIAL_JOBS.filter(j => j.status === 'Unassigned');

    if (unassigned.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px 16px;color:var(--text-light-muted);background:var(--bg-dark-900);border-radius:var(--radius-lg);border:1px dashed var(--border-dark);">
          <div style="font-size:24px;margin-bottom:8px;">✅</div>
          <strong>All movements allocated</strong>
          <p style="font-size:12px;margin-top:4px;">No unassigned bookings in queue.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = unassigned.map(job => {
      const fromLoc = window.UAE_LOCATIONS[job.from]?.name || job.from;
      const toLoc = window.UAE_LOCATIONS[job.to]?.name || job.to;

      return `
        <div class="unassigned-card">
          <div class="unassigned-head">
            <span class="unassigned-ref">${window.escapeHTML(job.ref)}</span>
            <span class="badge badge-warning" style="font-size:11px;">${window.escapeHTML(job.priority || 'Standard dispatch')}</span>
          </div>
          <div class="unassigned-details">
            <strong style="color:#fff;">${window.escapeHTML(job.vehicle)}</strong> · ${window.escapeHTML(job.dealer)}<br>
            <span>${fromLoc} → ${toLoc} (${job.km} km)</span>
          </div>
          <div class="unassigned-actions">
            <select class="form-control" id="selectDriverFor_${window.escapeHTML(job.ref)}" style="height:36px;font-size:12px;width:180px;">
              ${window.DRIVER_ROSTER.map(d => `
                <option value="${d.id}" ${d.status !== 'Available' ? 'disabled' : ''}>
                  ${d.name} (${d.distKm} km away) ${d.status !== 'Available' ? '- Busy' : ''}
                </option>
              `).join('')}
            </select>
            <button class="btn btn-primary btn-sm" onclick="window.DispatchDashboard.allocateDriver('${window.escapeHTML(job.ref)}')">
              ⚡ Dispatch Driver
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderDriverRoster() {
    const container = document.getElementById('driverRosterContainer');
    if (!container) return;

    container.innerHTML = window.DRIVER_ROSTER.map(driver => {
      const isAvail = driver.status === 'Available';
      return `
        <div class="driver-roster-card">
          <div class="driver-roster-left">
            <img src="${driver.avatar}" alt="${driver.name}" class="driver-roster-avatar" style="border-color:${isAvail ? 'var(--status-success)' : 'var(--status-warning)'};">
            <div>
              <div class="driver-roster-name">${driver.name}</div>
              <div class="driver-roster-meta">
                ★ ${driver.rating} · ${driver.trips} trips · ${driver.distKm} km away
              </div>
            </div>
          </div>
          <div>
            <span class="badge ${isAvail ? 'badge-success' : 'badge-warning'}">
              ${driver.status}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  allocateDriver(jobRef) {
    const selectEl = document.getElementById(`selectDriverFor_${jobRef}`);
    const driverId = selectEl ? selectEl.value : 'DRV-101';

    const driver = window.DRIVER_ROSTER.find(d => d.id === driverId) || window.DRIVER_ROSTER[0];
    const job = window.INITIAL_JOBS.find(j => j.ref === jobRef);

    if (!driver || driver.status !== 'Available') return window.showToast('Select an available driver.');

    if (job && driver && driver.status === 'Available') {
      try {window.Operations.assign(job.ref, driver.id);} catch(error) {window.showToast(error.message);return;}

      this.renderKPIs();
      this.renderUnassignedQueue();
      this.renderDriverRoster();
      window.DealerPortal.renderOrdersTable();

      if (window.showToast) {
        window.showToast(`Allocated ${driver.name} to ${window.escapeHTML(job.ref)} (${window.escapeHTML(job.vehicle)})! Demo assignment saved.`);
      }
    }
  }
};

window.DispatchDashboard = DispatchDashboard;
