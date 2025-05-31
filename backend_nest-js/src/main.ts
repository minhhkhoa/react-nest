import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //- use global JwtAuthGuard
  const reflector = app.get(Reflector);
  // app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ép kiểu theo DTO
      transformOptions: {
        enableImplicitConversion: true, // tự động convert string -> number, v.v.
      },
    }),
  ); //- sử dụng pipe để validate dữ liệu trước khi vào controller

  //- config cors
  app.enableCors({
    origin: 'http://localhost:3000', //- domain client
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  await app.listen(configService.get<string>('PORT') ?? 3000);
}
bootstrap();
