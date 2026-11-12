/**
 * MoveMyCar UAE - Dealership & Trader B2B Portal Engine
 * Bulk vehicle movements, multi-VIN batch processing, and corporate fleet reporting
 */

const DealerPortal = {
  activeFilter: 'all',
  tempVins: [],

  init() {
    this.renderStats();
    this.renderOrdersTable(this.activeFilter);
    this.bindEvents();
  },

  renderStats() {
    const ownJobs = window.INITIAL_JOBS.filter(j => j.dealer === 'Al Nabooda Automobiles');
    const totalJobs = ownJobs.length;
    const inTransit = ownJobs.filter(j => j.status === 'In Transit').length;
    const delivered = ownJobs.filter(j => j.status === 'Delivered').length;
    const totalSpend = ownJobs.reduce((acc, curr) => acc + curr.cost, 0);

    const activeEl = document.getElementById('dealerActiveMoves');
    if (activeEl) activeEl.textContent = inTransit;

    const totalEl = document.getElementById('dealerTotalFleet');
    if (totalEl) totalEl.textContent = totalJobs;

    const spendEl = document.getElementById('dealerMonthlySpend');
    if (spendEl) spendEl.textContent = 'AED ' + totalSpend.toLocaleString();
    const stats = document.querySelector('#view-dealer .portal-stats-row');
    if (stats) stats.querySelectorAll('.stat-val')[3].textContent = delivered;
  },

  renderOrdersTable(filter = 'all') {
    this.activeFilter = filter;
    const tableBody = document.getElementById('dealerOrdersTableBody');
    if (!tableBody) return;

    let jobs = window.INITIAL_JOBS.filter(j => j.dealer === 'Al Nabooda Automobiles');
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
            <strong>${window.escapeHTML(job.ref)}</strong><br>
            <span style="font-size:11px;color:var(--text-light-muted);font-family:monospace;">${window.escapeHTML(job.vin)}</span>
          </td>
          <td>
            <strong>${window.escapeHTML(job.vehicle)}</strong><br>
            <span style="font-size:11px;color:var(--text-light-muted);">${window.escapeHTML(job.plate)}</span>
          </td>
          <td>
            <div>${fromLoc} → ${toLoc}</div>
            <span style="font-size:11px;color:var(--text-light-muted);">${job.km} km</span>
          </td>
          <td>
            ${job.driver ? `
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="width:7px;height:7px;border-radius:50%;background:#10B981;"></span>
                <span>${window.escapeHTML(job.driver)}</span>
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
              <button class="btn btn-outline btn-sm" onclick="window.trackJobRef('${window.escapeHTML(job.ref)}')" title="Track Live">
                📡 Live
              </button>
              <button class="btn btn-dark btn-sm" onclick="window.HandoverReportEngine.openHandoverModal('${window.escapeHTML(job.ref)}')" title="Handover Report">
                📋 Report
              </button>
              <button class="btn btn-dark btn-sm" onclick="window.HandoverReportEngine.openInvoiceModal('${window.escapeHTML(job.ref)}')" title="Tax Invoice">
                📄 VAT
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="7">No movements match this filter.</td></tr>';
  },

  addVinTag(vin) {
    const cleanVin = vin.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{8,17}$/.test(cleanVin)) return window.showToast('Use 8–17 chassis characters (letters and digits, excluding I, O, Q).');
    if(this.tempVins.length>=50)return window.showToast('A fleet booking supports up to 50 vehicles.');
    if(this.tempVins.includes(cleanVin))return window.showToast('This chassis is already queued.');
    if(window.INITIAL_JOBS.some(j=>j.vin===cleanVin&&!['Delivered','Cancelled'].includes(j.status)))return window.showToast('This chassis already has an active movement.');
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
        <button type="button" class="remove-vin" aria-label="Remove ${vin}" onclick="window.DealerPortal.removeVinTag(${i})">×</button>
      </div>
    `).join('');
  },

  submitBulkMove() {
    const from = document.getElementById('dealerBulkFrom')?.value || 'alquoz';
    const to = document.getElementById('dealerBulkTo')?.value || 'yas';
    if (from === to) return window.showToast('Choose different collection and delivery locations.');
    if (!this.tempVins.length) return window.showToast('Add at least one chassis number first.');
    const count = this.tempVins.length;

    const quote = window.PricingEngine.computeQuote({from, to, qty: count, isDealer: true});
    const newJobRef = window.DemoStore.ref();
    this.tempVins.forEach((vin, i) => window.INITIAL_JOBS.unshift({
      ref: newJobRef + '-' + (i + 1), dealer: 'Al Nabooda Automobiles',
      vehicle: 'Dealer vehicle', vin, plate: 'Awaiting registration', from, to,
      driver: null, status: 'Unassigned', speed: 0, time: 'Just now', eta: 'Awaiting dispatch',
      priority: document.getElementById('dealerPriority').value,
      createdAt: new Date().toISOString(), date: window.BookingUI?.today(),
      cost: i === count-1 ? Number((quote.total - Number((quote.total/count).toFixed(2))*(count-1)).toFixed(2)) : Number((quote.total / count).toFixed(2)), km: quote.distanceKm
    }));
    window.DemoStore.save();
    this.tempVins = [];
    this.renderVinTags();
    this.renderOrdersTable();
    this.renderStats();

    if (window.showToast) {
      window.showToast(`Batch transfer ${newJobRef} booked! Dispatched to operations hub.`);
    }
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
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
