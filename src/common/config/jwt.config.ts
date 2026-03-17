import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    tokenAudience: process.env.JWT_TOKEN_AUDIENCE,
    tokenIssuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10),
    refreshTokenTtl: parseInt(
      process.env.JWT_REFRESH_EXPIRES_IN ?? '86400',
      10,
    ),
  };
});
