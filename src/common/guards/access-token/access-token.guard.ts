/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Request } from 'express';
import jwtConfig from 'src/common/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { REQUEST_USER_KEY } from 'src/common/constants/iam.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'rpc') return true;

    const request: Request | Socket =
      context.getType() === 'http'
        ? context.switchToHttp().getRequest()
        : context.switchToWs().getClient();

    const token =
      context.getType() === 'http'
        ? this.extractTokenFromHttpHeader(request as Request)
        : this.extractTokenFromWsHeader(request as Socket);

    if (!token) {
      throw context.getType() === 'http'
        ? new UnauthorizedException(
            'Please provide an access token in the request header',
          )
        : new WsException(
            'Please provide an access token in the request header',
          );
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      throw context.getType() === 'http'
        ? new UnauthorizedException('Invalid access token provided')
        : new WsException('Invalid access token provided');
    }

    return true;
  }

  private extractTokenFromHttpHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }

  private extractTokenFromWsHeader(client: Socket): string | undefined {
    const [_, token] = client.handshake.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
