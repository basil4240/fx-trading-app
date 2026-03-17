import { Module } from '@nestjs/common';
import jwtConfig from './config/jwt.config';
import smtpEmailConfig from './config/smtp-email.config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { HashingService } from './services/hashing/hashing.service';
import { BcryptService } from './services/hashing/bcrypt/bcrypt.service';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { RedisService } from './services/local-storage/redis/redis.service';
import { HelperService } from './services/helper/helper.service';
import { JwtService } from '@nestjs/jwt';
import { ValkeyService } from './services/local-storage/valkey/valkey.service';
import { RefreshTokenStorageService } from './services/refresh-token-storage.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(smtpEmailConfig),
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(databaseConfig),
    ConfigModule.forFeature(redisConfig),
    HttpModule,
  ],
  providers: [
    // Guards
    AccessTokenGuard,

    // Abstract services
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: LocalStorageService,
      useClass: RedisService,
    },

    // Other services
    HelperService,
    JwtService,
    RedisService,
    ValkeyService,
    RefreshTokenStorageService
  ],
  exports: [
    // Abstract services
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: LocalStorageService,
      useClass: RedisService,
    },

    // Guards
    AccessTokenGuard,

    // Other services
    HelperService,
    JwtService,
    RedisService,
    ValkeyService,
    RefreshTokenStorageService,
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(redisConfig),
  ],
})
export class CommonModule {}
