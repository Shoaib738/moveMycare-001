/**
 * MoveMyCar UAE - Driver Native Mobile App Simulator
 * Native mobile interface simulation for vetted UAE drivers
 */

const DriverAppSimulator = {
  currentStage: 'alert', // 'alert', 'inspection', 'navigation', 'completed'
  driverEarnings: 2450,

  init() {
    this.renderScreen();
  },

  renderScreen() {
    const screen = document.getElementById('driverAppScreen');
    if (!screen) return;

    if (this.currentStage === 'alert') {
      screen.innerHTML = `
        <div class="phone-top-status">
          <span>09:41</span>
          <span>●●● 5G UAE</span>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <h4 style="font-size:16px;color:#fff;">Omar Saeed</h4>
            <span style="font-size:11px;color:#10B981;">● Online · Ready for trips</span>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:var(--text-light-muted);">Week Earnings</div>
            <div style="font-size:16px;font-weight:800;color:var(--color-primary);">AED ${this.driverEarnings.toLocaleString()}</div>
          </div>
        </div>

        <!-- Job Alert Card -->
        <div class="driver-job-alert-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;">New Job Offer</span>
            <span style="font-size:13px;font-weight:800;color:#10B981;">+ AED 340</span>
          </div>
          <h4 style="font-size:17px;color:#fff;margin-bottom:4px;">Porsche Cayenne Turbo</h4>
          <p style="font-size:12px;color:var(--text-light-muted);margin-bottom:12px;">Al Nabooda (Al Quoz) → Yas Marina, Abu Dhabi</p>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;color:#fff;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:8px;margin-bottom:14px;">
            <div>Distance: <strong>118 km</strong></div>
            <div>Handover: <strong>Photo Required</strong></div>
          </div>

          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.DriverAppSimulator.declineJob()">Decline</button>
            <button class="btn btn-primary btn-sm" style="flex:2;" onclick="window.DriverAppSimulator.acceptJob()">Accept Trip</button>
          </div>
        </div>

        <div style="font-size:12px;color:var(--text-light-muted);margin-top:10px;">
          <h5 style="color:#fff;margin-bottom:8px;">Recent Completed Moves</h5>
          <div style="background:#141E28;padding:10px;border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;">
            <div>Mercedes-AMG G63<br><span style="font-size:10px;color:var(--text-light-muted);">Downtown → Abu Dhabi</span></div>
            <span style="color:#10B981;font-weight:700;">+AED 380</span>
          </div>
          <div style="background:#141E28;padding:10px;border-radius:8px;display:flex;justify-content:space-between;">
            <div>Range Rover Sport<br><span style="font-size:10px;color:var(--text-light-muted);">DXB Airport → Palm Jumeirah</span></div>
            <span style="color:#10B981;font-weight:700;">+AED 220</span>
          </div>
        </div>
      `;
    } else if (this.currentStage === 'inspection') {
      screen.innerHTML = `
        <div class="phone-top-status">
          <span>09:44</span>
          <span>Inspection Mode</span>
        </div>

        <div style="margin-bottom:12px;">
          <h4 style="font-size:15px;color:#fff;">Step 1: 8-Point Vehicle Check</h4>
          <p style="font-size:11px;color:var(--text-light-muted);">Tap each checklist item to certify condition:</p>
        </div>

        <div class="checklist-step-item checked" onclick="this.classList.toggle('checked')">
          <span class="step-text">📸 Front Bumper & Headlights</span>
          <span style="color:#10B981;">✓</span>
        </div>
        <div class="checklist-step-item checked" onclick="this.classList.toggle('checked')">
          <span class="step-text">📸 Rear Bumper & Boot</span>
          <span style="color:#10B981;">✓</span>
        </div>
        <div class="checklist-step-item checked" onclick="this.classList.toggle('checked')">
          <span class="step-text">📸 Left & Right Panels</span>
          <span style="color:#10B981;">✓</span>
        </div>
        <div class="checklist-step-item checked" onclick="this.classList.toggle('checked')">
          <span class="step-text">📸 Cockpit Dash & Odometer (28,491 km)</span>
          <span style="color:#10B981;">✓</span>
        </div>

        <div style="margin-top:14px;">
          <span style="font-size:11px;color:var(--text-light-muted);text-transform:uppercase;">Customer E-Signature</span>
          <div class="signature-canvas-box">
            <canvas id="driverSigPad"></canvas>
          </div>
          <div class="sig-actions">
            <button onclick="window.HandoverReportEngine.clearSignature()" style="color:#94A3B8;">Clear</button>
            <button onclick="window.HandoverReportEngine.generateDefaultSignature()" style="color:var(--color-primary);">Auto-Sign Demo</button>
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%;margin-top:16px;height:44px;" onclick="window.DriverAppSimulator.completeHandover()">
          Sign & Begin Transit →
        </button>
      `;

      setTimeout(() => {
        window.HandoverReportEngine.initSignaturePad('driverSigPad');
        window.HandoverReportEngine.generateDefaultSignature();
      }, 50);
    } else if (this.currentStage === 'navigation') {
      screen.innerHTML = `
        <div class="phone-top-status">
          <span>09:50</span>
          <span>GPS Active</span>
        </div>

        <div style="background:#141E28;border-radius:12px;padding:14px;border:1px solid var(--border-dark);margin-bottom:14px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:50%;background:#FF5C00;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">
              ↑
            </div>
            <div>
              <div style="font-size:15px;font-weight:700;color:#fff;">In 200m take Exit 39</div>
              <div style="font-size:11px;color:var(--text-light-muted);">Sheikh Zayed Road (E11) towards Abu Dhabi</div>
            </div>
          </div>
        </div>

        <div style="background:#0E1620;border-radius:14px;padding:16px;text-align:center;border:1px solid var(--border-dark);margin-bottom:16px;">
          <div style="font-size:36px;font-weight:800;color:#10B981;font-family:var(--font-heading);">84 <span style="font-size:16px;color:var(--text-light-muted);">km/h</span></div>
          <div style="font-size:12px;color:var(--text-light-muted);">Speed Limit: 100 km/h · Smooth Transit</div>
          <div style="margin-top:10px;font-size:14px;font-weight:600;color:#fff;">ETA: 35 min remaining</div>
        </div>

        <button class="btn btn-success" style="width:100%;height:46px;" onclick="window.DriverAppSimulator.finishDelivery()">
          Complete Delivery Handover ✓
        </button>
      `;
    } else if (this.currentStage === 'completed') {
      screen.innerHTML = `
        <div class="phone-top-status">
          <span>10:35</span>
          <span>Delivered</span>
        </div>

        <div style="text-align:center;padding:24px 0;">
          <div style="width:60px;height:60px;background:rgba(16,185,129,0.15);border:2px solid #10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#10B981;font-size:28px;margin:0 auto 16px;">
            ✓
          </div>
          <h3 style="font-size:20px;color:#fff;">Move Completed!</h3>
          <p style="font-size:12px;color:var(--text-light-muted);margin-top:4px;">Delivery report & digital invoice issued to dealership.</p>
          
          <div style="font-size:28px;font-weight:800;color:#10B981;margin:16px 0;">+ AED 340.00</div>
          <div style="font-size:11px;color:var(--text-light-muted);">Credited to your MoveMyCar Driver Wallet</div>
        </div>

        <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.DriverAppSimulator.resetAlert()">
          Ready for Next Job
        </button>
      `;
    }
  },

  acceptJob() {
    this.currentStage = 'inspection';
    this.renderScreen();
    if (window.showToast) window.showToast('Job Accepted! Please complete the 8-point condition inspection.');
  },

  declineJob() {
    if (window.showToast) window.showToast('Job declined. Returning to available queue.');
  },

  completeHandover() {
    this.currentStage = 'navigation';
    this.renderScreen();
    if (window.showToast) window.showToast('Inspection certified & signed! Vehicle now in transit.');
  },

  finishDelivery() {
    this.driverEarnings += 340;
    this.currentStage = 'completed';
    this.renderScreen();
    if (window.showToast) window.showToast('Delivery completed! Handover certificate generated.');
  },

  resetAlert() {
    this.currentStage = 'alert';
    this.renderScreen();
  }
};

window.DriverAppSimulator = DriverAppSimulator;
