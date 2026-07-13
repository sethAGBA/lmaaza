/**
 * Local development API server.
 * Proxied from CRA via src/setupProxy.js → http://localhost:3001
 *
 * Usage: npm run dev:api
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const express = require('express');
const { handleLogin, handleMe } = require('../api/lib/auth');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

app.use('/api/auth/login', async (req, res) => {
  try {
    await handleLogin(req, res);
  } catch (error) {
    console.error('[dev-api/login]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.use('/api/auth/me', async (req, res) => {
  try {
    await handleMe(req, res);
  } catch (error) {
    console.error('[dev-api/me]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`[dev-api] Auth API running on http://localhost:${PORT}`);
});
