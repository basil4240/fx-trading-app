import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { ActiveUserData } from 'src/common/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/common/constants/iam.constant';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRole = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!contextRole) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    const hasRole = contextRole.some((role) => user.role === role);

    if (!hasRole) {
      const rolesList = contextRole.join(', ');
      throw new ForbiddenException(
        `Only users with the following roles can access this resource: ${rolesList}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
