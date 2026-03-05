/**
 * Word Admin Server — Piège à Mots
 * Lance avec : node scripts/word-admin/server.js
 * Interface sur : http://localhost:4242
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT       = 4242;
const WORDS_DIR  = path.join(__dirname, '../../src/assets/words');
const ADMIN_DIR  = __dirname;

const FILES = {
  easy:   path.join(WORDS_DIR, 'easy.json'),
  medium: path.join(WORDS_DIR, 'medium.json'),
  hard:   path.join(WORDS_DIR, 'hard.json'),
};

function loadWords() {
  return {
    easy:   JSON.parse(fs.readFileSync(FILES.easy,   'utf8')),
    medium: JSON.parse(fs.readFileSync(FILES.medium, 'utf8')),
    hard:   JSON.parse(fs.readFileSync(FILES.hard,   'utf8')),
  };
}

function saveWords({ easy, medium, hard }) {
  const fmt = arr => JSON.stringify(arr, null, 2);
  fs.writeFileSync(FILES.easy,   fmt(easy),   'utf8');
  fs.writeFileSync(FILES.medium, fmt(medium), 'utf8');
  fs.writeFileSync(FILES.hard,   fmt(hard),   'utf8');
  console.log(`[${ts()}]  Sauvegarde OK — easy:${easy.length} medium:${medium.length} hard:${hard.length}`);
}

function ts() {
  return new Date().toLocaleTimeString('fr-FR');
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  ()    => resolve(body));
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
};

const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method   = req.method;

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API GET /api/words ─────────────────────────────────────────────────────
  if (pathname === '/api/words' && method === 'GET') {
    try {
      const data = loadWords();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── API POST /api/words ────────────────────────────────────────────────────
  if (pathname === '/api/words' && method === 'POST') {
    try {
      const body = await readBody(req);
      const data = JSON.parse(body);
      saveWords(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Static (index.html) ────────────────────────────────────────────────────
  const filePath = (pathname === '/' || pathname === '/index.html')
    ? path.join(ADMIN_DIR, 'index.html')
    : path.join(ADMIN_DIR, pathname);

  const ext = path.extname(filePath);

  if (fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🎯  Word Admin — Piège à Mots');
  console.log(`  ➜   http://localhost:${PORT}`);
  console.log('');
  console.log('  ←  Supprimer le mot    →  Garder le mot');
  console.log('  Ctrl+C pour quitter');
  console.log('');
});
