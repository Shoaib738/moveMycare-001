const fs=require('fs'),vm=require('vm'),assert=require('assert');
for(const file of fs.readdirSync('js').filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync('js/'+file,'utf8'),{filename:file});
const ctx={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},console,Date};vm.createContext(ctx);
for(const file of ['demo-store.js','mock-data.js','calculator.js'])vm.runInContext(fs.readFileSync('js/'+file,'utf8'),ctx);
assert(ctx.window.escapeHTML('<script>')==='&lt;script&gt;');
const pricing=ctx.window.PricingEngine;
assert(pricing.calculateDistance('alquoz','yas')>0);
const single=pricing.computeQuote({from:'alquoz',to:'yas'});
const bulk=pricing.computeQuote({from:'alquoz',to:'yas',qty:3,isDealer:true});
assert(bulk.discountPct===18);assert(bulk.total<single.total*3);
assert(Math.abs(single.subtotal+single.vat-single.total)<0.001,'Quote VAT reconciles');
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert(new Set(ids).size===ids.length,'Duplicate IDs');
for(const m of html.matchAll(/(?:src|href)="((?:js|css|assets)\/[^"?#]+)"/g))assert(fs.existsSync(m[1]),'Missing asset '+m[1]);
for(const route of ['dealer-panel','admin-panel','driver-panel','customer-panel']){const page=fs.readFileSync(route+'/index.html','utf8');assert(page.includes('<base href="../">'));assert(page.includes('noindex,nofollow'));assert(fs.existsSync('dist/'+route+'/index.html'));}
console.log('PASS: JavaScript syntax, escaping, quote/discount logic, unique IDs, local assets, static panel pages.');
