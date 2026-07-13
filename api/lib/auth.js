/**
 * Shared auth utilities for Vercel serverless routes and local dev server.
 */

const jwt = require('jsonwebtoken');

const TOKEN_EXPIRY = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'lmaaza-dev-secret-change-in-production';
  }
  return secret;
}

/**
 * Load users from environment variables.
 * Admin: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (optional)
 * Regular user (optional): USER_EMAIL, USER_PASSWORD, USER_NAME (optional)
 */
function getUsers() {
  const users = [];

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    users.push({
      id: 'admin-1',
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'Administrateur',
      role: 'admin',
    });
  }

  const userEmail = process.env.USER_EMAIL;
  const userPassword = process.env.USER_PASSWORD;
  if (userEmail && userPassword) {
    users.push({
      id: 'user-1',
      email: userEmail.toLowerCase().trim(),
      password: userPassword,
      name: process.env.USER_NAME || 'Utilisateur',
      role: 'user',
    });
  }

  // Dev fallback when no env vars configured
  if (users.length === 0 && process.env.NODE_ENV !== 'production') {
    users.push({
      id: 'admin-1',
      email: 'admin@lmaaza.net',
      password: 'admin123',
      name: 'Administrateur',
      role: 'admin',
    });
    users.push({
      id: 'user-1',
      email: 'user@lmaaza.net',
      password: 'user123',
      name: 'Utilisateur',
      role: 'user',
    });
  }

  return users;
}

function findUserByEmail(email) {
  const normalized = (email || '').toLowerCase().trim();
  return getUsers().find((u) => u.email === normalized) || null;
}

function validateCredentials(email, password) {
  const user = findUserByEmail(email);
  if (!user || !password) return null;
  if (user.password !== password) return null;
  return toPublicUser(user);
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function handleLogin(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const body = req.body || {};
  const { email, password } = body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = signToken(user);
  return res.status(200).json({ token, user });
}

async function handleMe(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expirée ou invalide' });
  }

  return res.status(200).json({ user });
}

module.exports = {
  getUsers,
  validateCredentials,
  signToken,
  verifyToken,
  extractBearerToken,
  handleLogin,
  handleMe,
};
