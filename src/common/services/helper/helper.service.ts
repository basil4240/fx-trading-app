import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwt.config';
import { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';
import { AuthTokenType } from 'src/common/enums/auth-token-type.enum';
import { RefreshTokenStorageService } from '../refresh-token-storage.service';
@Injectable()
export class HelperService {
  private readonly logger = new Logger(HelperService.name);
  private charPool = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenStorageService: RefreshTokenStorageService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public generateStringDate(date: Date = new Date()): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  }

  public generateRandomFileName(): string {
    return Date.now().toString() + '.' + this.generateUniqueString();
  }

  public generateUniqueString(
    prefix: string = '',
    suffix: string = '',
    length: number = 10,
  ): string {
    let randomString = '';

    while (randomString.length < length) {
      const randomIndex = Math.floor(
        randomBytes(1).readUInt8() % this.charPool.length,
      );
      randomString += this.charPool.charAt(randomIndex);
    }

    return prefix + randomString + suffix;
  }

  public preprocessSearchTerms(searchTerm: string) {
    if (!searchTerm) return undefined;
    const tsquerySpecialChars = /[()|&:*!]/g;
    return searchTerm
      .trim()
      .replace(tsquerySpecialChars, ' ')
      .split(/\s+/)
      .join(' & ');
  }

  public generateFileName(): string {
    return Date.now().toString() + '.' + this.generateUniqueString();
  }

  public secondsToHms(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hoursString =
      hours > 0
        ? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ', ' : ' '}`
        : '';
    const minutesString =
      minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ` : '';
    const secondsString =
      remainingSeconds > 0
        ? `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`
        : '';

    return hoursString + minutesString + secondsString.trim();
  }

  public async generateJwtTokens(activeUserData: ActiveUserData) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signJwtToken(activeUserData, AuthTokenType.Access),
      this.signJwtToken(
        { ...activeUserData, refreshTokenId },
        AuthTokenType.Refresh,
      ),
    ]);

    await this.refreshTokenStorageService.insert(
      activeUserData.sub,
      refreshTokenId,
    );

    return { accessToken, refreshToken };
  }

  public async verifyRefreshToken(token: string): Promise<ActiveUserData> {
    const payload = await this.jwtService.verifyAsync<ActiveUserData>(token, {
      secret: this.jwtConfiguration.refreshSecret,
      audience: this.jwtConfiguration.tokenAudience,
      issuer: this.jwtConfiguration.tokenIssuer,
      
      
    });

    return payload;
  }

  public generateToken(arg: { length: number } = { length: 4 }): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < arg.length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  public calculatePaginationMeta(
    total: number,
    paginationDto: { page: number; limit: number },
  ) {
    const { page, limit } = paginationDto;
    const lastPage = Math.ceil(total / limit);
    const hasNextPage = page < lastPage;
    const hasPrevPage = page > 1;

    return {
      total,
      page,
      pageSize: limit,
      lastPage: isNaN(lastPage) ? 0 : lastPage,
      hasNextPage,
      hasPrevPage,
    };
  }

  private async signJwtToken(
    activeUserData: ActiveUserData,
    authTokenType: AuthTokenType,
  ) {
    // generate token
    const token = await this.jwtService.signAsync(activeUserData, {
      audience: this.jwtConfiguration.tokenAudience,
      issuer: this.jwtConfiguration.tokenIssuer,
      secret:
        authTokenType === AuthTokenType.Access
          ? this.jwtConfiguration.secret
          : this.jwtConfiguration.refreshSecret,
      expiresIn:
        authTokenType === AuthTokenType.Access
          ? this.jwtConfiguration.accessTokenTtl
          : this.jwtConfiguration.refreshTokenTtl,
    });

    return token;
  }
}
