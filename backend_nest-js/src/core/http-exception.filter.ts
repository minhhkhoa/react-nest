import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    //- custom response filter
    response.status(status).json({
      error: exception.message,
      statusCode: status,
      message:
        'Dung lượng file vượt quá cho phép hoặc file không đúng định dạng',
    });
  }
}
