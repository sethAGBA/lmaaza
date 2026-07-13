module.exports = async (req, res) => {
  const result = {
    ok: true,
    hasUrl: !!process.env.KV_REST_API_URL,
    hasToken: !!process.env.KV_REST_API_TOKEN,
    nodeVersion: process.version,
  };

  try {
    const { Redis } = require('@upstash/redis');
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    const val = await redis.get('__ping__');
    result.redisOk = true;
    result.pingVal = val;
  } catch (e) {
    result.redisOk = false;
    result.redisError = e.message;
  }

  res.status(200).json(result);
};
