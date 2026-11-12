/* Frontend workspace. Account state and records stay in this browser. */
document.addEventListener('DOMContentLoaded', () => {
  const esc=window.escapeHTML, store=window.DemoStore, loc=window.UAE_LOCATIONS;
  const money=n=>'AED '+Number(n||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const base=location.pathname.replace(/(?:dealer-panel|admin-panel|driver-panel|customer-panel)(?:\/index\.html|\/)?$/,'').replace(/index\.html$/,'');
  const panelURL=role=>base+role+'-panel/';
  const viewId=r=>({dealer:'dealer',admin:'dispatch',driver:'driver',customer:'customer'})[r];
  const account=role=>({dealer:'dealer@MoveMyCar.ae',admin:'admin123@MoveMyCar.ae',driver:'driver@MoveMyCar.ae',customer:'customer@MoveMyCar.ae'})[role];
  const password=r=>({dealer:'dealer123',admin:'admin123',driver:'driver123',customer:'customer123'})[r];
  const accountName='Al Nabooda Automobiles';
  const icons={overview:'▦',bookings:'▱',movements:'▱',dispatch:'⇄',drivers:'♙',dealers:'▥',handovers:'♧',billing:'▤',reports:'▥',account:'⚙'};
  const names={overview:'Overview',bookings:'Vehicle moves',movements:'Vehicle moves',dispatch:'Dispatch',drivers:'Drivers',dealers:'Dealerships',handovers:'Handovers',billing:'Invoices',reports:'Reports',account:'Account'};
  let role=null, tab='overview', selectedRef=null, selectedDriver=null, selectedDealer=null, range='all', session=null, maps=[];
  try{session=JSON.parse(sessionStorage.getItem('mmc-session'));}catch{}
  const signedIn=r=>session?.role===r&&session.expires>Date.now();
  const originalSwitch=window.switchView;
  const auth=document.createElement('main');auth.id='view-auth';auth.className='app-view';document.querySelector('.site-footer').before(auth);
  const legacy={};
  for(const r of ['dealer','admin','driver','customer']){
    const view=document.getElementById('view-'+viewId(r));
    const wrapper=document.createElement('div');wrapper.hidden=true;wrapper.className='legacy-workspace';
    while(view.firstChild)wrapper.append(view.firstChild);view.append(wrapper);legacy[r]=wrapper;
  }
  const composer=document.querySelector('.bulk-move-card');
  const jobsFor=(r=role)=>window.Operations.scoped(r);
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const jobDate=j=>j.createdAt?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(j.createdAt)):j.date||today();
  const filteredJobs=()=>jobsFor().filter(j=>range==='all'||Date.parse(jobDate(j))>=Date.parse(today())-(range==='week'?6:29)*86400000&&Date.parse(jobDate(j))<=Date.parse(today()));
  const pill=status=>`<span class="dash-status status-${status==='Delivered'||status==='Paid'||status==='Available'?'success':['In Transit','Assigned','Picked Up'].includes(status)?'info':status==='Cancelled'?'cancelled':'warning'}">${esc(status==='Unassigned'?'Awaiting driver':status)}</span>`;
  const empty=text=>`<div class="dash-empty">${esc(text)}</div>`;
  const invoiceIssued=j=>j.invoiceIssued===true||(j.invoiceIssued!==false&&j.status==='Delivered');
  function login(r){
    document.querySelector('.skip-link')?.setAttribute('href','#view-auth');
    role=r;document.body.classList.remove('workspace-open');document.querySelectorAll('.app-view').forEach(v=>v.classList.remove('active'));auth.classList.add('active');
    auth.innerHTML=`<form class="auth-card" id="panelLogin"><img class="auth-logo" src="assets/movemycar-logo.png" alt="MoveMyCar Vehicle Logistics UAE"><span class="badge badge-primary">${({admin:'Operations',dealer:'Dealership',driver:'Driver',customer:'Customer'})[r]} workspace</span><h1>Welcome back</h1><p>Sign in to manage your ${r==='admin'?'operations':r==='driver'?'assigned jobs':'vehicle movements'}.</p><label for="loginEmail">Username or email</label><input class="bar-control" id="loginEmail" name="username" autocomplete="username" required><label for="loginPassword">Password</label><input class="bar-control" type="password" id="loginPassword" name="password" autocomplete="current-password" required><p class="auth-error" id="loginError" role="alert" hidden></p><button class="btn btn-primary" type="submit">Sign in →</button><a class="btn btn-outline" href="${base}">Back to website</a></form>`;
    document.getElementById('panelLogin').onsubmit=e=>{
      e.preventDefault();const email=document.getElementById('loginEmail').value.trim().toLowerCase();
      if(![account(r).toLowerCase(),r==='admin'?'admin123':r].includes(email)||document.getElementById('loginPassword').value!==password(r)){
        const error=document.getElementById('loginError');error.hidden=false;error.textContent='The email or password is incorrect.';return;
      }
      session={role:r,expires:Date.now()+8*60*60*1000};try{sessionStorage.setItem('mmc-session',JSON.stringify(session));}catch{}show(r);
    };
  }
  function stats(cards){return `<div class="dash-stats">${cards.map(([label,value,icon,color='primary'])=>`<article class="dash-stat"><span class="dash-stat-icon tone-${color}" aria-hidden="true">${icon}</span><div><p>${label}</p><strong class="${String(value).startsWith('AED')?'money-stat':''}">${value}</strong></div></article>`).join('')}</div>`;}
  function table(jobs,kind='moves'){
    return `<div class="dash-table-wrap"><table class="dash-table"><thead><tr><th>${kind==='billing'?'Invoice / account':'Vehicle / reference'}</th><th>Route</th><th>${kind==='billing'?'Amount':'Status'}</th><th>${kind==='billing'?'Status':'Pickup'}</th><th>Details</th></tr></thead><tbody>${jobs.map(j=>`<tr class="${j.ref===selectedRef?'selected-row':''}"><td><button class="dash-row-link" data-select="${esc(j.ref)}"><strong>${esc(kind==='billing'?'INV-'+j.ref.replace('MMC-',''):j.vehicle)}</strong><span>${esc(kind==='billing'?j.dealer:j.ref)}</span></button></td><td>${esc(loc[j.from].name)}<span class="route-divider">→</span>${esc(loc[j.to].name)}</td><td>${kind==='billing'?money(j.cost):pill(j.status)}</td><td>${kind==='billing'?pill(j.paymentStatus==='Paid'?'Paid':'Unpaid'):esc(j.date||'Not scheduled')}</td><td><button class="dash-icon-button" aria-label="View ${esc(j.ref)}" data-select="${esc(j.ref)}">→</button></td></tr>`).join('')||'<tr><td colspan="5">No records match your filters.</td></tr>'}</tbody></table></div>`;
  }
  function bars(jobs){
    const days=Array.from({length:7},(_,i)=>new Date(Date.parse(today())-(6-i)*86400000).toISOString().slice(0,10));
    const values=days.map(day=>jobs.filter(j=>jobDate(j)===day).length),max=Math.max(1,...values);
    return `<div class="dash-bar-chart" role="img" aria-label="Movements booked in the last seven days: ${values.join(', ')}">${days.map((d,i)=>`<div class="bar-column"><span class="bar-value">${values[i]}</span><div class="bar-track"><div class="bar-fill" style="height:${values[i]/max*100}%"></div></div><span>${new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span></div>`).join('')}</div>`;
  }
  function donut(items,label){
    const total=items.reduce((s,i)=>s+i.value,0);let cursor=0;
    const stops=items.map(i=>{const start=cursor;cursor+=total?i.value/total*100:0;return `${i.color} ${start}% ${cursor}%`;}).join(',');
    return `<div class="dash-donut-layout"><div class="dash-donut" style="background:${total?'conic-gradient('+stops+')':'#e2e8f0'}" role="img" aria-label="${esc(items.map(i=>i.label+': '+i.value).join(', '))}"><div><strong>${total}</strong><span>${label}</span></div></div><div class="dash-legend">${items.map(i=>`<p><span style="background:${i.color}"></span>${i.label}<strong>${i.value}</strong></p>`).join('')}</div></div>`;
  }
  function renderOverview(root,jobs){
    const active=jobs.filter(j=>window.Operations.active.includes(j.status)).length,delivered=jobs.filter(j=>j.status==='Delivered').length,pending=jobs.filter(j=>j.status==='Unassigned');
    root.innerHTML=role==='admin'?stats([['Active moves',active,'⇄'],['Available drivers',window.DRIVER_ROSTER.filter(d=>d.status==='Available').length,'♙','info'],['Awaiting assignment',pending.length,'◷','warning'],['Booked value',money(jobs.filter(j=>j.status!=='Cancelled').reduce((s,j)=>s+j.cost,0)),'▤']]):stats([['Moves booked',jobs.length,'▱'],['Delivered',delivered,'✓','success'],['Active moves',active,'➤','info'],['Scheduled',pending.length,'◷','warning']]);
    root.insertAdjacentHTML('beforeend',`<div class="dash-chart-grid"><article class="dash-card"><h3>Moves booked by day</h3><p class="dash-caption">Last seven days</p>${bars(jobs)}</article><article class="dash-card"><h3>${role==='admin'?'Driver availability':'Move status'}</h3>${role==='admin'?donut([{label:'Available',value:window.DRIVER_ROSTER.filter(d=>d.status==='Available').length,color:'#4f46e5'},{label:'On a move',value:window.DRIVER_ROSTER.filter(d=>d.status==='On Trip').length,color:'#60a5fa'},{label:'Offline',value:window.DRIVER_ROSTER.filter(d=>d.status==='Offline').length,color:'#cbd5e1'}],'drivers'):donut([{label:'Delivered',value:delivered,color:'#4f46e5'},{label:'Active',value:active,color:'#60a5fa'},{label:'Scheduled',value:pending.length,color:'#fbbf24'},{label:'Cancelled',value:jobs.filter(j=>j.status==='Cancelled').length,color:'#cbd5e1'}],'moves')}</article></div><article class="dash-card"><div class="dash-card-heading"><h3>${role==='admin'?'Needs attention':'Upcoming handovers'}</h3><button class="dash-text-button" data-go="${role==='admin'?'dispatch':'handovers'}">View ${role==='admin'?'dispatch':'handovers'} →</button></div>${table(role==='admin'?pending:jobs.filter(j=>!['Delivered','Cancelled'].includes(j.status)).slice(0,5))}</article>`);
  }
  function moveDetails(job){
    if(!job)return empty('Select a movement to view its details.');
    return `<article class="dash-card detail-card"><div class="dash-card-heading"><h3>${esc(job.ref)}</h3>${pill(job.status)}</div><p>${esc(job.vehicle)}</p><div class="dash-route"><span>${esc(loc[job.from].name)}</span><span>↓</span><span>${esc(loc[job.to].name)}</span></div><dl class="dash-facts"><div><dt>Driver</dt><dd>${esc(job.driver||'Awaiting assignment')}</dd></div><div><dt>Pickup date</dt><dd>${esc(job.date||'Not scheduled')}</dd></div><div><dt>Distance estimate</dt><dd>${job.km} km</dd></div><div><dt>Plate / chassis</dt><dd>${esc(job.plate||job.vin)}</dd></div><div><dt>Quoted total</dt><dd>${money(job.cost)}</dd></div></dl><div class="detail-actions"><button class="btn btn-primary" data-track="${esc(job.ref)}">Track movement</button><button class="btn btn-outline" data-handover="${esc(job.ref)}">View handover</button>${role==='admin'&&job.status==='In Transit'?`<button class="btn btn-outline" data-deliver="${esc(job.ref)}">Mark delivered</button>`:''}</div></article>`;
  }
  function renderMoves(root,jobs){
    root.innerHTML=`<div class="dash-filters"><label class="dash-search"><span aria-hidden="true">⌕</span><input type="search" id="adminSearch" aria-label="Search movements" placeholder="Search reference, plate or vehicle"></label><select id="adminStatus" aria-label="Movement status"><option value="">All statuses</option><option>Unassigned</option><option>Assigned</option><option>Picked Up</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select>${role==='dealer'?'<button class="btn btn-outline" id="showBulk" aria-expanded="false">+ Fleet booking</button>':''}</div><div id="composerSlot" hidden></div><div class="dash-detail-layout"><article class="dash-card dash-list-card" id="adminResults"></article><div id="moveDetails"></div></div>`;
    const update=()=>{const query=document.getElementById('adminSearch').value.toLowerCase(),status=document.getElementById('adminStatus').value;
      const filtered=jobs.filter(j=>(!status||status===j.status)&&`${j.ref} ${j.plate} ${j.vin} ${j.vehicle} ${j.dealer}`.toLowerCase().includes(query));
      if(!filtered.some(j=>j.ref===selectedRef))selectedRef=filtered[0]?.ref;
      document.getElementById('adminResults').innerHTML=table(filtered);document.getElementById('moveDetails').innerHTML=moveDetails(filtered.find(j=>j.ref===selectedRef));bind(root);
      root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectedRef=b.dataset.select;update();});
    };
    document.getElementById('adminSearch').oninput=update;document.getElementById('adminStatus').onchange=update;update();
    if(role==='dealer'){
      document.getElementById('composerSlot').append(composer);document.getElementById('showBulk').onclick=()=>{const slot=document.getElementById('composerSlot');slot.hidden=!slot.hidden;document.getElementById('showBulk').setAttribute('aria-expanded',String(!slot.hidden));if(!slot.hidden)document.getElementById('dealerVinInput').focus();};
      window.DealerPortal.init();
    }
  }
  function smallMap(id,jobs,focus){
    const node=document.getElementById(id);if(!node||!window.L)return;
    if(jobs[0])window.GoogleMapsLinks?.attach(node,jobs[0],{allowEmbed:true});
    const map=L.map(node,{scrollWheelZoom:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView(focus||[25.14,55.23],10);maps.push(map);
    const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    const bounds=[];jobs.forEach(j=>{const from=loc[j.from].coords,to=loc[j.to].coords;bounds.push(from,to);L.circleMarker(from,{radius:7,color:'#fff',weight:3,fillColor:'#4f46e5',fillOpacity:1}).addTo(map).bindTooltip(loc[j.from].name);L.polyline([from,to],{color:'#4f46e5',weight:3,dashArray:'6 8'}).addTo(map);});
    if(bounds.length)map.fitBounds(bounds,{padding:[35,35],maxZoom:12,animate:false});
    const notice=node.parentElement.querySelector('.dash-caption');tiles.on('tileerror',()=>{if(notice)notice.textContent='Map tiles unavailable. Check your internet connection.';});
    requestAnimationFrame(()=>{if(node.isConnected&&maps.includes(map))map.invalidateSize();});
  }
  function renderDispatch(root,jobs){
    const queue=jobs.filter(j=>j.status==='Unassigned'),job=queue.find(j=>j.ref===selectedRef)||queue[0];selectedRef=job?.ref;
    root.innerHTML=`<div class="dash-detail-layout"><article class="dash-card map-card"><div id="dispatchMap" class="dash-map"></div><p class="dash-caption">Pickup locations · Route lines are estimates</p></article><article class="dash-card"><h3>Assign a driver</h3>${job?`<p class="dash-job-title">${esc(job.ref)}<span>${esc(job.vehicle)}</span></p><div class="dash-route"><span>${esc(loc[job.from].name)}</span><span>↓</span><span>${esc(loc[job.to].name)}</span></div><label class="dash-field-label" for="dispatchDriver">Available driver</label><select id="dispatchDriver" required aria-label="Available driver"><option value="">Choose a driver</option>${window.DRIVER_ROSTER.map(d=>`<option value="${esc(d.id)}" ${d.status!=='Available'?'disabled':''}>${esc(d.name)} · ${d.status==='Available'?d.distKm+' km away':'On a move'}</option>`).join('')}</select><button class="btn btn-primary detail-full" id="assignDriver">Confirm assignment</button>`:empty('All movements have been assigned.')}</article></div><article class="dash-card"><h3>Dispatch queue</h3>${table(queue)}</article>`;
    smallMap('dispatchMap',job?[job]:[]);bind(root);
    root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectedRef=b.dataset.select;render();});
    if(job)document.getElementById('assignDriver').onclick=()=>{
      if(!signedIn('admin'))return login('admin');const select=document.getElementById('dispatchDriver');if(!select.reportValidity())return;
      const driver=window.DRIVER_ROSTER.find(d=>d.id===select.value);if(!driver||driver.status!=='Available')return window.showToast('Choose an available driver.');
      try{window.Operations.assign(job.ref,driver.id);render();window.showToast('Driver assigned. Collection inspection is next.');}catch(error){window.showToast(error.message);}
    };
  }
  function renderDrivers(root){
    root.innerHTML=`<div class="dash-segmented" role="group" aria-label="Driver records"><button class="is-selected" id="activeDrivers" aria-pressed="true">Active drivers</button><button id="driverRequests" aria-pressed="false">Registration requests</button></div><div id="driverRecords"><div class="dash-filters"><label class="dash-search"><span>⌕</span><input type="search" id="driverSearch" aria-label="Search drivers" placeholder="Search driver…"></label><select id="driverAvailability" aria-label="Driver availability"><option value="">All availability</option><option>Available</option><option value="On Trip">On a move</option><option>Offline</option></select></div><div class="dash-detail-layout"><article class="dash-card"><h3>Driver directory</h3><div id="driverDirectory"></div></article><div id="driverDetails"></div></div></div><article class="dash-card" id="registrationRecords" hidden></article>`;
    const toggle=requests=>{document.getElementById('driverRecords').hidden=requests;document.getElementById('registrationRecords').hidden=!requests;for(const id of ['activeDrivers','driverRequests']){const active=(id==='driverRequests')===requests;document.getElementById(id).classList.toggle('is-selected',active);document.getElementById(id).setAttribute('aria-pressed',String(active));}};
    document.getElementById('activeDrivers').onclick=()=>toggle(false);
    const requests=()=>{toggle(true);const applications=store.read('mmc-driver-applications',[]);document.getElementById('registrationRecords').innerHTML='<h3>Registration requests</h3>'+ (applications.map((a,i)=>`<div class="dash-simple-row"><div><strong>${esc(a.name)}</strong><p>${esc(a.area)} · ${esc(a.mobile)}</p></div>${a.reviewed?pill('Reviewed'):`<button class="btn btn-outline" data-review="${i}">Mark reviewed</button>`}</div>`).join('')||empty('No registration requests received on this device.'));root.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{applications[Number(b.dataset.review)].reviewed=true;store.write('mmc-driver-applications',applications);requests();});};
    document.getElementById('driverRequests').onclick=requests;
    const update=()=>{
      const query=document.getElementById('driverSearch').value.toLowerCase(),status=document.getElementById('driverAvailability').value;
      const drivers=window.DRIVER_ROSTER.filter(d=>d.name.toLowerCase().includes(query)&&(!status||d.status===status));const driver=drivers.find(d=>d.id===selectedDriver)||drivers[0];selectedDriver=driver?.id;
      document.getElementById('driverDirectory').innerHTML=drivers.map(d=>`<button class="dash-directory-row ${d===driver?'is-selected':''}" data-driver="${esc(d.id)}"><span class="dash-avatar">${esc(d.name.split(' ').map(n=>n[0]).join(''))}</span><span><strong>${esc(d.name)}</strong><small>${d.trips} completed trips</small></span>${pill(d.status==='On Trip'?'In Transit':d.status)}</button>`).join('')||empty('No drivers match your search.');
      const assigned=driver?window.INITIAL_JOBS.filter(j=>j.driver===driver.name&&window.Operations.active.includes(j.status)):[];
      document.getElementById('driverDetails').innerHTML=driver?`<article class="dash-card"><span class="dash-avatar avatar-large">${esc(driver.name.split(' ').map(n=>n[0]).join(''))}</span><h3>${esc(driver.name)}</h3>${pill(driver.status==='On Trip'?'In Transit':driver.status)}<dl class="dash-facts"><div><dt>Rating</dt><dd>${driver.rating} / 5</dd></div><div><dt>Experience</dt><dd>${esc(driver.carExp)}</dd></div><div><dt>Current assignment</dt><dd>${assigned.map(j=>esc(j.ref)).join(', ')||'No current assignment'}</dd></div></dl><button class="btn btn-primary detail-full" data-go="dispatch">View dispatch queue</button></article>`:empty('Select a driver.');
      root.querySelectorAll('[data-driver]').forEach(b=>b.onclick=()=>{selectedDriver=b.dataset.driver;update();});bind(root);
    };document.getElementById('driverSearch').oninput=update;document.getElementById('driverAvailability').onchange=update;update();
  }
  function renderDealers(root,jobs){
    root.innerHTML='<div class="dash-detail-layout"><article class="dash-card"><label class="dash-search"><span>⌕</span><input type="search" id="dealerSearch" aria-label="Search dealerships" placeholder="Search dealership or area"></label><div id="dealerDirectory"></div></article><div id="dealerDetails"></div></div>';
    const update=()=>{
      const query=document.getElementById('dealerSearch').value.toLowerCase();const names=[...new Set(jobs.map(j=>j.dealer))].filter(name=>`${name} ${jobs.filter(j=>j.dealer===name).map(j=>loc[j.from].name).join(' ')}`.toLowerCase().includes(query));
      if(!names.includes(selectedDealer))selectedDealer=names[0];const own=jobs.filter(j=>j.dealer===selectedDealer);
      document.getElementById('dealerDirectory').innerHTML=names.map(name=>`<button class="dash-directory-row ${name===selectedDealer?'is-selected':''}" data-dealer="${esc(name)}"><span class="dash-avatar">▥</span><span><strong>${esc(name)}</strong><small>${jobs.filter(j=>j.dealer===name&&!['Delivered','Cancelled'].includes(j.status)).length} active movements</small></span><span>→</span></button>`).join('')||empty('No dealerships match your search.');
      document.getElementById('dealerDetails').innerHTML=selectedDealer?`<article class="dash-card"><span class="dash-avatar avatar-large">▥</span><h3>${esc(selectedDealer)}</h3><p>Collection area: ${esc(loc[own[0].from].name)}</p><div id="dealerMap" class="dash-map compact-map"></div><p class="dash-caption">Registered movement locations</p><h3>Active moves</h3>${own.filter(j=>j.status!=='Delivered').map(j=>`<div class="dash-simple-row"><strong>${esc(j.ref)}</strong>${pill(j.status)}</div>`).join('')||empty('No active movements.')}<button class="btn btn-primary detail-full" id="viewDealerMoves">View dealership moves</button></article>`:'';
      maps.forEach(m=>m.remove());maps=[];if(own.length)smallMap('dealerMap',own);
      root.querySelectorAll('[data-dealer]').forEach(b=>b.onclick=()=>{selectedDealer=b.dataset.dealer;update();});
      const button=document.getElementById('viewDealerMoves');if(button)button.onclick=()=>{tab='bookings';render();const search=document.getElementById('adminSearch');search.value=selectedDealer;search.dispatchEvent(new Event('input'));};
    };document.getElementById('dealerSearch').oninput=update;update();
  }
  function renderBilling(root,jobs){
    const invoices=jobs.filter(j=>j.status!=='Cancelled'&&invoiceIssued(j));const paid=invoices.filter(j=>j.paymentStatus==='Paid').reduce((s,j)=>s+j.cost,0),total=invoices.reduce((s,j)=>s+j.cost,0);
    root.innerHTML=stats([['Total invoiced',money(total),'▤'],['Recorded as paid',money(paid),'✓','success'],['Outstanding',money(total-paid),'◷','warning']])+`<div class="dash-filters"><label class="dash-search"><span>⌕</span><input type="search" id="invoiceSearch" aria-label="Search invoices" placeholder="Search invoice or dealership"></label><select id="invoiceStatus" aria-label="Invoice status"><option value="">All statuses</option><option>Paid</option><option>Unpaid</option></select></div><div class="dash-detail-layout"><article class="dash-card" id="invoiceList"></article><div id="invoiceDetails"></div></div>`;
    const update=()=>{
      const query=document.getElementById('invoiceSearch').value.toLowerCase(),status=document.getElementById('invoiceStatus').value;
      const rows=invoices.filter(j=>(!status||(j.paymentStatus==='Paid'?'Paid':'Unpaid')===status)&&`${j.ref} ${j.dealer} INV-${j.ref.replace('MMC-','')}`.toLowerCase().includes(query));
      const job=rows.find(j=>j.ref===selectedRef)||rows[0];selectedRef=job?.ref;
      document.getElementById('invoiceList').innerHTML=table(rows,'billing');
      document.getElementById('invoiceDetails').innerHTML=job?`<article class="dash-card"><div class="dash-card-heading"><h3>Invoice INV-${esc(job.ref.replace('MMC-',''))}</h3>${pill(job.paymentStatus==='Paid'?'Paid':'Unpaid')}</div><p>${esc(job.dealer)}</p><p class="dash-job-title">${esc(job.vehicle)}<span>${esc(job.ref)}</span></p><div class="dash-route">${esc(loc[job.from].name)} → ${esc(loc[job.to].name)}</div><dl class="dash-facts"><div><dt>Subtotal</dt><dd>${money(job.cost/1.05)}</dd></div><div><dt>VAT (5%)</dt><dd>${money(job.cost-Number((job.cost/1.05).toFixed(2)))}</dd></div><div><dt>Amount ${job.paymentStatus==='Paid'?'paid':'due'}</dt><dd>${money(job.cost)}</dd></div></dl><div class="detail-actions">${role==='admin'&&job.paymentStatus!=='Paid'?`<button class="btn btn-primary" data-paid="${esc(job.ref)}">Record as paid</button>`:''}<button class="btn btn-outline" data-invoice="${esc(job.ref)}">View / print invoice</button>${job.paymentStatus==='Paid'?`<button class="btn btn-outline" data-slip="${esc(job.ref)}">Payment slip</button>`:role==='dealer'?`<button class="btn btn-primary" data-pay="${esc(job.ref)}">Preview payment</button>`:''}</div></article>`:empty('No invoices match your filters.');
      root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectedRef=b.dataset.select;update();});bind(root);
    };document.getElementById('invoiceSearch').oninput=update;document.getElementById('invoiceStatus').onchange=update;update();
  }
  function renderHandovers(root,jobs){
    root.innerHTML='<div class="dash-detail-layout handover-layout"><article class="dash-card"><label class="dash-field-label" for="handoverStatus">Handover status</label><select id="handoverStatus" aria-label="Handover status"><option value="">All handovers</option><option value="pending">Pending</option><option value="completed">Completed</option></select><div id="handoverList"></div></article><div id="handoverDetails"></div></div>';
    const update=()=>{const status=document.getElementById('handoverStatus').value,rows=jobs.filter(j=>!status||(status==='completed'?j.status==='Delivered':j.status!=='Delivered'));const job=rows.find(j=>j.ref===selectedRef)||rows[0];selectedRef=job?.ref;
      document.getElementById('handoverList').innerHTML=rows.map(j=>`<button class="dash-directory-row ${j===job?'is-selected':''}" data-select="${esc(j.ref)}"><span class="dash-avatar">▱</span><span><strong>${esc(j.ref)}</strong><small>${esc(j.vehicle)}</small></span><span>→</span></button>`).join('')||empty('No matching handovers.');
      document.getElementById('handoverDetails').innerHTML=job?`<article class="dash-card"><div class="dash-card-heading"><div><h3>Handover report</h3><p>${esc(job.ref)} · ${esc(job.vehicle)}</p></div>${pill(job.status==='Delivered'?'Completed':'Pending')}</div><div class="handover-photo-pair">${[0,1].map((n)=>`<figure><img src="${window.HANDOVER_PHOTOS[n].url}" alt="Vehicle condition reference ${n+1}"><figcaption>${n?'Delivery':'Collection'} · ${esc(loc[n?job.to:job.from].name)}</figcaption></figure>`).join('')}</div><p class="dash-caption">Reference images. Vehicle-specific inspection uploads are not connected.</p><dl class="dash-facts"><div><dt>Driver</dt><dd>${esc(job.driver||'Awaiting assignment')}</dd></div><div><dt>Delivery</dt><dd>${esc(job.status)}</dd></div></dl><button class="btn btn-primary" data-handover="${esc(job.ref)}">Open inspection report</button></article>`:'';
      root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectedRef=b.dataset.select;update();});bind(root);
    };document.getElementById('handoverStatus').onchange=update;update();
  }
  function renderReports(root,jobs){
    const delivered=jobs.filter(j=>j.status==='Delivered').length,cancelled=jobs.filter(j=>j.status==='Cancelled').length,eligible=jobs.length-cancelled;const routes=new Map();jobs.forEach(j=>{const key=loc[j.from].name+' → '+loc[j.to].name;routes.set(key,(routes.get(key)||0)+1);});const sorted=[...routes].sort((a,b)=>b[1]-a[1]).slice(0,5),max=Math.max(1,...sorted.map(r=>r[1]));
    root.innerHTML=stats([['Booked moves',jobs.length,'▱'],['Delivered',delivered,'✓','success'],['Delivery completion',eligible?Math.round(delivered/eligible*100)+'%':'0%','◷','info']])+`<div class="dash-chart-grid"><article class="dash-card"><h3>Most booked routes</h3><div class="route-chart">${sorted.map(([name,count])=>`<div><span>${esc(name)}</span><div><i style="width:${count/max*100}%"></i></div><strong>${count}</strong></div>`).join('')||empty('No movements in this period.')}</div></article><article class="dash-card"><h3>Delivery status</h3>${donut([{label:'Delivered',value:delivered,color:'#4f46e5'},{label:'Open moves',value:jobs.length-delivered-cancelled,color:'#93c5fd'},{label:'Cancelled',value:cancelled,color:'#cbd5e1'}],'moves')}</article></div><article class="dash-card"><h3>Report downloads</h3><div class="dash-simple-row"><strong>Vehicle movement ledger</strong><button class="btn btn-outline" data-export>↓ Export CSV</button></div><div class="dash-simple-row"><strong>Handover history</strong><button class="btn btn-outline" id="exportHandovers">↓ Export CSV</button></div></article>`;
    document.getElementById('exportHandovers').onclick=()=>exportJobs(jobs.filter(j=>j.status==='Delivered'),'handovers');bind(root);
  }
  function renderCustomers(root){
    root.innerHTML='<article class="dash-card"><h3>Customer directory</h3><label class="dash-search"><span>⌕</span><input id="customerSearch" type="search" aria-label="Search customers" placeholder="Search customer, email or area"></label><div id="customerDirectory" class="role-job-grid"></div></article>';
    const update=()=>{const q=document.getElementById('customerSearch').value.toLowerCase();document.getElementById('customerDirectory').innerHTML=window.CUSTOMERS.filter(c=>(c.name+' '+c.email+' '+c.area).toLowerCase().includes(q)).map(c=>{const own=window.INITIAL_JOBS.filter(j=>j.customerId===c.id);return '<article class="role-job-card"><h3>'+esc(c.name)+'</h3><p>'+esc(c.email)+'</p><p>'+esc(c.area)+'</p><dl class="dash-facts"><div><dt>Bookings</dt><dd>'+own.length+'</dd></div><div><dt>Booked value</dt><dd>'+money(own.filter(j=>j.status!=='Cancelled').reduce((s,j)=>s+j.cost,0))+'</dd></div></dl></article>';}).join('')||empty('No customers match this search.');};document.getElementById('customerSearch').oninput=update;update();
  }
  function renderAccount(root){
    const prefs=store.read('mmc-dealer-prefs',{});root.innerHTML=`<article class="dash-card account-card"><h3>Dealership preferences</h3><p>${accountName}</p><form id="accountForm"><label class="dash-field-label" for="accountContact">Dispatch contact</label><input class="bar-control" id="accountContact" value="${esc(prefs.contact||'Dispatch team')}" required maxlength="80"><label class="dash-field-label" for="accountBranch">Branch name</label><input class="bar-control" id="accountBranch" value="${esc(prefs.branch||'Dubai Auto Hub')}" required maxlength="80"><button class="btn btn-primary detail-full">Save preferences</button></form></article>`;
    document.getElementById('accountForm').onsubmit=e=>{e.preventDefault();store.write('mmc-dealer-prefs',{contact:document.getElementById('accountContact').value.trim(),branch:document.getElementById('accountBranch').value.trim()});window.showToast('Preferences saved.');};
  }
  function createInvoice(){
    const jobs=jobsFor().filter(j=>j.status!=='Cancelled'&&!invoiceIssued(j));if(!jobs.length)return window.showToast('Every eligible movement already has an invoice.');
    let modal=document.getElementById('createInvoiceModal');if(!modal){modal=document.createElement('div');modal.id='createInvoiceModal';modal.className='modal-overlay';document.body.append(modal);}
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','createInvoiceTitle');
    modal.innerHTML=`<form class="modal-dialog" id="invoiceCreateForm"><div class="modal-header"><h3 id="createInvoiceTitle">Create invoice</h3><button type="button" class="modal-close-btn" aria-label="Close dialog">×</button></div><div class="modal-body"><label class="dash-field-label" for="invoiceMovement">Movement</label><select id="invoiceMovement" required>${jobs.map(j=>`<option value="${esc(j.ref)}">${esc(j.ref)} · ${esc(j.dealer)} · ${money(j.cost)}</option>`).join('')}</select><p class="dash-caption">Invoice totals use the movement's agreed quote.</p></div><div class="modal-footer"><button type="button" class="btn btn-outline" data-close-modal>Cancel</button><button class="btn btn-primary">Create invoice</button></div></form>`;
    modal.querySelectorAll('.modal-close-btn,[data-close-modal]').forEach(b=>b.onclick=()=>modal.classList.remove('active'));
    modal.classList.add('active');window.SearchSelects?.refresh();modal.querySelector('button').focus();
    document.getElementById('invoiceCreateForm').onsubmit=e=>{e.preventDefault();if(!signedIn('admin'))return login('admin');const job=jobs.find(j=>j.ref===document.getElementById('invoiceMovement').value);if(!job)return;job.invoiceIssued=true;job.invoiceDate=today();store.save();selectedRef=job.ref;modal.classList.remove('active');render();window.showToast('Invoice created.');};
  }
  function bind(root){
    window.TablePager?.apply(root);
    root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{tab=b.dataset.go;render();});
    root.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>window.trackJobRef(b.dataset.track));
    root.querySelectorAll('[data-invoice]').forEach(b=>b.onclick=()=>window.HandoverReportEngine.openInvoiceModal(b.dataset.invoice));
    root.querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>window.PaymentUI.open(b.dataset.pay,()=>render()));
    root.querySelectorAll('[data-slip]').forEach(b=>b.onclick=()=>window.PaymentUI.slip(b.dataset.slip));
    root.querySelectorAll('[data-handover]').forEach(b=>b.onclick=()=>window.HandoverReportEngine.openHandoverModal(b.dataset.handover));
    if(tab==='overview')root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectedRef=b.dataset.select;tab=role==='admin'?'bookings':'movements';render();});
    root.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>exportJobs(filteredJobs()));
    root.querySelectorAll('[data-deliver]').forEach(b=>b.onclick=()=>{
      if(!signedIn('admin'))return login('admin');const job=jobsFor().find(j=>j.ref===b.dataset.deliver);if(!job||job.status!=='In Transit')return;
      if(!job.deliveryInspection)return window.showToast('The assigned driver must complete a signed delivery inspection first.');
      try{window.Operations.transition(job.ref,'Delivered');render();}catch(error){window.showToast(error.message);}
    });
    root.querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>{
      if(!signedIn('admin'))return login('admin');const job=jobsFor().find(j=>j.ref===b.dataset.paid);if(!job)return;window.PaymentUI.open(job.ref,()=>render());
    });
  }
  function render(){
    if(!signedIn(role))return login(role);window.SearchSelects?.close();maps.forEach(map=>map.remove());maps=[];
    if(composer.isConnected)legacy.dealer.append(composer);
    const view=document.getElementById('view-'+viewId(role));
    // Only one dashboard may own shared control IDs during in-page role navigation.
    document.querySelectorAll('.dashboard-layout').forEach(layout=>layout.remove());
    view.tabIndex=-1;document.querySelector('.skip-link')?.setAttribute('href','#'+view.id);
    const tabs=role==='admin'?['overview','bookings','dispatch','drivers','dealers','customers','billing','reports']:role==='dealer'?['overview','movements','handovers','billing','reports','account']:role==='driver'?['overview','inspections','history','earnings']:['overview','payments','history'];
    const layout=document.createElement('div');layout.className='dashboard-layout';
    const title=tab==='overview'?({admin:'Operations overview',dealer:'Dealership overview',driver:'Driver workspace',customer:'My bookings'})[role]:(names[tab]||({inspections:'Vehicle inspections',history:'Booking history',earnings:'Earnings',payments:'Payments & slips',customers:'Customers'})[tab]);
    layout.innerHTML=`<aside class="dash-sidebar"><a href="${base}" class="dash-brand"><img src="assets/movemycar-logo.png" alt="MoveMyCar Vehicle Logistics UAE"></a><span class="dash-sidebar-label">${({admin:'Operations',dealer:'Dealership',driver:'Driver',customer:'Customer'})[role]}</span><nav aria-label="Workspace navigation">${tabs.map(t=>`<button class="dash-nav-item ${tab===t?'is-current':''}" data-tab="${t}" ${tab===t?'aria-current="page"':''}><span aria-hidden="true">${icons[t]||({customers:'♙',inspections:'✓',history:'◷',earnings:'▤',payments:'▤'})[t]}</span>${names[t]||({customers:'Customers',inspections:'Inspections',history:'History',earnings:'Earnings',payments:'Payments'})[t]}</button>`).join('')}</nav><div class="dash-sidebar-bottom"><a href="${base}">↗ Back to website</a><button data-signout>⇥ Sign out</button><small>${account(role)}</small></div></aside><div class="dash-main"><header class="dash-page-header"><div><p class="dash-eyebrow">${role==='admin'?'MoveMyCar operations':role==='dealer'?accountName:role==='driver'?window.DRIVER_ROSTER.find(d=>d.id===window.Operations.driverId).name:window.CUSTOMERS[0].name}</p><h1>${title}</h1></div><div class="dash-header-actions"><select id="dashboardRange" aria-label="Reporting period"><option value="all">All dates</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option></select><button class="btn btn-primary" id="dashboardPrimary">${tab==='reports'?'↓ Export report':role==='admin'?(tab==='billing'?'+ Create invoice':'⇄ Open dispatch'):role==='driver'?'↓ Export history':'+ Book a move'}</button></div></header><div class="dash-content" id="dashboardContent"></div></div>`;
    view.append(layout);const period=document.getElementById('dashboardRange');period.value=range;period.onchange=()=>{range=period.value;render();};
    layout.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});layout.querySelector('[data-signout]').onclick=()=>{session=null;try{sessionStorage.removeItem('mmc-session');}catch{}login(role);};
    document.getElementById('dashboardPrimary').onclick=()=>{if(tab==='reports'||role==='driver')exportJobs(filteredJobs());else if(role==='admin'){if(tab==='billing')createInvoice();else{tab='dispatch';render();}}else{window.BookingContext='dealer';window.openBookingWizard();}};
    const root=document.getElementById('dashboardContent'),jobs=filteredJobs();
    if(['driver','customer'].includes(role))window.RoleViews.render(root,role,tab,jobs);else if(tab==='customers')renderCustomers(root);else if(tab==='overview')renderOverview(root,jobs);else if(tab==='movements'||tab==='bookings')renderMoves(root,jobs);else if(tab==='dispatch')renderDispatch(root,jobs);else if(tab==='drivers')renderDrivers(root);else if(tab==='dealers')renderDealers(root,jobs);else if(tab==='billing')renderBilling(root,jobs);else if(tab==='handovers')renderHandovers(root,jobs);else if(tab==='reports')renderReports(root,jobs);else renderAccount(root);
    // List/detail screens provide their own selection behavior.
    if(['admin','dealer'].includes(role)&&['overview','reports'].includes(tab))bind(root);
    window.SearchSelects?.refresh();
  }
  function exportJobs(jobs=filteredJobs(),name='movements'){
    if(!signedIn(role))return login(role);
    if(role==='driver'){jobs=jobs.filter(j=>j.status==='Delivered');name='driver-history';}
    const rows=[['Reference','Account','Vehicle','VIN','Collection','Delivery','Status','Driver','Total AED'],...jobs.map(j=>[j.ref,j.dealer,j.vehicle,j.vin,loc[j.from].name,loc[j.to].name,j.status,j.driver||'Unassigned',j.cost.toFixed(2)])];
    const csv=rows.map(row=>row.map(value=>'"'+String(value??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`movemycar-${name}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function show(r){role=r;if(!signedIn(r))return login(r);originalSwitch(viewId(r));document.body.classList.add('workspace-open');render();}
  function navigate(r,push=true){window.closeMobileDrawer();tab='overview';range='all';window.RoleViews.inspectionRef=null;if(push)history.pushState({role:r},'',panelURL(r));show(r);window.scrollTo(0,0);}
  window.switchView=view=>{
    window.SearchSelects?.close();
    if(['dealer','dispatch','admin','driver','customer'].includes(view))return navigate(view==='dispatch'?'admin':view);
    maps.forEach(m=>m.remove());maps=[];document.body.classList.remove('workspace-open');
    document.querySelector('.skip-link')?.setAttribute('href','#view-public');
    if(/\/(dealer-panel|admin-panel|driver-panel|customer-panel)(\/|$)/.test(location.pathname))history.pushState({},'',base);window.BookingContext=null;originalSwitch(view);
  };
  window.PanelApp={role:()=>role,currentRole:()=>document.body.classList.contains('workspace-open')&&signedIn(role)?role:null,exportJobs:()=>exportJobs(),refresh:()=>render(),isDealer:()=>role==='dealer'&&signedIn('dealer')&&document.body.classList.contains('workspace-open')};
  const submit=window.DealerPortal.submitBulkMove.bind(window.DealerPortal);window.DealerPortal.submitBulkMove=()=>{const before=window.INITIAL_JOBS.length;submit();if(window.INITIAL_JOBS.length>before)render();};
  document.querySelectorAll('[data-panel-link]').forEach(a=>{a.href=panelURL(a.dataset.panelLink);a.onclick=e=>{e.preventDefault();navigate(a.dataset.panelLink);};});
  document.querySelectorAll('[data-nav="dealer"],[data-nav="driver"],[data-nav="customer"]').forEach(a=>a.href=panelURL(a.dataset.nav));
  window.addEventListener('popstate',()=>{const r=location.pathname.match(/\/(admin|dealer|driver|customer)-panel(?:\/|$)/)?.[1]||null;if(r)show(r);else{document.body.classList.remove('workspace-open');originalSwitch('public');}});
  const requested=location.pathname.match(/\/(admin|dealer|driver|customer)-panel(?:\/|$)/)?.[1]||null;if(requested)navigate(requested,false);
  window.addEventListener('mmc:external-change',()=>{if(document.body.classList.contains('workspace-open')&&signedIn(role)&&!document.getElementById('inspectionForm'))render();});
  new MutationObserver(()=>{if(document.body.classList.contains('workspace-open')&&!document.querySelector('.modal-overlay.active')&&signedIn(role))render();}).observe(document.getElementById('bookingWizardModal'),{attributes:true,attributeFilter:['class']});
});
