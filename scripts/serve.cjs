const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);return res.end('Forbidden');}
  if(pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);return res.end('Forbidden');}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(302,{Location:pathname+'/'});return res.end();}
   target=path.join(target,'index.html');
  }
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(target).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request');}
});
server.listen(4173,'127.0.0.1',()=>console.log('MoveMyCar preview: http://127.0.0.1:4173'));
