const HandoverReportEngine={
  canvas:null,ctx:null,isDrawing:false,
  initSignaturePad(id='driverSigPad'){
    this.canvas=document.getElementById(id);if(!this.canvas)return;this.ctx=this.canvas.getContext('2d');this.resizeCanvas();
    const canvas=this.canvas;canvas.style.touchAction='none';
    canvas.onpointerdown=e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);this.isDrawing=true;const rect=canvas.getBoundingClientRect();this.ctx.beginPath();this.ctx.moveTo((e.clientX-rect.left)*canvas.width/rect.width,(e.clientY-rect.top)*canvas.height/rect.height);};
    canvas.onpointermove=e=>{if(!this.isDrawing)return;this.hasSignature=true;const rect=canvas.getBoundingClientRect();this.ctx.lineTo((e.clientX-rect.left)*canvas.width/rect.width,(e.clientY-rect.top)*canvas.height/rect.height);this.ctx.stroke();};
    canvas.onpointerup=canvas.onpointercancel=()=>{this.isDrawing=false;};
  },
  resizeCanvas(){if(!this.canvas)return;this.canvas.width=this.canvas.getBoundingClientRect().width||300;this.canvas.height=120;this.ctx.strokeStyle='#0f172a';this.ctx.lineWidth=2.5;this.ctx.lineCap='round';this.ctx.lineJoin='round';},
  clearSignature(){this.hasSignature=false;if(this.ctx&&this.canvas)this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);},
  generateDefaultSignature(){if(!this.ctx)return;this.clearSignature();this.ctx.beginPath();this.ctx.moveTo(25,70);this.ctx.bezierCurveTo(75,20,100,90,150,45);this.ctx.bezierCurveTo(180,70,210,30,260,60);this.ctx.stroke();this.hasSignature=true;},
  openHandoverModal(ref='MMC-7821'){
    const job=window.INITIAL_JOBS.find(j=>j.ref===ref);if(!job)return window.showToast('Movement not found.');
    const esc=window.escapeHTML,loc=window.UAE_LOCATIONS;
    document.getElementById('handoverModalContent').innerHTML=`<article class="document-sheet"><img class="document-logo" src="assets/movemycar-logo.png" alt="MoveMyCar Vehicle Logistics UAE"><div class="document-heading"><div><span class="section-tag">Vehicle condition report</span><h2>${esc(job.ref)}</h2><p>${esc(job.vehicle)} · ${esc(job.plate||job.vin)}</p></div><span class="badge ${job.status==='Delivered'?'badge-success':'badge-warning'}">${esc(job.status==='Delivered'?'Delivery recorded':'Awaiting completion')}</span></div><dl class="dash-facts"><div><dt>Collection</dt><dd>${esc(loc[job.from].name)}</dd></div><div><dt>Delivery</dt><dd>${esc(loc[job.to].name)}</dd></div><div><dt>Driver</dt><dd>${esc(job.driver||'Not assigned')}</dd></div><div><dt>Pickup date</dt><dd>${esc(job.date||'Not scheduled')}</dd></div><div><dt>Chassis</dt><dd>${esc(job.vin)}</dd></div></dl><h3>Inspection reference gallery</h3><p class="dash-caption">Reference images show the inspection format. Vehicle-specific photos and signed collection records are not available for this movement.</p><div class="inspection-photo-grid">${window.HANDOVER_PHOTOS.map((photo,i)=>`<figure class="inspection-photo-item"><img src="${photo.url}" alt="Vehicle inspection reference ${i+1}"><figcaption class="inspection-photo-label">Reference ${i+1}</figcaption></figure>`).join('')}</div><div class="document-signature"><div><strong>Collection signature</strong><p>Not recorded</p></div><div><strong>Delivery signature</strong><p>Not recorded</p></div></div></article>`;
    const body=document.getElementById('handoverModalContent');
    const signatures=body.querySelector('.document-signature');signatures.replaceChildren();
    for(const [phase,label]of [['collection','Collection'],['delivery','Delivery']]){
      const record=job[phase+'Inspection'],card=document.createElement('div'),heading=document.createElement('strong');heading.textContent=label+' signature';card.append(heading);
      const description=document.createElement('p');description.textContent=record?record.signer+' · '+new Date(record.recordedAt).toLocaleString('en-GB',{timeZone:'Asia/Dubai'})+' GST':'Not recorded';card.append(description);
      if(record){const details=document.createElement('p');details.textContent=record.checks.filter(Boolean).length+'/8 checks · Odometer '+record.odometer.toLocaleString()+' km · Fuel '+record.fuel;card.append(details);if(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(record.signature)&&record.signature.length<400000){const img=document.createElement('img');img.src=record.signature;img.alt=label+' signature by '+record.signer;card.append(img);}else{const note=document.createElement('p');note.textContent=record.signature;card.append(note);}}
      signatures.append(card);
    }
    if(job.collectionInspection||job.deliveryInspection)body.querySelector('.dash-caption').textContent='Condition checks and signatures are recorded below. Gallery photographs are reference images only.';
    document.getElementById('handoverReportModal').classList.add('active');
  },
  openInvoiceModal(ref='MMC-7821'){
    const job=window.INITIAL_JOBS.find(j=>j.ref===ref);if(!job)return window.showToast('Movement not found.');
    const esc=window.escapeHTML,loc=window.UAE_LOCATIONS,money=n=>'AED '+Number(n).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
    document.querySelector('#taxInvoiceModal .modal-title').textContent='Invoice preview';
    const subtotal=job.quote?.subtotal??Number((job.cost/1.05).toFixed(2)),vat=job.quote?.vat??Number((job.cost-subtotal).toFixed(2));
    document.getElementById('invoiceModalContent').innerHTML=`<article class="document-sheet"><div class="document-heading"><img class="document-logo" src="assets/movemycar-logo.png" alt="MoveMyCar Vehicle Logistics UAE"><div><h2>Invoice</h2><p>INV-${esc(job.ref.replace('MMC-',''))}</p><p>${esc(job.invoiceDate||job.date||new Date().toLocaleDateString('en-GB',{timeZone:'Asia/Dubai'}))}</p></div></div><div class="document-heading"><div><span class="section-tag">Billed to</span><h3>${esc(job.dealer)}</h3></div><span class="badge ${job.paymentStatus==='Paid'?'badge-success':'badge-warning'}">${job.paymentStatus==='Paid'?'Recorded as paid':'Unpaid'}</span></div><dl class="dash-facts"><div><dt>Movement</dt><dd>${esc(job.ref)}</dd></div><div><dt>Vehicle</dt><dd>${esc(job.vehicle)}</dd></div><div><dt>Route</dt><dd>${esc(loc[job.from].name)} → ${esc(loc[job.to].name)}</dd></div></dl><table class="invoice-items-table"><thead><tr><th>Description</th><th>Qty</th><th>Amount</th></tr></thead><tbody><tr><td>Vehicle relocation · ${job.km} km estimate</td><td>1</td><td>${money(subtotal)}</td></tr><tr><td>Digital handover</td><td>1</td><td>Included</td></tr></tbody></table><div class="invoice-totals-box"><div class="inv-total-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="inv-total-row"><span>VAT (5%)</span><strong>${money(vat)}</strong></div><div class="inv-total-row grand"><span>Total</span><strong>${money(job.cost)}</strong></div></div><p class="document-footnote">Invoice preview. Tax registration and payment processing are not connected.</p></article>`;
    document.getElementById('taxInvoiceModal').classList.add('active');
  }
};
window.HandoverReportEngine=HandoverReportEngine;
