import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  //- use global JwtAuthGuard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector)); //- check xem có gửi token kèm theo không

  //- use global interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  //- use global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //- loại bỏ các field khong khai bao trong DTO tức là làm sạch dữ liệu trước khi vào controller đó
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

  //- cấu hình static để có thể đọc file tại folder public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  //- config helmet
  app.use(helmet());
  //- end config helmet

  //- config swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API Document')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    //-add bearer auth
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    //-add bearer auth
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, //- ghi nho token khi refresh
    },
  });
  //- end config swagger

  await app.listen(configService.get<string>('PORT') ?? 3000);
}
bootstrap();
