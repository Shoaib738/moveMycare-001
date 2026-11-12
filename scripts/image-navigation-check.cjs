const {chromium}=require('@playwright/test'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.MMC_BROWSER_PATH}),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),missing=[],errors=[];
 await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)missing.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 const loaded=async locator=>{const results=await locator.evaluateAll(images=>Promise.all(images.map(img=>img.decode().then(()=>img.naturalWidth>0).catch(()=>false))));assert(results.length&&results.every(Boolean),'All displayed images must decode: '+JSON.stringify(await locator.evaluateAll(images=>images.map(i=>i.currentSrc||i.src))));};
 for(const prefix of ['','/dist']){
  await page.goto('http://127.0.0.1:4173'+prefix+'/');await page.waitForFunction(()=>!!window.PanelApp);
  await page.getByRole('link',{name:'My Bookings',exact:true}).click();await page.locator('#panelLogin').waitFor();await loaded(page.locator('.auth-logo'));
  assert(await page.locator('.auth-logo').evaluate(img=>new URL(img.src).pathname)===(prefix+'/assets/movemycar-logo.png'));
  for(const role of ['customer','dealer','driver','admin']){
   await page.evaluate(()=>window.switchView('public'));await page.evaluate(role=>window.switchView(role),role);await page.locator('#panelLogin').waitFor();await loaded(page.locator('.auth-logo'));
   await page.locator('#loginEmail').fill(role==='admin'?'admin123@MoveMyCar.ae':role+'@MoveMyCar.ae');await page.locator('#loginPassword').fill(role+'123');await page.locator('#panelLogin button[type=submit]').click();await page.locator('.dashboard-layout').waitFor();await loaded(page.locator('.dash-brand img'));
   assert(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);return new Set(ids).size===ids.length;}),'No duplicate control IDs after changing roles');
   await page.locator('[data-signout]').click();await loaded(page.locator('.auth-logo'));
  }
  await page.evaluate(()=>window.switchView('public'));await page.locator('.fleet-img-wrap img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));await loaded(page.locator('#view-public img:not(.leaflet-tile)'));
  await page.evaluate(()=>window.HandoverReportEngine.openInvoiceModal('MMC-7821'));await loaded(page.locator('#invoiceModalContent img'));await page.keyboard.press('Escape');
  await page.evaluate(()=>window.HandoverReportEngine.openHandoverModal('MMC-7821'));await loaded(page.locator('#handoverModalContent img'));await page.keyboard.press('Escape');
  for(const role of ['customer','dealer','driver','admin']){await page.goto('http://127.0.0.1:4173'+prefix+'/'+role+'-panel/');await page.locator('#panelLogin').waitFor();await loaded(page.locator('.auth-logo'));await page.reload();await page.locator('#panelLogin').waitFor();await loaded(page.locator('.auth-logo'));}
 }
 assert.deepStrictEqual(missing,[],'No local image/asset 404s');assert.deepStrictEqual(errors,[]);console.log('PASS: cold-load navigation without refresh, four login/dashboard logos, sign-out, public fleet/photos, invoice/handover images, direct routes and refresh; source and dist; no asset or JavaScript errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
