import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '@eduyug/shared-types';

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data && user ? user[data] : user;
  }
);
