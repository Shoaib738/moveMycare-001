/**
 * MoveMyCar UAE - Dealership & Trader B2B Portal Engine
 * Bulk vehicle movements, multi-VIN batch processing, and corporate fleet reporting
 */

const DealerPortal = {
  activeFilter: 'all',
  tempVins: [],

  init() {
    this.renderStats();
    this.renderOrdersTable();
    this.bindEvents();
  },

  renderStats() {
    const totalJobs = window.INITIAL_JOBS.length;
    const inTransit = window.INITIAL_JOBS.filter(j => j.status === 'In Transit').length;
    const delivered = window.INITIAL_JOBS.filter(j => j.status === 'Delivered').length;
    const totalSpend = window.INITIAL_JOBS.reduce((acc, curr) => acc + curr.cost, 0);

    const activeEl = document.getElementById('dealerActiveMoves');
    if (activeEl) activeEl.textContent = inTransit;

    const totalEl = document.getElementById('dealerTotalFleet');
    if (totalEl) totalEl.textContent = totalJobs + 18; // plus historical

    const spendEl = document.getElementById('dealerMonthlySpend');
    if (spendEl) spendEl.textContent = 'AED ' + (totalSpend + 14200).toLocaleString();
  },

  renderOrdersTable(filter = 'all') {
    const tableBody = document.getElementById('dealerOrdersTableBody');
    if (!tableBody) return;

    let jobs = window.INITIAL_JOBS;
    if (filter !== 'all') {
      jobs = jobs.filter(j => j.status.toLowerCase().replace(' ', '-') === filter);
    }

    tableBody.innerHTML = jobs.map(job => {
      const fromLoc = window.UAE_LOCATIONS[job.from]?.name || job.from;
      const toLoc = window.UAE_LOCATIONS[job.to]?.name || job.to;

      let badgeClass = 'badge-info';
      if (job.status === 'Delivered') badgeClass = 'badge-success';
      if (job.status === 'Unassigned') badgeClass = 'badge-warning';

      return `
        <tr>
          <td>
            <strong>${job.ref}</strong><br>
            <span style="font-size:11px;color:var(--text-light-muted);font-family:monospace;">${job.vin}</span>
          </td>
          <td>
            <strong>${job.vehicle}</strong><br>
            <span style="font-size:11px;color:var(--text-light-muted);">${job.plate}</span>
          </td>
          <td>
            <div>${fromLoc} → ${toLoc}</div>
            <span style="font-size:11px;color:var(--text-light-muted);">${job.km} km</span>
          </td>
          <td>
            ${job.driver ? `
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="width:7px;height:7px;border-radius:50%;background:#10B981;"></span>
                <span>${job.driver}</span>
              </div>
            ` : '<span style="color:#F59E0B;font-size:12px;">Awaiting Dispatch</span>'}
          </td>
          <td>
            <span class="badge ${badgeClass}">${job.status}</span>
          </td>
          <td>
            <strong>AED ${job.cost.toLocaleString()}</strong>
          </td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="window.trackJobRef('${job.ref}')" title="Track Live">
                📡 Live
              </button>
              <button class="btn btn-dark btn-sm" onclick="window.HandoverReportEngine.openHandoverModal('${job.ref}')" title="Handover Report">
                📋 Report
              </button>
              <button class="btn btn-dark btn-sm" onclick="window.HandoverReportEngine.openInvoiceModal('${job.ref}')" title="Tax Invoice">
                📄 VAT
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  addVinTag(vin) {
    const cleanVin = vin.trim().toUpperCase();
    if (!cleanVin) return;
    if (!this.tempVins.includes(cleanVin)) {
      this.tempVins.push(cleanVin);
      this.renderVinTags();
    }
  },

  removeVinTag(index) {
    this.tempVins.splice(index, 1);
    this.renderVinTags();
  },

  renderVinTags() {
    const container = document.getElementById('dealerVinTagCloud');
    const countEl = document.getElementById('dealerVinCount');
    if (!container) return;

    if (countEl) countEl.textContent = `${this.tempVins.length} vehicles queued`;

    container.innerHTML = this.tempVins.map((vin, i) => `
      <div class="vin-tag">
        <span>${vin}</span>
        <span class="remove-vin" onclick="window.DealerPortal.removeVinTag(${i})">×</span>
      </div>
    `).join('');
  },

  submitBulkMove() {
    const from = document.getElementById('dealerBulkFrom')?.value || 'alquoz';
    const to = document.getElementById('dealerBulkTo')?.value || 'yas';
    const count = Math.max(1, this.tempVins.length || 1);

    const newJobRef = 'MMC-' + Math.floor(7000 + Math.random() * 2000);
    const newJob = {
      ref: newJobRef,
      dealer: 'Al Nabooda Automobiles',
      vehicle: `${count}x Fleet Batch Transfer`,
      vin: this.tempVins[0] || 'WP1ZZZ9Y8MDA8129',
      plate: 'Batch Movement',
      from: from,
      to: to,
      driver: null,
      status: 'Unassigned',
      speed: 0,
      time: 'Just now',
      eta: 'Allocating Drivers',
      cost: count * 420,
      km: window.PricingEngine.calculateDistance(from, to)
    };

    window.INITIAL_JOBS.unshift(newJob);
    this.tempVins = [];
    this.renderVinTags();
    this.renderOrdersTable();
    this.renderStats();

    if (window.showToast) {
      window.showToast(`Batch transfer ${newJobRef} booked! Dispatched to operations hub.`);
    }
  },

  bindEvents() {
    const addVinBtn = document.getElementById('dealerAddVinBtn');
    const vinInput = document.getElementById('dealerVinInput');

    if (addVinBtn && vinInput) {
      addVinBtn.addEventListener('click', () => {
        this.addVinTag(vinInput.value);
        vinInput.value = '';
        vinInput.focus();
      });

      vinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addVinTag(vinInput.value);
          vinInput.value = '';
        }
      });
    }

    const bulkSubmitBtn = document.getElementById('dealerSubmitBulkBtn');
    if (bulkSubmitBtn) {
      bulkSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitBulkMove();
      });
    }
  }
};

window.DealerPortal = DealerPortal;
