/* Accessible, searchable select enhancement. Native selects retain form values and validation. */
(() => {
  const instances = new Map();
  let opened = null, sequence = 0;
  const nativeValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  class SearchSelect {
    constructor(select) {
      this.select = select;
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'select-combobox';
      select.before(this.wrapper); this.wrapper.append(select);
      select.classList.add('native-select-source'); select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
      this.button = document.createElement('button'); this.button.type = 'button'; this.button.className = 'select-trigger';
      this.button.id = (select.id || 'select-' + ++sequence) + '-trigger';
      this.button.setAttribute('role', 'combobox'); this.button.setAttribute('aria-haspopup', 'listbox'); this.button.setAttribute('aria-expanded', 'false');
      this.wrapper.append(this.button);
      // A label click can activate a clipped native select on some browsers.
      // Keep it in the form model, but fully remove its native picker surface.
      select.hidden = true;
      select.style.setProperty('display', 'none', 'important');
      // Existing scripts can continue to assign select.value without stale labels.
      Object.defineProperty(select, 'value', { configurable: true, get: () => nativeValue.get.call(select), set: value => {nativeValue.set.call(select, value); this.sync();} });
      this.onChange = () => this.sync(); select.addEventListener('change', this.onChange);
      select.addEventListener('invalid', e => {e.preventDefault();this.button.focus();this.button.setAttribute('aria-invalid','true');this.open();});
      this.button.addEventListener('click', () => opened === this ? this.close() : this.open());
      this.button.addEventListener('keydown', e => {
        if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {e.preventDefault();this.open();if(e.key==='End')this.activate(this.items.length-1);}
      });
      this.observer = new MutationObserver(() => {this.sync(); if(opened===this)this.render();});
      this.observer.observe(select, {childList:true,subtree:true,attributes:true,attributeFilter:['disabled','label','selected','required']});
      select.form?.addEventListener('reset', () => setTimeout(() => this.sync())); this.sync();
    }
    label() {
      return [...(this.select.labels || [])].map(l=>l.textContent.trim()).join(' ') || this.select.getAttribute('aria-label') || this.select.title || 'Select an option';
    }
    sync() {
      const option=this.select.selectedOptions[0];
      this.button.replaceChildren();const label=document.createElement('span');label.textContent=option?.textContent.trim() || 'Choose an option';
      const arrow=document.createElement('span');arrow.className='select-chevron';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');this.button.append(label,arrow);
      this.button.disabled=this.select.disabled;this.button.title=label.textContent;
      this.button.setAttribute('aria-label', this.label()+': '+label.textContent);this.button.setAttribute('aria-required',String(this.select.required));
      if(this.select.validity.valid)this.button.removeAttribute('aria-invalid');
      if(opened===this)this.render();
    }
    open() {
      if(this.select.disabled || opened===this)return;
      opened?.close(false);opened=this;
      this.popup=document.createElement('div');this.popup.className='select-popup';this.popup.id=this.button.id+'-popup';
      this.search=document.createElement('input');this.search.type='search';this.search.className='select-search';this.search.placeholder='Search '+this.label().toLowerCase()+'…';
      this.search.setAttribute('aria-label','Search '+this.label());this.search.setAttribute('role','combobox');this.search.setAttribute('aria-expanded','true');this.search.setAttribute('aria-autocomplete','list');
      this.list=document.createElement('div');this.list.className='select-options';this.list.id=this.button.id+'-list';this.list.setAttribute('role','listbox');this.list.setAttribute('aria-label',this.label());
      this.search.setAttribute('aria-controls',this.list.id);this.button.setAttribute('aria-controls',this.list.id);
      this.popup.append(this.search,this.list);(this.select.closest('.modal-overlay') || document.body).append(this.popup);
      this.button.setAttribute('aria-expanded','true');this.search.oninput=()=>{this.render();this.activate(0);};
      this.search.onkeydown=e=>{
        if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close();}
        else if(e.key==='Tab'){
          e.preventDefault();
          const scope=this.select.closest('.modal-overlay')||document;
          const controls=[...scope.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]')].filter(el=>el.getClientRects().length&&!this.popup.contains(el));
          const index=controls.indexOf(this.button),next=controls[index+(e.shiftKey?-1:1)]||controls[e.shiftKey?controls.length-1:0];this.close(false);next?.focus();
        }
        else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
          e.preventDefault();this.activate(e.key==='Home'?0:e.key==='End'?this.items.length-1:this.active+(e.key==='ArrowDown'?1:-1));
        }else if(e.key==='Enter'){e.preventDefault();if(this.items[this.active])this.choose(this.items[this.active].option);}
      };
      this.render();this.place();this.search.focus({preventScroll:true});
      const selected=this.items.findIndex(item=>item.option.selected);this.activate(selected<0?0:selected);
    }
    render() {
      if(!this.popup)return;
      this.list.replaceChildren();this.items=[];let previousGroup=null;
      const query=this.search.value.trim().toLocaleLowerCase();
      for(const option of this.select.options){
        const parent=option.parentElement,group=parent.tagName==='OPTGROUP'?parent.label:'';
        if(!`${group} ${option.textContent}`.toLocaleLowerCase().includes(query))continue;
        if(group && group!==previousGroup){const heading=document.createElement('div');heading.className='select-group';heading.textContent=group;heading.setAttribute('role','presentation');this.list.append(heading);previousGroup=group;}
        const row=document.createElement('div');row.className='select-option';row.id=this.list.id+'-option-'+option.index;
        const disabled=option.disabled || (parent.tagName==='OPTGROUP'&&parent.disabled);
        row.setAttribute('role','option');row.setAttribute('aria-selected',String(option.selected));row.setAttribute('aria-disabled',String(disabled));
        const text=document.createElement('span');text.textContent=option.textContent.trim();const check=document.createElement('span');check.textContent=option.selected?'✓':'';check.setAttribute('aria-hidden','true');row.append(text,check);
        this.list.append(row);
        if(!disabled){const index=this.items.length;this.items.push({option,row});row.onpointermove=()=>this.activate(index,false);row.onpointerdown=e=>e.preventDefault();row.onclick=()=>this.choose(option);}
      }
      if(!this.list.children.length){const empty=document.createElement('p');empty.className='select-empty';empty.setAttribute('role','status');empty.textContent='No matching options';this.list.append(empty);}
      this.active=Math.min(this.active??0,this.items.length-1);this.activate(this.active,false);if(this.popup.isConnected)this.place();
    }
    activate(index,scroll=true){
      this.active=this.items.length?Math.max(0,Math.min(index,this.items.length-1)):-1;
      this.items.forEach(({row},i)=>row.classList.toggle('is-active',i===this.active));
      const current=this.items[this.active];if(current){this.search.setAttribute('aria-activedescendant',current.row.id);if(scroll)current.row.scrollIntoView({block:'nearest'});}else this.search.removeAttribute('aria-activedescendant');
    }
    choose(option){
      this.select.value=option.value;this.select.dispatchEvent(new Event('input',{bubbles:true}));this.select.dispatchEvent(new Event('change',{bubbles:true}));this.close();
    }
    place(){
      if(!this.popup)return;const rect=this.button.getBoundingClientRect(),viewport=window.visualViewport;
      const height=viewport?.height || innerHeight,top=viewport?.offsetTop || 0,width=viewport?.width || innerWidth,left=viewport?.offsetLeft || 0;
      const below=height+top-rect.bottom-12,above=rect.top-top-12,up=below<220&&above>below;
      const max=Math.min(350,Math.max(120,up?above:below));this.popup.style.width=Math.min(Math.max(rect.width,260),width-24)+'px';
      this.popup.style.maxHeight=max+'px';this.list.style.maxHeight=Math.max(60,max-64)+'px';
      this.popup.style.left=Math.max(left+12,Math.min(rect.left,left+width-this.popup.offsetWidth-12))+'px';
      this.popup.style.top=(up?Math.max(top+8,rect.top-this.popup.offsetHeight-6):rect.bottom+6)+'px';
    }
    close(focus=true){if(!this.popup)return;this.popup.remove();this.popup=null;this.button.setAttribute('aria-expanded','false');if(opened===this)opened=null;if(focus&&this.button.isConnected)this.button.focus({preventScroll:true});}
  }
  function enhance(){
    for(const [select,instance] of instances)if(!select.isConnected){instance.close(false);instance.observer.disconnect();instances.delete(select);}
    document.querySelectorAll('select:not([multiple])').forEach(select=>{if(!instances.has(select))instances.set(select,new SearchSelect(select));});
  }
  document.addEventListener('pointerdown',e=>{if(opened&&!opened.popup?.contains(e.target)&&!opened.wrapper.contains(e.target))opened.close(false);},true);
  document.addEventListener('scroll',e=>{if(opened&&!opened.popup?.contains(e.target))opened.place();},true);
  window.addEventListener('resize',()=>opened?.place());window.visualViewport?.addEventListener('resize',()=>opened?.place());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.preventDefault();e.stopImmediatePropagation();opened.close();}},true);
  function boot(){enhance();new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  // Prevent labels, direct native clicks, or delayed enhancement from opening an OS menu.
  for(const type of ['pointerdown','mousedown','click','keydown'])document.addEventListener(type,e=>{
    const select=e.target instanceof HTMLSelectElement?e.target:e.target.closest?.('label')?.control;
    if(!(select instanceof HTMLSelectElement)||select.multiple||select.disabled)return;
    if(type==='keydown'&&!['Enter',' ','ArrowDown','ArrowUp','F4'].includes(e.key))return;
    e.preventDefault();
    if(!instances.has(select))enhance();
    if(type==='click'||type==='keydown')instances.get(select)?.open();
  },true);
  window.SearchSelects={refresh:()=>{enhance();instances.forEach(instance=>instance.sync());},close:()=>opened?.close(false)};
})();
