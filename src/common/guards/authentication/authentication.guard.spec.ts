import { AuthenticationGuard } from './authentication.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthTokenType } from '@src/common/enums/auth-token-type.enum';
import { ActiveUserData } from '@src/common/interfaces/active-user-data.interface';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { WsException } from '@nestjs/websockets'; // New Import

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let accessTokenGuard: AccessTokenGuard;

  const mockContext = {
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => ({
        headers: {},
        user: undefined as ActiveUserData | undefined, // Added for setting user
      })),
    })),
    switchToWs: jest.fn(() => ({
      getClient: jest.fn(() => ({
        handshake: {
          headers: {},
        },
        user: undefined as ActiveUserData | undefined, // Added for setting user
      })),
    })),
    getType: jest.fn(() => 'http'), // Default to http, can be overridden per test
    getHandler: jest.fn(() => ({})),
    getClass: jest.fn(() => ({})),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    // Mock for JwtService and ConfigService are already good
    // Mock the AccessTokenGuard more realistically
    const mockAccessTokenGuard = {
      canActivate: jest.fn(async (context: ExecutionContext) => {
        const type = context.getType();
        let request: any;
        let authHeader: string | undefined;

        if (type === 'http') {
          request = context.switchToHttp().getRequest();
          authHeader = request.headers.authorization;
        } else if (type === 'ws') {
          request = context.switchToWs().getClient();
          authHeader = request.handshake.headers.authorization;
        } else {
          // RPC context should be handled by AuthenticationGuard and skip AccessTokenGuard
          return true; // Should not reach here if AuthenticationGuard logic is correct
        }

        if (!authHeader) {
          throw type === 'http'
            ? new UnauthorizedException('No token provided')
            : new WsException('No token provided');
        }

        const [tokenType, token] = authHeader.split(' ');
        if (tokenType !== 'Bearer' || !token) {
          throw type === 'http'
            ? new UnauthorizedException('Invalid token format')
            : new WsException('Invalid token format');
        }

        try {
          const payload: ActiveUserData = await (jwtService.verifyAsync as jest.Mock)(token, {
            secret: 'test_secret',
          });
          request['user'] = payload;
          return true;
        } catch (error) {
          throw type === 'http'
            ? new UnauthorizedException('Invalid token')
            : new WsException('Invalid token');
        }
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret') return 'test_secret';
              if (key === 'jwt.tokenAudience') return 'test_audience';
              if (key === 'jwt.tokenIssuer') return 'test_issuer';
              return null;
            }),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AccessTokenGuard,
          useValue: mockAccessTokenGuard,
        },
      ],
    }).compile();

    guard = moduleRef.get<AuthenticationGuard>(AuthenticationGuard);
    jwtService = moduleRef.get<JwtService>(JwtService);
    reflector = moduleRef.get<Reflector>(Reflector);
    accessTokenGuard = moduleRef.get<AccessTokenGuard>(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no auth type is set (public)', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([AuthTokenType.None]); // Mock to return [AuthTokenType.None]
      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should return true and set user if valid BEARER token is provided', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([AuthTokenType.Access]); // Corrected
      const mockRequest = {
        headers: { authorization: 'Bearer valid_token' },
      };
      const mockPayload: ActiveUserData = {
        sub: 'user123',
        email: 'test@example.com',
        role: 'USER',
      } as ActiveUserData;
      jest.spyOn(mockContext, 'switchToHttp').mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce(mockPayload);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException if no token is provided for BEARER auth', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([AuthTokenType.Access]); // Corrected
      const mockRequest = { headers: {} };
      jest.spyOn(mockContext, 'switchToHttp').mockReturnValue({
        getRequest: () => mockRequest,
      } as any);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if invalid BEARER token is provided', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([AuthTokenType.Access]); // Corrected
      const mockRequest = {
        headers: { authorization: 'Bearer invalid_token' },
      };
      jest.spyOn(mockContext, 'switchToHttp').mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([AuthTokenType.Access]); // Corrected
      const mockRequest = {
        headers: { authorization: 'Basic some_token' },
      };
      jest.spyOn(mockContext, 'switchToHttp').mockReturnValue({
        getRequest: () => mockRequest,
      } as any);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    // Add tests for other AuthTypes if they are implemented later (e.g., ApiKey)
  });
});