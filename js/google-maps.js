/* Official Google Maps URLs require no API key or billing. Embed requires your own key. */
(()=>{
 const coords=value=>value.map(n=>Number(n).toFixed(6)).join(',');
 const routeURL=job=>'https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',origin:coords(window.UAE_LOCATIONS[job.from].coords),destination:coords(window.UAE_LOCATIONS[job.to].coords),travelmode:'driving'});
 const positionURL=position=>'https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query:coords(position)});
 function attach(node,job,{position,allowEmbed=false}={}){
  if(!node||!job)return null;
  const toolbar=document.createElement('div');toolbar.className='google-map-actions';
  const directions=document.createElement('a');directions.href=routeURL(job);directions.target='_blank';directions.rel='noopener noreferrer';directions.className='google-map-link';directions.textContent='↗ Route in Google Maps';toolbar.append(directions);
  const pin=document.createElement('a');pin.href=positionURL(position||window.UAE_LOCATIONS[job.from].coords);pin.target='_blank';pin.rel='noopener noreferrer';pin.className='google-map-link';pin.textContent='↗ Vehicle position';toolbar.append(pin);
  node.after(toolbar);
  const key=window.MoveMyCarMaps?.googleEmbedApiKey?.trim();let frame=null,button=null;
  if(allowEmbed&&key){
   button=document.createElement('button');button.type='button';button.className='google-map-link';button.textContent='Google map preview';button.setAttribute('aria-expanded','false');toolbar.append(button);
   button.onclick=()=>{
    if(!frame){frame=document.createElement('iframe');frame.className='google-map-frame';frame.title='Google Maps route from '+window.UAE_LOCATIONS[job.from].name+' to '+window.UAE_LOCATIONS[job.to].name;frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
     frame.src='https://www.google.com/maps/embed/v1/directions?'+new URLSearchParams({key,origin:coords(window.UAE_LOCATIONS[job.from].coords),destination:coords(window.UAE_LOCATIONS[job.to].coords),mode:'driving'});toolbar.after(frame);
    }else frame.hidden=!frame.hidden;
    button.setAttribute('aria-expanded',String(!frame.hidden));
   };
  }
  return {update(position){pin.href=positionURL(position);},remove(){toolbar.remove();frame?.remove();}};
 }
 window.GoogleMapsLinks={routeURL,positionURL,attach};
})();
