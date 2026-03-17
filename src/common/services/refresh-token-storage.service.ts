import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { LocalStorageService } from './local-storage/local-storage.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RefreshTokenStorageService {
  private readonly logger = new Logger(RefreshTokenStorageService.name);

  constructor(
    // @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly localStorageService: LocalStorageService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  private key(userId: string): string {
    return `refresh_token:${userId}`;
  }

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.localStorageService.set(
      this.key(userId),
      tokenId,
      this.jwtConfiguration.refreshTokenTtl,
    );
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.localStorageService.get(this.key(userId));
    if (!storedId) {
      throw new UnauthorizedException('Refresh token has been invalidated');
    }
    return storedId === tokenId;
  }

  async invalidate(userId: string): Promise<void> {
    await this.localStorageService.del(this.key(userId));
  }
}
