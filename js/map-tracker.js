/* OpenStreetMap provides the basemap. Trip positions are simulated. */
class MapTracker {
  constructor(containerId = 'leafletLiveMap') { this.containerId = containerId; this.layers = []; }
  init() {
    if (this.map) return;
    const container = document.getElementById(this.containerId);
    this.status = document.createElement('p'); this.status.className = 'map-status'; this.status.setAttribute('role', 'status'); container.after(this.status);
    if (!window.L) {
      container.innerHTML = '<div class="map-fallback"><strong>Map could not load</strong><p>Check your connection to load the interactive map.</p><a class="btn btn-outline" href="https://www.openstreetmap.org/#map=8/24.8/55.2" target="_blank" rel="noopener">Open UAE map</a></div>';
      this.status.textContent = 'Map library unavailable. Trip details remain available.'; this.trackBooking('MMC-7821'); return;
    }
    this.map = L.map(container, { scrollWheelZoom: false }).setView([24.9, 55.1], 9);
    this.tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.map);
    this.tiles.on('tileerror', () => {this.status.textContent = 'Map tiles unavailable. Check your connection. The line shows an estimated route.';});
    this.tiles.on('load', () => {this.status.textContent = container.querySelector('.leaflet-tile-loaded') ? 'OpenStreetMap · Estimated route · Position estimates · Live GPS connection pending' : 'Map tiles unavailable. Check your connection. The line shows an estimated route.';});
    this.status.textContent = 'Loading map · Position estimates';
    new ResizeObserver(() => this.map.invalidateSize({pan:false})).observe(container);
    this.trackBooking('MMC-7821');
  }
  trackBooking(ref) {
    const job = window.INITIAL_JOBS.find(j=>j.ref === ref);
    if(!job){window.showToast?.('No booking found. Try MMC-7821 or a reference from your dashboard.');return;}
    clearInterval(this.timer);
    const from=window.UAE_LOCATIONS[job.from], to=window.UAE_LOCATIONS[job.to];
    this.googleLinks?.remove();
    const initialPosition=job.status==='Delivered'?to.coords:job.status==='In Transit'?from.coords.map((n,axis)=>n+(to.coords[axis]-n)*0.3):from.coords;
    this.googleLinks=window.GoogleMapsLinks?.attach(document.getElementById(this.containerId),job,{position:initialPosition,allowEmbed:true});
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
    document.getElementById('inputTrackRef').value=ref;
    set('liveCarName',job.vehicle);set('liveRouteDisplay',`${from.name} → ${to.name}`);
    set('liveSpeedDisplay',job.status==='In Transit'?`${job.speed || 82} km/h`:'0 km/h');
    set('liveEtaDisplay',job.status==='Delivered'?'Delivered · Trip':job.driver?`${job.eta} · Simulated`:'Awaiting driver assignment');
    const active=job.status==='Delivered'?5:job.status==='In Transit'?3:job.status==='Picked Up'?2:job.status==='Assigned'?1:0;
    document.querySelectorAll('.tracking-timeline .timeline-step').forEach((step,i)=>{step.classList.toggle('completed',i<active);step.classList.toggle('active',i===active);});
    const descriptions=document.querySelectorAll('.timeline-content p');descriptions[1].textContent=job.driver || 'Awaiting assignment';descriptions[2].textContent=job.collectionInspection?'Collection inspection recorded':'Collection inspection pending';if(job.status==='Cancelled')set('liveEtaDisplay','Booking cancelled');
    if(!this.map)return;
    this.layers.forEach(layer=>this.map.removeLayer(layer));this.layers=[];
    const points=Array.from({length:81},(_,i)=>from.coords.map((n,axis)=>n+(to.coords[axis]-n)*i/80));
    const line=L.polyline(points,{color:'#4f46e5',weight:4,dashArray:'8 8'}).addTo(this.map);this.layers.push(line);
    for(const [coords,label,color] of [[from.coords,from.name,'#059669'],[to.coords,to.name,'#4f46e5']])this.layers.push(L.circleMarker(coords,{radius:8,color:'#fff',fillColor:color,fillOpacity:1,weight:3}).addTo(this.map).bindTooltip(label));
    let index=job.status==='Delivered'?80:job.status==='In Transit'?24:0;
    const marker=L.circleMarker(points[index],{radius:11,color:'#fff',fillColor:'#4f46e5',fillOpacity:1,weight:3}).addTo(this.map).bindTooltip('Vehicle');this.layers.push(marker);
    this.map.invalidateSize();this.map.fitBounds(line.getBounds(),{padding:[30,30],maxZoom:12});
    if(job.status==='In Transit' && !matchMedia('(prefers-reduced-motion: reduce)').matches)this.timer=setInterval(()=>{
      if(document.hidden || !document.getElementById('view-public').classList.contains('active'))return;
      index=Math.min(80,index+1);marker.setLatLng(points[index]);this.googleLinks?.update(points[index]);
      set('liveEtaDisplay',index===80?'Vehicle arrived':`${Math.max(1,Math.round((80-index)/80*job.km/1.2))} min · Simulated`);
      if(index===80){clearInterval(this.timer);set('liveSpeedDisplay','0 km/h');}
    },3000);
  }
}
window.MapTracker=MapTracker;
