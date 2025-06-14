import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import ms from 'ms';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    //-khai bao jwt cho nestjs
    //- dung async de lay secret va expire tu env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN'),
        signOptions: {
          expiresIn: ms(
            (configService.get<string>('JWT_ACCESS_EXPIRE') ??
              '1d') as ms.StringValue, //-ép kiểu về ms.StringValue vì ms nó nhận ms.StringValue click vào ms để xem
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
