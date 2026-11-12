const {chromium}=require('@playwright/test');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.MMC_BROWSER_PATH});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.addInitScript(()=>sessionStorage.setItem('mmc-session',JSON.stringify({role:'admin',expires:Date.now()+600000})));
 await page.goto('http://127.0.0.1:4173/admin-panel/');await page.locator('.dashboard-layout').waitFor();
 for(const tab of ['billing','dispatch','dealers','dispatch','overview','drivers','reports']){
  await page.locator('[data-tab='+tab+']').click();
  for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});const result=await page.evaluate(()=>({width:innerWidth,actual:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='absolute'&&e.offsetWidth&&e.getClientRects().length).slice(0,12).map(e=>e.className)}));if(result.actual>width+1)throw Error(tab+' '+JSON.stringify(result));}
 }
 await page.waitForTimeout(500);if(errors.length)throw Error(errors.join('\n'));console.log('PASS: dashboard widths and map cleanup');
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>!!window.BookingUI);await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(1200);await page.screenshot({path:'artifacts/home-top.png'});await page.setViewportSize({width:375,height:900});await page.screenshot({path:'artifacts/home-mobile-top.png'});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
