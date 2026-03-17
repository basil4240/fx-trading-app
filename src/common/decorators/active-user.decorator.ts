 
 
 
 
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';
import { Socket } from 'socket.io';
import { REQUEST_USER_KEY } from '../constants/iam.constant';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, context: ExecutionContext) => {
    const request: Request | Socket =
      context.getType() === 'http'
        ? context.switchToHttp().getRequest()
        : context.switchToWs().getClient();

    const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
