const { handleLogin } = require('../lib/auth');

module.exports = async (req, res) => {
  try {
    await handleLogin(req, res);
  } catch (error) {
    console.error('[api/auth/login]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
