/* eslint-disable prettier/prettier */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorate/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const isSkipPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'token không hợp lệ or không có token ở Header Request!',
        )
      );
    }
    //check permission
    // const targetMethod = request.method;
    // const targetEndpoint = request.route?.path as string;
    // const permissions = user?.permission ?? [];
    // let isExist = permissions.find(
    //   (permissions) =>
    //     targetMethod === permissions.method &&
    //     targetEndpoint === permissions.apiPath,
    // );
    // if (targetEndpoint.startsWith('/api/v1/auth')) {
    //   isExist = true;
    // }
    // if (!isExist && !isSkipPermission) {
    //   throw new ForbiddenException('bạn không có quyền để truy cập endpoint');
    // }
    return user;
  }
}
