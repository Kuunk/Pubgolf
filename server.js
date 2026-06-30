const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PASSWORD = process.env.PUBGOLF_PASSWORD;

if (!PASSWORD) {
  console.error('❌ Geen PUBGOLF_PASSWORD ingesteld.');
  console.error('   Stel een wachtwoord in via environment variable:');
  console.error('   Windows (PowerShell): $env:PUBGOLF_PASSWORD="jouwwachtwoord"');
  console.error('   Render.com: zet in Environment Variables');
  process.exit(1);
}

app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// POST /api/login — check password
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

// GET /api/data
app.get('/api/data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json({ scores: {}, toggles: {}, version: 0 });
  }
});

// POST /api/data
app.post('/api/data', (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'invalid data' });
  }
  const toStore = {
    scores: data.scores || {},
    toggles: data.toggles || {},
    version: data.version || 0,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(toStore, null, 2));
  res.json({ ok: true, version: toStore.version });
});

// All other routes → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PubGolf server draait op http://localhost:${PORT}`);
});
