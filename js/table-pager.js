window.TablePager={
 apply(root){root.querySelectorAll('.dash-table-wrap:not([data-paginated])').forEach(wrap=>{
  wrap.dataset.paginated='true';const rows=[...wrap.querySelectorAll('tbody tr')],size=8;if(rows.length<=size)return;
  let page=0;const bar=document.createElement('div');bar.className='table-pagination';const label=document.createElement('span');label.setAttribute('role','status');const controls=document.createElement('div');controls.className='pagination-controls';
  const prev=document.createElement('button'),next=document.createElement('button');prev.type=next.type='button';prev.textContent='Previous';next.textContent='Next';prev.setAttribute('aria-label','Previous table page');next.setAttribute('aria-label','Next table page');controls.append(prev,next);bar.append(label,controls);wrap.after(bar);
  const update=()=>{rows.forEach((row,i)=>row.hidden=i<page*size||i>=(page+1)*size);label.textContent=(page*size+1)+'–'+Math.min((page+1)*size,rows.length)+' of '+rows.length;prev.disabled=page===0;next.disabled=(page+1)*size>=rows.length;};prev.onclick=()=>{page--;update();};next.onclick=()=>{page++;update();};update();
 });}
};
