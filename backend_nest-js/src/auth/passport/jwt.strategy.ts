/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    //- giải mã jwt token
    //- sử dụng ExtractJwt để lấy token từ header
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN') as string,
    });
  }

  //- hàm này sẽ giúp ta decode payload từ token
  //- và trả về một object với các thông tin mà ta muốn
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      // password: payload.password, //- khong nen dua password vao payload
    };
  }
}
