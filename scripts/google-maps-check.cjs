const {chromium}=require('@playwright/test'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.MMC_BROWSER_PATH}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>!!window.GoogleMapsLinks&&!!window.mapTrackerInstance.googleLinks);
 const route=page.locator('.map-container-box .google-map-link').first(),pin=page.locator('.map-container-box .google-map-link').nth(1);
 const url=new URL(await route.getAttribute('href'));assert(url.hostname==='www.google.com'&&url.searchParams.get('api')==='1'&&url.searchParams.get('origin')==='25.140000,55.230000'&&url.searchParams.get('destination')==='24.498400,54.606200');assert(!url.searchParams.has('key'));assert(await route.getAttribute('target')==='_blank');assert(await page.locator('.google-map-frame').count()===0,'No paid/keyed API call without a configured key');
 const initial=await pin.getAttribute('href');await page.waitForTimeout(3200);assert(await pin.getAttribute('href')!==initial,'Google Maps location follows simulated marker');
 await page.evaluate(()=>window.mapTrackerInstance.trackBooking('MMC-6490'));assert(await page.locator('.map-container-box .google-map-actions').count()===1);assert(new URL(await pin.getAttribute('href')).searchParams.get('query')==='24.453900,54.377300','Delivered vehicle links to destination');
 for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 // Check official Embed API URL construction without contacting Google or using a real key.
 await page.route('https://www.google.com/maps/embed/**',r=>r.fulfill({contentType:'text/html',body:'<p>Embed URL test</p>'}));
 await page.evaluate(()=>{window.MoveMyCarMaps.googleEmbedApiKey='LOCAL_TEST_KEY';window.mapTrackerInstance.trackBooking('MMC-7821');});await page.getByRole('button',{name:'Google map preview'}).click();const frame=page.locator('.google-map-frame');const embed=new URL(await frame.getAttribute('src'));assert(embed.pathname==='/maps/embed/v1/directions'&&embed.searchParams.get('key')==='LOCAL_TEST_KEY'&&embed.searchParams.get('mode')==='driving');await page.getByRole('button',{name:'Google map preview'}).click();assert(await frame.isHidden());
 assert.deepStrictEqual(errors,[]);console.log('PASS: free Google Maps route URLs, simulated position updates, delivered locations, responsive controls, no keyless API requests, optional Embed API URL and toggle; no JavaScript errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
