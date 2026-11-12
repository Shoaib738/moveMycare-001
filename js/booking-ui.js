document.addEventListener('DOMContentLoaded',()=>{
  const esc=window.escapeHTML;
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const money=value=>'AED '+Number(value).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const barDate=document.getElementById('barDate');barDate.min=today();barDate.value=today();barDate.required=true;
  const confirmationActions=document.createElement('div');confirmationActions.className='workspace-actions';confirmationActions.style.justifyContent='center';confirmationActions.innerHTML='<button class="btn btn-outline" type="button" id="confirmationPayment">Preview payment</button><button class="btn btn-outline" type="button" id="confirmationCustomer">My bookings</button>';document.getElementById('wizardStep3').append(confirmationActions);
  document.getElementById('confirmationPayment').onclick=()=>{const ref=document.getElementById('wizGeneratedRef').textContent.trim();window.closeAllModals();window.PaymentUI.open(ref);};
  document.getElementById('confirmationCustomer').onclick=()=>{window.closeAllModals();window.switchView('customer');};
  const options=document.createElement('div');options.className='booking-options';options.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0';
  options.innerHTML='<div class="bar-field"><label class="bar-label" for="modalVehicle">Vehicle type</label><select id="modalVehicle" class="bar-control"></select></div><div class="bar-field"><label class="bar-label" for="modalDate">Pickup date</label><input id="modalDate" class="bar-control" type="date" required></div>';
  document.getElementById('wizardStep1').append(options);
  document.getElementById('modalVehicle').innerHTML=document.getElementById('barVeh').innerHTML;
  document.getElementById('modalDate').min=today();document.getElementById('modalDate').value=today();
  const quote=document.createElement('section');quote.className='price-breakdown';quote.id='wizardQuote';quote.setAttribute('aria-label','Booking charges');quote.setAttribute('aria-live','polite');document.querySelector('#bookingWizardModal .modal-body').prepend(quote);
  const bulk=document.createElement('section');bulk.className='price-breakdown bulk-quote';bulk.id='bulkQuote';document.querySelector('.bulk-move-card').append(bulk);
  function breakdown(from,to,type,qty=1,dealer=false){
    if(from===to)return '<h4>Choose a different destination</h4><p>Your pickup and delivery locations must be different.</p>';
    const q=window.PricingEngine.computeQuote({from,to,vehicleType:type,qty,isDealer:dealer});
    return `<h4>${qty>1?'Fleet quote':'Your price breakdown'}</h4><p>${esc(window.UAE_LOCATIONS[from].name)} → ${esc(window.UAE_LOCATIONS[to].name)} · ${q.distanceKm} km estimate · ${q.duration}${qty>1?' · '+qty+' vehicles':''}</p><dl><div><dt>Booking & dispatch (${qty} × AED 120)</dt><dd>${money(q.baseCharge)}</dd></div><div><dt>Distance (${q.distanceKm} km × AED 2.10${qty>1?' × '+qty:''})</dt><dd>${money(q.distanceCharge)}</dd></div>${q.vehicleAdjustment?`<div><dt>Vehicle handling adjustment</dt><dd>${money(q.vehicleAdjustment)}</dd></div>`:''}${q.discountAmount?`<div><dt>Dealer / fleet discount (${q.discountPct}%)</dt><dd>− ${money(q.discountAmount)}</dd></div>`:''}<div><dt>Subtotal</dt><dd>${money(q.subtotal)}</dd></div><div><dt>VAT (5%)</dt><dd>${money(q.vat)}</dd></div><div class="price-total"><dt>Total quote</dt><dd>${money(q.total)}</dd></div></dl><p class="dash-caption">Digital handover included. No payment is collected when saving this booking request.</p>`;
  }
  function update(){
    quote.innerHTML=breakdown(document.getElementById('modalFrom').value,document.getElementById('modalTo').value,document.getElementById('modalVehicle').value,1,!!window.PanelApp?.isDealer());
  }
  function updateBulk(){const count=window.DealerPortal.tempVins.length;bulk.innerHTML=count?breakdown(document.getElementById('dealerBulkFrom').value,document.getElementById('dealerBulkTo').value,'suv',count,true):'<h4>Fleet quote</h4><p>Add vehicles to see the full fleet price before confirming.</p>';}
  const open=window.openBookingWizard;window.openBookingWizard=()=>{open();document.getElementById('modalVehicle').value=document.getElementById('barVeh').value;document.getElementById('modalDate').value=barDate.value;update();window.SearchSelects?.refresh();};
  ['modalFrom','modalTo','modalVehicle'].forEach(id=>document.getElementById(id).addEventListener('change',update));
  ['dealerBulkFrom','dealerBulkTo'].forEach(id=>document.getElementById(id).addEventListener('change',updateBulk));
  const tags=window.DealerPortal.renderVinTags.bind(window.DealerPortal);window.DealerPortal.renderVinTags=()=>{tags();updateBulk();};
  document.getElementById('modalFrom').value='alquoz';document.getElementById('modalTo').value='yas';update();updateBulk();
  document.getElementById('inputTrackRef').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('btnSearchTrack').click();}});
  // Keep every label associated with its control, including legacy form markup.
  document.querySelectorAll('.bar-field').forEach((field,i)=>{const label=field.querySelector('label'),control=field.querySelector('input,select,textarea');if(label&&control){control.id||='form-field-'+i;label.htmlFor=control.id;}});
  document.querySelectorAll('#bookingWizardModal input[type=text]').forEach(input=>{input.maxLength=180;input.pattern='.*\\S.*';});
  let lastFocus=null;
  function syncModalFocus(){
    const modal=document.querySelector('.modal-overlay.active');
    if(modal){if(!lastFocus)lastFocus=document.activeElement;document.body.style.overflow='hidden';if(!modal.contains(document.activeElement))modal.querySelector('button:not([disabled]),input:not([type=hidden])')?.focus();}
    else {document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;window.SearchSelects?.close();window.DatePickers?.close();}
  }
  const observer=new MutationObserver(syncModalFocus);
  function observeModals(){document.querySelectorAll('.modal-overlay:not([data-dialog-ready])').forEach(modal=>{
    modal.dataset.dialogReady='true';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const title=modal.querySelector('h3');if(title){title.id||=modal.id+'Title';modal.setAttribute('aria-labelledby',title.id);}
    observer.observe(modal,{attributes:true,attributeFilter:['class']});modal.addEventListener('click',e=>{if(e.target===modal)window.closeAllModals();});if(modal.classList.contains('active'))syncModalFocus();
  });}
  observeModals();new MutationObserver(observeModals).observe(document.body,{childList:true});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){window.closeAllModals();window.closeMobileDrawer();}
    if(e.key!=='Tab')return;const modal=document.querySelector('.modal-overlay.active');if(!modal)return;
    const list=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],textarea')].filter(el=>el.getClientRects().length&&!el.classList.contains('native-select-source'));
    const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  });
  window.BookingUI={today,update,updateBulk};
});
