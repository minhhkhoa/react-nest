import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from 'src/decorator/customize';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  isOk: boolean;
  isError: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    
    const response = context.switchToHttp().getResponse();
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ?? '';

    return next.handle().pipe(
      //- data trong hàm map của rxJs lấy giá trị return của endpoint tương ứng ở controller
      map((data: T) => {
        const statusCode = response.statusCode;
        const isOk = statusCode < 400;

        return {
          statusCode,
          message,
          data,
          isOk,
          isError: !isOk,
        };
      }),
    );
  }
}
