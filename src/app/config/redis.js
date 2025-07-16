import Redis from 'ioredis';

export default function initRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected globally');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  return redis;
}
