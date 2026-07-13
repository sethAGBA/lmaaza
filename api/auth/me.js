const { handleMe } = require('../lib/auth');

module.exports = async (req, res) => {
  try {
    await handleMe(req, res);
  } catch (error) {
    console.error('[api/auth/me]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
