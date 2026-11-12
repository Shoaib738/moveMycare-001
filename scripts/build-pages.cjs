const fs=require('fs'),crypto=require('crypto');
const source=fs.readFileSync('index.html','utf8').replace(/((?:src|href)="((?:js|css)\/[^"?]+))(?:\?[^"\s]*)?"/g,(_,prefix,file)=>prefix+'?v='+crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12)+'"');
fs.writeFileSync('index.html',source);
for(const [path,title] of [['dealer-panel','Dealer Panel'],['admin-panel','Admin Panel'],['driver-panel','Driver Panel'],['customer-panel','Customer Panel']]){
 fs.mkdirSync(path,{recursive:true});
 fs.writeFileSync(path+'/index.html',source.replace('<base href="./">','<base href="../">').replace('<head>','<head>\n  <meta name="robots" content="noindex,nofollow">').replace(/<title>.*?<\/title>/,`<title>${title} | MoveMyCar.ae</title>`));
}
console.log('Static panel routes generated.');
fs.mkdirSync('dist',{recursive:true});
fs.copyFileSync('index.html','dist/index.html');
for(const folder of ['css','js','assets','dealer-panel','admin-panel','driver-panel','customer-panel'])fs.cpSync(folder,'dist/'+folder,{recursive:true});
console.log('Presentation build packaged in dist/.');
