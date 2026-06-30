const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

// Serve static files (index.html, etc.)
app.use(express.static(__dirname));

// GET /api/data — retrieve scores + toggles
app.get('/api/data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json({ scores: {}, toggles: {}, version: 0 });
  }
});

// POST /api/data — save scores + toggles
app.post('/api/data', (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'invalid data' });
  }
  // Ensure required fields
  const toStore = {
    scores: data.scores || {},
    toggles: data.toggles || {},
    version: data.version || 0,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(toStore, null, 2));
  res.json({ ok: true, version: toStore.version });
});

// 404 → serve index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PubGolf server draait op http://localhost:${PORT}`);
});
