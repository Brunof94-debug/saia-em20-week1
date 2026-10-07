import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if(!path.startsWith(root+sep)) {res.writeHead(403).end();return;}
    if(!(await stat(path)).isFile()) {res.writeHead(404).end();return;}
    res.writeHead(200, {'Content-Type':types[path.slice(path.lastIndexOf('.'))]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(await readFile(path));
  } catch {res.writeHead(404).end('Not found');}
}).listen(4318,'127.0.0.1',()=>process.stdout.write('Saia em 20 ready: http://127.0.0.1:4318\n'));
