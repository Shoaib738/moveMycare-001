const {chromium}=require('@playwright/test'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.MMC_BROWSER_PATH});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const base='http://127.0.0.1:4173';await page.goto(base);await page.waitForFunction(()=>!!window.SearchSelects);
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:900});await page.locator('label[for=barFrom]').click();await page.locator('.select-popup').waitFor();
  assert(await page.locator('#barFrom').evaluate(el=>el.hidden&&getComputedStyle(el).display==='none'));
  const groups=await page.locator('.select-group').allTextContents();assert(groups.includes('Sharjah')&&!groups.includes('Northern Emirates'));
  await page.locator('.select-search').fill('Ajman');await page.keyboard.press('Enter');assert(await page.locator('#barFrom').inputValue()==='ajm');
  await page.locator('#barFrom').evaluate(el=>el.click());await page.locator('.select-popup').waitFor();await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>{const form=document.createElement('form');form.id='testSelectForm';form.innerHTML='<label for="testSelect">Test location</label><select id="testSelect" name="location" required><option value="">Choose location</option><option value="dubai">Dubai</option></select>';document.body.append(form);});
 await page.locator('#testSelect-trigger').waitFor();assert(await page.locator('#testSelect').evaluate(el=>el.reportValidity())===false);await page.locator('.select-popup').waitFor();await page.locator('.select-search').fill('Dubai');await page.keyboard.press('Enter');
 assert(await page.locator('#testSelectForm').evaluate(form=>form.checkValidity()&&new FormData(form).get('location')==='dubai'));
 // Simulate a script that finishes loading after DOMContentLoaded.
 const late=await browser.newPage();await late.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());await late.route('**/js/combobox.js*',r=>r.abort());await late.goto(base);await late.waitForFunction(()=>!!window.BookingUI);assert(await late.locator('.select-trigger').count()===0);await late.unroute('**/js/combobox.js*');await late.addScriptTag({url:base+'/js/combobox.js?v=late-test'});await late.locator('#barFrom-trigger').waitFor();await late.locator('label[for=barFrom]').click();await late.locator('.select-popup').waitFor();await late.screenshot({path:'artifacts/dropdown-fixed.png'});
 assert.deepStrictEqual(errors,[]);console.log('PASS: native picker hidden; label and direct-select clicks use custom menu; separate emirate groups; search and keyboard; 320/768/1440px; required validation and FormData; late script initialization.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
