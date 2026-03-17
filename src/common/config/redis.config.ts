import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  return {
    databaseUrl: process.env.REDIS_DATABASE_URL,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '60', 10),
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
});
