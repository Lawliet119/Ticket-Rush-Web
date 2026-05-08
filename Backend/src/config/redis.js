const Redis = require('ioredis');
/**
 * Shared Redis Client instance for caching and queuing
 */
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;
