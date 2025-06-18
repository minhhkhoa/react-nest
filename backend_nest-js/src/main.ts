import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //- use global JwtAuthGuard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector)); //- check xem có gửi token kèm theo không

  //- use global interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  //- use global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ép kiểu theo DTO
      transformOptions: {
        enableImplicitConversion: true, // tự động convert string -> number, v.v.
      },
    }),
  ); //- sử dụng pipe để validate dữ liệu trước khi vào controller


  //- start config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });
  //- end config versioning

  //- config cookie-parser
  app.use(cookieParser());

  //- config cors
  app.enableCors({
    origin: true, //- domain client
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(configService.get<string>('PORT') ?? 3000);
}
bootstrap();
