import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';
import { Permission } from 'src/permissions/schemas/permission.schema';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    //- lấy ra metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    //- check permission phia back_end
    const targetMethod = request.method;
    const targetEnpoint = request.route?.path;

    const permission = user?.permissions ?? [];
    const isExist = permission.find(
      (item: Permission) =>
        item.apiPath === targetEnpoint && item.method === targetMethod,
    );
    if (!isExist) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return user; //- tới đây là ko còn lỗi => gán lại vào req.user và đi tiếp tới controller
  }
}
