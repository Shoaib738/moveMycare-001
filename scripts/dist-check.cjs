const {chromium}=require('@playwright/test'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.MMC_BROWSER_PATH}),page=await browser.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)missing.push(r.url());});await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto('http://127.0.0.1:4173/dist/');await page.waitForFunction(()=>!!window.Operations&&!!window.DatePickers);assert(await page.evaluate(()=>window.INITIAL_JOBS.length)===60);
 await page.locator('.fleet-img-wrap img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));await page.waitForFunction(()=>[...document.querySelectorAll('.fleet-img-wrap img')].every(img=>img.complete&&img.naturalWidth>0));
 for(const role of ['admin','dealer','driver','customer']){
  await page.evaluate(role=>sessionStorage.setItem('mmc-session',JSON.stringify({role,expires:Date.now()+600000})),role);const response=await page.goto('http://127.0.0.1:4173/dist/'+role+'-panel/');assert(response.status()===200);await page.locator('.dashboard-layout').waitFor();assert(await page.locator('meta[name=robots]').getAttribute('content')==='noindex,nofollow');await page.setViewportSize({width:320,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 assert.deepStrictEqual(errors,[]);assert.deepStrictEqual(missing,[]);console.log('PASS: production dist public site, all four direct routes, hashed assets, decoded fleet images, noindex metadata, 320px layouts; no JavaScript or local asset errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
