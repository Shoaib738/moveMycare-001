/**
 * MoveMyCar UAE - Digital Handover & Tax Invoice Engine
 * Canvas electronic signature, 8-point condition inspection, and UAE VAT Tax Invoicing
 */

const HandoverReportEngine = {
  activeJob: null,
  canvas: null,
  ctx: null,
  isDrawing: false,

  initSignaturePad(canvasId = 'driverSigPad') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.strokeStyle = '#0F172A';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Resize canvas internal buffer to match display width
    this.resizeCanvas();

    // Mouse drawing events
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDraw());

    // Touch drawing events for mobile screens
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 340;
    this.canvas.height = 120;
    this.clearSignature();
  },

  startDraw(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  },

  draw(e) {
    if (!this.isDrawing) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.stroke();
  },

  stopDraw() {
    this.isDrawing = false;
  },

  clearSignature() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  generateDefaultSignature() {
    if (!this.ctx || !this.canvas) return;
    this.clearSignature();
    this.ctx.beginPath();
    this.ctx.moveTo(30, 70);
    this.ctx.bezierCurveTo(80, 20, 110, 90, 160, 45);
    this.ctx.bezierCurveTo(190, 70, 220, 30, 270, 60);
    this.ctx.stroke();
  },

  // Renders Digital Handover Certificate Modal
  openHandoverModal(jobRef = 'MMC-7821') {
    const job = window.INITIAL_JOBS.find(j => j.ref === jobRef) || window.INITIAL_JOBS[0];
    const fromLoc = window.UAE_LOCATIONS[job.from] || window.UAE_LOCATIONS.alquoz;
    const toLoc = window.UAE_LOCATIONS[job.to] || window.UAE_LOCATIONS.yas;

    const modalBody = document.getElementById('handoverModalContent');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="background:var(--bg-dark-900);border:1px solid var(--border-dark);border-radius:var(--radius-lg);padding:24px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--border-dark);padding-bottom:16px;margin-bottom:16px;">
          <div>
            <span style="font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.08em;">Official Handover Certificate</span>
            <h3 style="font-size:22px;margin-top:4px;">${job.ref} · Digital Inspection</h3>
            <p style="font-size:13px;color:var(--text-light-muted);">${job.vehicle} (VIN: ${job.vin})</p>
          </div>
          <div style="text-align:right;">
            <span class="badge badge-success" style="font-size:12px;">Dual Verified ✓</span>
            <div style="font-size:11px;color:var(--text-light-muted);margin-top:6px;">GPS: 25.1400° N, 55.2300° E</div>
          </div>
        </div>

        <!-- 8-Point Photos Grid -->
        <h5 style="font-size:13px;color:var(--text-light-muted);text-transform:uppercase;margin-bottom:10px;">8-Point Photographic Evidence</h5>
        <div class="inspection-photo-grid">
          ${window.HANDOVER_PHOTOS.map(p => `
            <div class="inspection-photo-item">
              <img src="${p.url}" alt="${p.label}">
              <span class="inspection-photo-label">${p.label}</span>
              <span class="inspection-status-pill">${p.status}</span>
            </div>
          `).join('')}
        </div>

        <!-- Inspection Telemetry Stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0;background:var(--bg-dark-800);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-dark);">
          <div>
            <span style="font-size:10px;color:var(--text-light-muted);text-transform:uppercase;">Odometer</span>
            <div style="font-weight:700;font-size:14px;color:#fff;">28,491 km</div>
          </div>
          <div>
            <span style="font-size:10px;color:var(--text-light-muted);text-transform:uppercase;">Fuel Level</span>
            <div style="font-weight:700;font-size:14px;color:#fff;">7/8 Tank</div>
          </div>
          <div>
            <span style="font-size:10px;color:var(--text-light-muted);text-transform:uppercase;">Keys Handed</span>
            <div style="font-weight:700;font-size:14px;color:#fff;">2 Sets</div>
          </div>
          <div>
            <span style="font-size:10px;color:var(--text-light-muted);text-transform:uppercase;">Transit Ins.</span>
            <div style="font-weight:700;font-size:14px;color:var(--status-success);">Active (AED 1.5M)</div>
          </div>
        </div>

        <!-- Signatures Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;border-top:1px solid var(--border-dark);padding-top:16px;">
          <div style="background:var(--bg-dark-800);padding:14px;border-radius:var(--radius-md);">
            <span style="font-size:11px;color:var(--text-light-muted);">Driver E-Signature:</span>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-style:italic;color:var(--color-primary);margin:6px 0;">Omar Saeed (Verified)</div>
            <span style="font-size:10px;color:var(--text-light-muted);">ID: 784-1988-******-1 • 14:18 GST</span>
          </div>
          <div style="background:var(--bg-dark-800);padding:14px;border-radius:var(--radius-md);">
            <span style="font-size:11px;color:var(--text-light-muted);">Customer / Dealer Signature:</span>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-style:italic;color:#38BDF8;margin:6px 0;">Al Nabooda Dispatch Rep</div>
            <span style="font-size:10px;color:var(--text-light-muted);">Verified via One-Time PIN • 14:20 GST</span>
          </div>
        </div>
      </div>
    `;

    const modal = document.getElementById('handoverReportModal');
    if (modal) modal.classList.add('active');
  },

  // Renders UAE FTA Compliant VAT Tax Invoice Modal
  openInvoiceModal(jobRef = 'MMC-7821') {
    const job = window.INITIAL_JOBS.find(j => j.ref === jobRef) || window.INITIAL_JOBS[0];
    const fromLoc = window.UAE_LOCATIONS[job.from] || window.UAE_LOCATIONS.alquoz;
    const toLoc = window.UAE_LOCATIONS[job.to] || window.UAE_LOCATIONS.yas;

    const subtotal = Math.round(job.cost / 1.05);
    const vatAmount = job.cost - subtotal;

    const modalBody = document.getElementById('invoiceModalContent');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="tax-invoice-sheet">
        <div class="invoice-header-grid">
          <div>
            <div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:20px;color:#0F172A;">
              <span style="color:#4F46E5;">MoveMyCar</span> UAE Logistics LLC
            </div>
            <div style="font-size:12px;color:#64748B;margin-top:6px;line-height:1.4;">
              Unit 402, Boulevard Plaza Tower 1<br>
              Downtown Dubai, United Arab Emirates<br>
              <strong>TRN: 100482910400003</strong>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="tax-badge-official">TAX INVOICE / فاتورة ضريبية</span>
            <div style="font-size:13px;font-weight:700;margin-top:8px;">INV-2026-${job.ref.replace('MMC-', '')}</div>
            <div style="font-size:12px;color:#64748B;">Date: 11 November 2026</div>
            <div style="font-size:12px;color:#64748B;">Job Ref: <strong>${job.ref}</strong></div>
          </div>
        </div>

        <!-- Billed To -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;font-size:13px;">
          <div>
            <strong style="color:#64748B;text-transform:uppercase;font-size:11px;">Billed To (Dealership):</strong>
            <div style="font-weight:700;margin-top:2px;font-size:14px;">${job.dealer}</div>
            <div style="color:#64748B;">Al Quoz Industrial Area 1, Dubai, UAE</div>
            <div style="color:#64748B;">TRN: 100294819000003</div>
          </div>
          <div>
            <strong style="color:#64748B;text-transform:uppercase;font-size:11px;">Movement Details:</strong>
            <div>Route: <strong>${fromLoc.name} → ${toLoc.name}</strong></div>
            <div>Vehicle: <strong>${job.vehicle}</strong> (Plate: ${job.plate})</div>
            <div>Driver: <strong>${job.driver}</strong></div>
          </div>
        </div>

        <!-- Line Items -->
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Rate (AED)</th>
              <th style="text-align:center;">VAT (5%)</th>
              <th style="text-align:right;">Total (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Professional Vehicle Relocation</strong><br>
                <span style="font-size:11px;color:#64748B;">Point-to-point vetted driver delivery (${job.km} km)</span>
              </td>
              <td style="text-align:center;">1</td>
              <td style="text-align:right;">AED ${subtotal.toLocaleString()}</td>
              <td style="text-align:center;">5%</td>
              <td style="text-align:right;">AED ${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td>
                <strong>Full Transit Insurance & Digital Handover</strong><br>
                <span style="font-size:11px;color:#64748B;">8-Point Photographic Inspection Report Included</span>
              </td>
              <td style="text-align:center;">1</td>
              <td style="text-align:right;">AED 0.00</td>
              <td style="text-align:center;">0%</td>
              <td style="text-align:right;">AED 0.00</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="invoice-totals-box">
          <div class="inv-total-row">
            <span>Subtotal (Excl. VAT):</span>
            <span>AED ${subtotal.toLocaleString()}</span>
          </div>
          <div class="inv-total-row">
            <span>VAT (5%):</span>
            <span>AED ${vatAmount.toLocaleString()}</span>
          </div>
          <div class="inv-total-row grand">
            <span>Total Payable:</span>
            <span>AED ${job.cost.toLocaleString()}</span>
          </div>
        </div>

        <div style="margin-top:24px;border-top:1px solid #E2E8F0;padding-top:14px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#64748B;">
          <span>Official electronic tax invoice generated in compliance with UAE FTA standards.</span>
          <span style="font-weight:700;color:#10B981;">PAID VIA CORPORATE ACCOUNT</span>
        </div>
      </div>
    `;

    const modal = document.getElementById('taxInvoiceModal');
    if (modal) modal.classList.add('active');
  }
};

window.HandoverReportEngine = HandoverReportEngine;
