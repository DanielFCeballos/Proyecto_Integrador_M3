// Local HTTP adapter for the same handler used by Vercel. No extra dependencies.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const productionHandler = require('../api/chat.js');
const root = path.resolve(__dirname, '../src');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

function createServer({ chatHandler = productionHandler } = {}) {
  return http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/api/chat') { await chatHandler(request, response); return; }
      if (pathname.startsWith('/api/')) { response.writeHead(404); response.end('API route not found'); return; }
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end('Method not allowed'); return; }
      const relativePath = pathname.replace(/^\/+/, '');
      const file = path.resolve(root, relativePath);
      if ((file !== root && !file.startsWith(root + path.sep)) || relativePath.split(/[\\/]/).some(part => part.startsWith('.'))) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
      const target = path.extname(pathname) ? file : path.join(root, 'index.html');
      const content = await fs.readFile(target);
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (!response.headersSent) response.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400);
      response.end('Resource unavailable');
    }
  });
}

if (require.main === module) {
  // Native Node environment loader. Never read or serve environment files in src/.
  try { process.loadEnvFile(path.resolve(__dirname, '../.env')); } catch (error) {
    if (error.code !== 'ENOENT') { console.error('No se pudo cargar el archivo de entorno local.'); process.exit(1); }
  }
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.on('error', () => { console.error('No se pudo iniciar el servidor. Comprueba que el puerto esté disponible.'); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Simulador educativo disponible en http://localhost:${port} (Ctrl+C para detener)`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.closeAllConnections(); server.close(); });
}
module.exports = { createServer };
