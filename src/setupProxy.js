const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          console.error('[proxy] Erreur — le dev API server est-il lancé ? (npm run dev:api)', err.message);
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API serveur non disponible. Lancez : npm run dev:api' }));
        },
      },
    })
  );
};
