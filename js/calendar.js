/* Shared date picker: retain native ISO values and constraints; render a branded calendar. */
(()=>{
 const instances=new Map();let opened=null,sequence=0;
 const nativeValue=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 const parse=iso=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d,12);};
 const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const today=()=>window.BookingUI?.today()||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const addDays=(date,n)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+n,12);
 class DatePicker{
  constructor(input){
   this.input=input;input.id||='date-field-'+ ++sequence;
   this.wrapper=document.createElement('div');this.wrapper.className='date-picker';input.before(this.wrapper);this.wrapper.append(input);
   this.button=document.createElement('button');this.button.type='button';this.button.id=input.id+'-trigger';this.button.className='date-trigger';this.button.setAttribute('aria-haspopup','dialog');this.button.setAttribute('aria-expanded','false');this.wrapper.append(this.button);
   input.hidden=true;input.tabIndex=-1;input.setAttribute('aria-hidden','true');input.style.setProperty('display','none','important');
   Object.defineProperty(input,'value',{configurable:true,get:()=>nativeValue.get.call(input),set:value=>{nativeValue.set.call(input,value);this.sync();}});
   this.button.onclick=()=>opened===this?this.close():this.open();this.button.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();this.open();}};
   input.addEventListener('input',()=>this.sync());input.addEventListener('change',()=>this.sync());input.addEventListener('invalid',e=>{e.preventDefault();this.button.setAttribute('aria-invalid','true');this.open();});
   this.observer=new MutationObserver(()=>{this.sync();if(opened===this)this.render();});this.observer.observe(input,{attributes:true,attributeFilter:['min','max','disabled','required','value']});
   input.form?.addEventListener('reset',()=>setTimeout(()=>this.sync()));this.sync();
  }
  label(){return [...this.input.labels].map(l=>l.textContent.trim()).join(' ')||this.input.getAttribute('aria-label')||'Select date';}
  allowed(value){return (!this.input.min||value>=this.input.min)&&(!this.input.max||value<=this.input.max);}
  clamp(date){const value=iso(date);return value<this.input.min?parse(this.input.min):this.input.max&&value>this.input.max?parse(this.input.max):date;}
  sync(){
   const date=parse(this.input.value),text=date?date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Choose a date';
   this.button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/></svg><span></span><span class="date-chevron" aria-hidden="true">⌄</span>';
   this.button.querySelector('span').textContent=text;this.button.disabled=this.input.disabled;this.button.setAttribute('aria-label',this.label()+': '+text+(this.input.required?' (required)':''));if(this.input.validity.valid)this.button.removeAttribute('aria-invalid');
  }
  open(){
   if(opened===this||this.input.disabled)return;opened?.close(false);window.SearchSelects?.close();opened=this;
   this.focusDate=this.clamp(parse(this.input.value)||parse(today()));this.month=new Date(this.focusDate.getFullYear(),this.focusDate.getMonth(),1,12);
   this.popup=document.createElement('div');this.popup.className='calendar-popup';this.popup.id=this.input.id+'-calendar';this.popup.setAttribute('role','dialog');this.popup.setAttribute('aria-label',this.label());this.popup.setAttribute('aria-modal','false');
   (this.input.closest('.modal-overlay')||document.body).append(this.popup);this.button.setAttribute('aria-expanded','true');this.button.setAttribute('aria-controls',this.popup.id);
   this.popup.onkeydown=e=>this.keyboard(e);this.render();this.place();this.focusDay();
  }
  monthAllowed(offset){const y=this.month.getFullYear(),m=this.month.getMonth()+offset;const first=iso(new Date(y,m,1,12)),last=iso(new Date(y,m+1,0,12));return (!this.input.min||last>=this.input.min)&&(!this.input.max||first<=this.input.max);}
  changeMonth(offset){if(!this.monthAllowed(offset))return;this.month=new Date(this.month.getFullYear(),this.month.getMonth()+offset,1,12);const day=Math.min(this.focusDate.getDate(),new Date(this.month.getFullYear(),this.month.getMonth()+1,0,12).getDate());this.focusDate=this.clamp(new Date(this.month.getFullYear(),this.month.getMonth(),day,12));this.render();this.place();this.focusDay();}
  render(){
   if(!this.popup)return;const monthTitle=this.month.toLocaleDateString('en-GB',{month:'long',year:'numeric'}),selected=this.input.value,todayISO=today();
   this.popup.innerHTML='<p class="calendar-eyebrow"></p><div class="calendar-heading"><button type="button" class="calendar-nav" data-prev aria-label="Previous month">‹</button><h4 aria-live="polite"></h4><button type="button" class="calendar-nav" data-next aria-label="Next month">›</button></div><div class="calendar-weekdays" aria-hidden="true">'+['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="calendar-grid" role="grid"></div><div class="calendar-shortcuts"><button type="button" data-today>Today</button><button type="button" data-tomorrow>Tomorrow</button></div><div class="calendar-footer"><p></p><button type="button" class="calendar-close">Done</button></div>';
   this.popup.querySelector('.calendar-eyebrow').textContent=this.label();this.popup.querySelector('h4').textContent=monthTitle;this.popup.querySelector('.calendar-grid').setAttribute('aria-label',monthTitle);
   const prev=this.popup.querySelector('[data-prev]'),next=this.popup.querySelector('[data-next]');prev.disabled=!this.monthAllowed(-1);next.disabled=!this.monthAllowed(1);prev.onclick=()=>this.changeMonth(-1);next.onclick=()=>this.changeMonth(1);
   const first=addDays(this.month,-((this.month.getDay()+6)%7)),grid=this.popup.querySelector('.calendar-grid');
   for(let week=0;week<6;week++){
    const row=document.createElement('div');row.setAttribute('role','row');row.style.display='contents';grid.append(row);
    for(let col=0;col<7;col++){
     const date=addDays(first,week*7+col),value=iso(date),button=document.createElement('button');button.type='button';button.className='calendar-day';button.dataset.date=value;button.textContent=date.getDate();button.disabled=!this.allowed(value);button.tabIndex=value===iso(this.focusDate)?0:-1;
     button.setAttribute('role','gridcell');button.setAttribute('aria-label',date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));button.setAttribute('aria-selected',String(value===selected));if(value===todayISO){button.classList.add('is-today');button.setAttribute('aria-current','date');}if(date.getMonth()!==this.month.getMonth())button.classList.add('is-outside');button.onclick=()=>this.choose(value);row.append(button);
    }
   }
   const tomorrow=iso(addDays(parse(todayISO),1));this.popup.querySelector('[data-today]').disabled=!this.allowed(todayISO);this.popup.querySelector('[data-today]').onclick=()=>this.choose(todayISO);this.popup.querySelector('[data-tomorrow]').disabled=!this.allowed(tomorrow);this.popup.querySelector('[data-tomorrow]').onclick=()=>this.choose(tomorrow);
   this.popup.querySelector('.calendar-footer p').textContent=this.input.min?'Available from '+parse(this.input.min).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'Choose your preferred date';this.popup.querySelector('.calendar-close').onclick=()=>this.close();
  }
  focusDay(){this.popup?.querySelector(`[data-date="${iso(this.focusDate)}"]:not(:disabled)`)?.focus({preventScroll:true});}
  keyboard(e){
   if(e.key==='Tab'){const controls=[...this.popup.querySelectorAll('button:not(:disabled)')].filter(b=>b.tabIndex!==-1),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}e.stopPropagation();return;}
   if(!e.target.matches('.calendar-day'))return;
   const steps={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
   if(e.key in steps||['Home','End','PageUp','PageDown'].includes(e.key)){
    e.preventDefault();e.stopPropagation();if(e.key==='PageUp'||e.key==='PageDown'){this.changeMonth((e.key==='PageUp'?-1:1)*(e.shiftKey?12:1));return;}
    const current=parse(e.target.dataset.date),weekday=(current.getDay()+6)%7;this.focusDate=this.clamp(addDays(current,e.key==='Home'?-weekday:e.key==='End'?6-weekday:steps[e.key]));this.month=new Date(this.focusDate.getFullYear(),this.focusDate.getMonth(),1,12);this.render();this.place();this.focusDay();
   }
  }
  choose(value){if(!this.allowed(value))return;this.input.value=value;this.input.dispatchEvent(new Event('input',{bubbles:true}));this.input.dispatchEvent(new Event('change',{bubbles:true}));this.close();}
  place(){
   if(!this.popup)return;const rect=this.button.getBoundingClientRect(),viewport=window.visualViewport,w=viewport?.width||innerWidth,h=viewport?.height||innerHeight,x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
   this.popup.style.width=Math.min(280,w-24)+'px';this.popup.style.maxHeight=h-24+'px';const ph=this.popup.offsetHeight,pw=this.popup.offsetWidth,below=y+h-rect.bottom-12;
   this.popup.style.left=Math.max(x+12,Math.min(rect.left,x+w-pw-12))+'px';this.popup.style.top=Math.max(y+12,Math.min(below>=ph?rect.bottom+8:rect.top-ph-8,y+h-ph-12))+'px';
  }
  close(focus=true){if(!this.popup)return;this.popup.remove();this.popup=null;this.button.setAttribute('aria-expanded','false');if(opened===this)opened=null;if(focus&&this.button.isConnected)this.button.focus({preventScroll:true});}
 }
 function enhance(){for(const [input,instance]of instances)if(!input.isConnected){instance.close(false);instance.observer.disconnect();instances.delete(input);}document.querySelectorAll('input[type=date]').forEach(input=>{if(!instances.has(input))instances.set(input,new DatePicker(input));});}
 function boot(){enhance();new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});}
 document.addEventListener('pointerdown',e=>{if(opened&&!opened.popup.contains(e.target)&&!opened.wrapper.contains(e.target))opened.close(false);},true);
 document.addEventListener('click',e=>{const control=e.target.closest?.('label')?.control;if(control?.matches('input[type=date]')&&!control.disabled){e.preventDefault();enhance();instances.get(control)?.open();}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.preventDefault();e.stopImmediatePropagation();opened.close();}},true);
 document.addEventListener('scroll',e=>{if(opened&&!opened.popup.contains(e.target))opened.place();},true);window.addEventListener('resize',()=>opened?.place());window.visualViewport?.addEventListener('resize',()=>opened?.place());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.DatePickers={refresh:()=>{enhance();instances.forEach(i=>i.sync());},close:()=>opened?.close(false)};
})();
