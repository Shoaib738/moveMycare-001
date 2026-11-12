/* Run once to vendor existing public demonstration assets. */
const fs=require('fs'),path=require('path');
const files=['index.html','js/mock-data.js'];
const sources=files.map(file=>({file,text:fs.readFileSync(file,'utf8')}));
const urls=[...new Set(sources.flatMap(({text})=>[...text.matchAll(/https:\/\/(?:images\.unsplash\.com|pngimg\.com)\/[^'"\s<>]+/g)].map(m=>m[0])))];
fs.mkdirSync('assets/images',{recursive:true});
(async()=>{
 const results=await Promise.all(urls.map(async(url,index)=>{
  const target=`assets/images/photo-${index+1}.${url.includes('.png')?'png':'jpg'}`;
  try{const response=await fetch(url,{signal:AbortSignal.timeout(40000),headers:{'User-Agent':'MoveMyCar frontend demo asset preparation'}});if(!response.ok)throw Error('HTTP '+response.status);const data=Buffer.from(await response.arrayBuffer());if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Not an image');fs.writeFileSync(target,data);return {url,target,ok:true};}
  catch(error){return {url,ok:false,error:error.message};}
 }));
 if(results.some(r=>r.ok))fs.writeFileSync('assets/image-sources.json',JSON.stringify(results.filter(r=>r.ok).map(({url,target})=>({source:url,file:target})),null,2));
 for(const {file,text}of sources){let updated=text;for(const result of results)if(result.ok)updated=updated.replaceAll(result.url,result.target);fs.writeFileSync(file,updated);}
 const leaflet=path.join('node_modules','leaflet','dist');
 if(fs.existsSync(leaflet)){
  fs.mkdirSync('assets/leaflet',{recursive:true});
  for(const file of ['leaflet.css','leaflet.js'])fs.copyFileSync(path.join(leaflet,file),path.join('assets/leaflet',file));
  fs.cpSync(path.join(leaflet,'images'),'assets/leaflet/images',{recursive:true});
  fs.copyFileSync('node_modules/leaflet/LICENSE','assets/leaflet/LICENSE');
  let html=fs.readFileSync('index.html','utf8').replace('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','assets/leaflet/leaflet.css').replace('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','assets/leaflet/leaflet.js');fs.writeFileSync('index.html',html);
 }
 console.log(JSON.stringify(results.map(r=>({file:r.target,ok:r.ok,error:r.error,url:r.ok?undefined:r.url})),null,2));
})();
