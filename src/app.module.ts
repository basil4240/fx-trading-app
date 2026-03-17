/* eslint-disable @typescript-eslint/require-await */
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AccountModule } from './account/account.module';
import { NotificationModule } from './notification/notification.module';
import { WalletModule } from './wallet/wallet.module';
import { FxModule } from './fx/fx.module';
import { TradingModule } from './trading/trading.module';
import { AuditModule } from './audit/audit.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './iam/iam.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import redisConfig from './common/config/redis.config';
import databaseConfig from './common/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.name,
        autoLoadEntities: true,
        synchronize: false, // Set to false to avoid pg DeprecationWarning from concurrent schema queries
      }),
      inject: [databaseConfig.KEY],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(redisConfig)],
      useFactory: (redisConfiguration: ConfigType<typeof redisConfig>) => {
        const logger = new Logger('BullMQ Redis');
        return {
          connection: {
            host: redisConfiguration.host,
            port: redisConfiguration.port,
            password: redisConfiguration.password,
            username: redisConfiguration.username,
            connectTimeout: 600_000,
            commandTimeout: 600_000,
            lazyConnect: true,
            maxRetriesPerRequest: null,
            retryDelayOnFailover: 100,
            retryDelayOnClusterDown: 300,
            retryDelayOnFailure: 100,
            keepAlive: 30000,
            enableOfflineQueue: true,
            retryStrategy(times) {
              const delay = Math.min(times * 100, 3000);
              logger.warn(
                `BullMQ Redis: retrying connection, attempt ${times}, delay ${delay}ms`,
              );
              return delay;
            },
          },
        };
      },
      inject: [redisConfig.KEY],
    }),
    CommonModule,
    IamModule,
    AccountModule,
    NotificationModule,
    WalletModule,
    FxModule,
    TradingModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
