import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = new Map([
  ['html', 'text/html; charset=utf-8'], ['css', 'text/css; charset=utf-8'],
  ['js', 'text/javascript; charset=utf-8'], ['png', 'image/png'], ['webmanifest', 'application/manifest+json'],
]);
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.LINUXLAB_PORT || 4173);
const mount = '/linuxlab/';

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/' || pathname === '/linuxlab') {
    response.writeHead(302, { location: mount }).end();
    return;
  }
  if (pathname.startsWith(mount)) {
    try {
      const relative = decodeURIComponent(pathname.slice(mount.length)) || 'index.html';
      const path = resolve(root, relative);
      const type = types.get(path.split('.').at(-1));
      if (path.startsWith(resolve(root) + sep) && type) {
        const body = await readFile(path);
        response.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' }).end(body);
        return;
      }
    } catch {
      // Missing and malformed paths both get a 404.
    }
  }
  response.writeHead(404).end();
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${mount}`));
