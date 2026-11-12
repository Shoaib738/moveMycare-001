/* Deterministic presentation data and frontend-only business rules. No network writes. */
(()=>{
 const store=window.DemoStore,loc=window.UAE_LOCATIONS;
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const day=offset=>new Date(Date.parse(today())+offset*86400000).toISOString().slice(0,10);
 const active=['Assigned','Picked Up','In Transit'],statuses=['Unassigned',...active,'Delivered','Cancelled'];
 const dealerNames=['Al Nabooda Automobiles','Gargash Motors (Mercedes-Benz)','AGMC BMW Dubai','Al Tayer Motors (Range Rover)','Creekside Auto Trading','Yas Vehicle Centre','Marina Motor Gallery','Northern Emirates Cars','Horizon Auto Exchange','Mussafah Fleet Services'];
 const dealers=dealerNames.map((name,i)=>({id:'DLR-'+(101+i),name,area:Object.values(loc)[i%Object.keys(loc).length].name,contact:['Fatima','Khalid','Mariam','Ahmed','Sara','Nasser','Layla','Hassan','Noor','Yousef'][i]+' · Fleet desk'}));
 const customers=['Aisha Al Mansoori','Daniel Roberts','Sara Malik','Khalid Hassan','Priya Menon','Noor Ibrahim','James Wilson','Mariam Ali','Hassan Farooq','Layla Ahmed'].map((name,i)=>({id:'CUS-'+(101+i),name,email:'customer'+(i+1)+'@example.test',phone:'+971 50 000 '+String(1000+i),area:Object.values(loc)[i].name}));
 const originalDrivers=window.DRIVER_ROSTER.slice(0,4).map(d=>({...d,status:'Available'}));
 const moreDrivers=['Hamid Ali','Faisal Noor','Reem Aziz','Bilal Khan','Arjun Nair','Ahmed Saleh'].map((name,i)=>({id:'DRV-'+(105+i),name,rating:Number((4.86+i*.02).toFixed(2)),trips:420+i*137,emiratesId:'784-****-*******-*',carExp:i%2?'Sedans & dealership deliveries':'SUV & fleet movements',avatar:'assets/images/photo-'+(13+i%3)+'.jpg',status:i===5?'Offline':'Available',distKm:Number((1.5+i*.7).toFixed(1))}));
 let drivers=[...originalDrivers,...moreDrivers];
 const vehicles=['Toyota Camry','Nissan Patrol','BMW 320i','Mercedes-Benz E-Class','Range Rover Sport','Porsche Cayenne','Audi Q7','Lexus ES 350','Kia Sportage','Toyota Land Cruiser'];
 const keys=Object.keys(loc),seeds=[];
 for(let i=0;i<60;i++){
  const corporate=i<40,di=i<12?0:1+(i-12)%9,ci=(i-40+20)%10,from=({0:'alquoz',12:'downtown',4:'dip',5:'shj'})[i]||keys[i%keys.length],to=({0:'yas',12:'auh',4:'shj',5:'downtown'})[i]||(keys[(i*3+5)%keys.length]===from?keys[(i+1)%keys.length]:keys[(i*3+5)%keys.length]);
  const status=i<4?['In Transit','Assigned','Picked Up','Assigned'][i]:i<8?'Unassigned':i===37||i===58?'Cancelled':'Delivered';
  const vehicleType=i%3===0?'suv':'sedan',quote=window.PricingEngine.computeQuote({from,to,vehicleType,isDealer:corporate});
  const date=status==='Delivered'||status==='Cancelled'?day(-(i%27)):day(i<4?0:1+i%3),driver=status==='Unassigned'||status==='Cancelled'?null:drivers[(i<4?[0,1,3,4][i]:i)%drivers.length];
  const bookedDate=status==='Delivered'||status==='Cancelled'?day(-(i%27)-1):day(-(i%7));
  const ref=i===0?'MMC-7821':i===12?'MMC-6490':i===4?'MMC-9012':i===5?'MMC-3341':'MMC-'+(10500+i);
  const job={ref,dealer:corporate?dealers[di].name:customers[ci].name,dealerId:corporate?dealers[di].id:null,customerId:corporate?null:customers[ci].id,vehicle:i===0?'Rolls-Royce Ghost Extended':vehicles[i%vehicles.length],vehicleType,vin:'WBA'+String(83000000000000+i),plate:'Dubai '+String.fromCharCode(65+i%20)+' '+(12000+i),from,to,driver:driver?.name||null,driverId:driver?.id||null,status,speed:status==='In Transit'?84:0,eta:status==='Delivered'?'Completed':status==='Unassigned'?'Awaiting dispatch':quote.duration,date,createdAt:day(-(i%7))+'T08:00:00+04:00',time:'10:'+String((i%4)*15).padStart(2,'0'),cost:quote.total,quote,km:quote.distanceKm,invoiceIssued:status==='Delivered',invoiceDate:status==='Delivered'?date:null,paymentStatus:status==='Delivered'&&i%3!==0?'Paid':'Unpaid',collectionAddress:loc[from].name,deliveryAddress:loc[to].name,contact:corporate?'+971 50 000 9000':customers[ci].phone,priority:i%6===0?'Urgent Client Delivery':'Standard Dispatch'};
  job.createdAt=bookedDate+'T08:00:00+04:00';job.time='09:00';
  if(status==='Picked Up'||status==='In Transit'||status==='Delivered')job.collectionInspection={checks:Array(8).fill(true),odometer:14000+i*240,fuel:'3/4',signer:'Collection representative',signature:'Example signature',recordedAt:date+'T09:00:00+04:00',referencePhotos:true};
  if(status==='Delivered')job.deliveryInspection={...job.collectionInspection,odometer:job.collectionInspection.odometer+job.km,signer:corporate?'Receiving representative':customers[ci].name,recordedAt:new Date(Date.parse(job.collectionInspection.recordedAt)+(Math.round(job.km/82*60)+12)*60000).toISOString()};
  if(i===40)job.paymentStatus='Unpaid';
  if(job.paymentStatus==='Paid')job.payment={ref:'PAY-'+ref.slice(4),amount:job.cost,method:'Bank transfer preview',date:new Date(Date.parse(job.deliveryInspection.recordedAt)+1800000).toISOString(),demo:true};
  seeds.push(job);
 }
 const legacy=window.INITIAL_JOBS.filter(j=>!seeds.some(seed=>seed.ref===j.ref));
 const saved=store.read('mmc-presentation-v2',null);
 const validJob=j=>j&&typeof j.ref==='string'&&statuses.includes(j.status)&&loc[j.from]&&loc[j.to]&&j.from!==j.to&&typeof j.vehicle==='string'&&Number.isFinite(j.cost)&&j.cost>=0;
 let jobs=saved?.version===2&&Array.isArray(saved.jobs)&&saved.jobs.every(validJob)?saved.jobs:[...legacy.filter(validJob).map(j=>({...j,customerId:j.dealer==='Private Client'?'CUS-101':j.customerId,createdAt:j.createdAt||new Date().toISOString()})),...seeds];
 if(Array.isArray(saved?.drivers)&&saved.drivers.length===10&&saved.drivers.every(d=>drivers.some(seed=>seed.id===d.id)&&typeof d.name==='string'))drivers=saved.drivers;
 window.INITIAL_JOBS=jobs;window.DRIVER_ROSTER=drivers;window.DEALERS=dealers;window.CUSTOMERS=customers;
 if(store.read('mmc-driver-applications',null)===null)store.write('mmc-driver-applications',[{name:'Tariq Mahmood',mobile:'+971 50 000 2021',area:'Dubai',submittedAt:day(-1)+'T10:00:00+04:00'},{name:'Sana Qureshi',mobile:'+971 50 000 2022',area:'Abu Dhabi',submittedAt:day(-2)+'T12:00:00+04:00'}]);
 const Ops={
  statuses,active,today,dealers,customers,driverId:'DRV-102',customerId:'CUS-101',
  get(ref){return window.INITIAL_JOBS.find(j=>j.ref===ref);},
  scoped(role){return window.INITIAL_JOBS.filter(j=>role==='admin'||role==='dealer'&&j.dealer===dealers[0].name||role==='driver'&&(j.driverId===this.driverId||j.driver===window.DRIVER_ROSTER.find(d=>d.id===this.driverId)?.name)||role==='customer'&&j.customerId===this.customerId);},
  reconcile(){for(const d of window.DRIVER_ROSTER)if(d.status!=='Offline')d.status=window.INITIAL_JOBS.some(j=>(j.driverId===d.id||j.driver===d.name)&&active.includes(j.status))?'On Trip':'Available';},
  save(){this.reconcile();store.write('mmc-presentation-v2',{version:2,jobs:window.INITIAL_JOBS,drivers:window.DRIVER_ROSTER});window.dispatchEvent(new CustomEvent('mmc:changed'));},
  assign(ref,driverId){const j=this.get(ref),d=window.DRIVER_ROSTER.find(d=>d.id===driverId);if(!j||j.status!=='Unassigned')throw Error('Only unassigned movements can be allocated.');this.reconcile();if(!d||d.status!=='Available')throw Error('Choose an available driver.');Object.assign(j,{driverId:d.id,driver:d.name,status:'Assigned',speed:0,eta:'Awaiting pickup'});this.save();},
  transition(ref,next){const j=this.get(ref),transitions={Unassigned:['Cancelled'],Assigned:['Picked Up','Cancelled'],'Picked Up':['In Transit'],'In Transit':['Delivered']};if(!j||!transitions[j.status]?.includes(next))throw Error('This status change is not available.');if(next==='Picked Up'&&!j.collectionInspection)throw Error('Complete the collection inspection and signature first.');if(next==='Delivered'&&!j.deliveryInspection)throw Error('Complete the delivery inspection and signature first.');j.status=next;j.speed=next==='In Transit'?82:0;j.eta=next==='Delivered'?'Completed':next==='In Transit'?window.PricingEngine.estimateDuration(j.km):'Ready to depart';if(next==='Delivered'){j.invoiceIssued=true;j.invoiceDate=this.today();}this.save();},
  inspect(ref,phase,data){const j=this.get(ref);if(!j||!(phase==='collection'&&j.status==='Assigned'||phase==='delivery'&&j.status==='In Transit'))throw Error('Inspection is not available at this stage.');if(data.checks?.length!==8||!data.checks.every(Boolean)||!data.signer?.trim()||!data.signature||!Number.isFinite(data.odometer)||data.odometer<0)throw Error('Complete all eight checks, mileage, and a signature.');if(phase==='delivery'&&data.odometer<j.collectionInspection.odometer)throw Error('Delivery mileage cannot be lower than collection mileage.');j[phase+'Inspection']={...data,signer:data.signer.trim(),recordedAt:new Date().toISOString()};this.transition(ref,phase==='collection'?'Picked Up':'Delivered');},
  pay(ref,method='Card preview'){const j=this.get(ref);if(!j||j.status==='Cancelled')throw Error('This movement cannot be paid.');if(j.paymentStatus==='Paid')return j.payment;j.invoiceIssued=true;j.invoiceDate||=this.today();j.paymentStatus='Paid';j.payment={ref:'PAY-'+j.ref.slice(4),amount:j.cost,method,date:new Date().toISOString(),demo:true};this.save();return j.payment;},
  cancel(ref){const j=this.get(ref);if(j?.paymentStatus==='Paid')throw Error('Paid movements need operations review before cancellation.');this.transition(ref,'Cancelled');},
  add(job){if(!validJob(job))throw Error('Check movement details and price.');if(this.get(job.ref))throw Error('Movement reference already exists.');window.INITIAL_JOBS.unshift(job);this.save();},
  money(n){return 'AED '+Number(n||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});},
  download(name,rows){const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 };
 window.Operations=Ops;window.DemoStore.save=()=>Ops.save();Ops.reconcile();
 // Keep the existing storage intact; a separate versioned store holds the presentation dataset.
 store.write('mmc-presentation-v2',{version:2,jobs:window.INITIAL_JOBS,drivers:window.DRIVER_ROSTER});
 window.addEventListener?.('storage',event=>{if(event.key!=='mmc-presentation-v2'||!event.newValue)return;try{const data=JSON.parse(event.newValue);if(data.version===2&&Array.isArray(data.jobs)&&data.jobs.every(validJob)&&Array.isArray(data.drivers)&&data.drivers.length===10){window.INITIAL_JOBS=data.jobs;window.DRIVER_ROSTER=data.drivers;Ops.reconcile();window.dispatchEvent(new CustomEvent('mmc:external-change'));}}catch{}});
})();
