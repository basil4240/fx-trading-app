import * as Joi from 'joi';

export const validationSchema = Joi.object({
  //  SQL DATABASE
  DATABASE_URL: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // APP
  PORT: Joi.number().default(8080),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.number().required(),

  // REDIS
  REDIS_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PASSWORD: Joi.string(),
  REDIS_PORT: Joi.string().required(),

  // FIREBASE
  FIREBASE_STORAGE_BUCKET: Joi.string().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),

  // AWS
  AWS_SES_REGION: Joi.string().required(),
  AWS_SES_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SES_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_SES_SESSION_TOKEN: Joi.string().required(),
  AWS_SES_SOURCE_EMAIL: Joi.string().required(),
});
