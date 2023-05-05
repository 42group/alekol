import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IronSession } from 'iron-session';
import { UserRole } from '@alekol/shared/enums';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  requireNoRole(roles?: UserRole[]) {
    return !roles || roles.includes(UserRole.None);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ session: IronSession }>();

    if (!request.session.user) {
      request.session.user = {
        accountLinking: {},
      };
      await request.session.save();
    }

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    if (this.requireNoRole(roles)) return true;
    return !!request.session.user?.id;
  }
}
