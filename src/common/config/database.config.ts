import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? true : false,
    poolSize: process.env.DB_POOL_SIZE,
  };
});
