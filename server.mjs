// server.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
  try {
    let url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = join(__dirname, url);
    const data = await readFile(filePath);
    const type = mime[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    try {
      const index = await readFile(join(__dirname, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(index);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Accra Academy LIVE → ${url}`);
  import('node:child_process').then(cp => cp.exec(`start ${url}`));
});

// ——— AUTO-RELOAD (AFTER server is defined!) ———
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Live-reload client connected');
});

import { watch } from 'node:fs';
watch(__dirname, { recursive: true }, (event, filename) => {
  if (filename && !filename.includes('node_modules') && !filename.includes('.fleet')) {
    console.log(`Changed: ${filename} → Reloading...`);
    wss.clients.forEach(client => {
      if (client.readyState === 1) client.send('reload');
    });
  }
});