import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    //- giải mã jwt token
    //- sử dụng ExtractJwt để lấy token từ header
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') as string,
    });
  }

  //- supper trên sẽ giúp ta decode và tự động dán vào payload cho hàm validate bên dưới và gọi nó luôn
  async validate(payload: IUser) {
    //- nói cách khác payload nó là data mà bên sign(payload) sử dụng
    const { _id, name, email, role } = payload;
    return {
      _id,
      name,
      email,
      role,
    }; //- nó sẽ gán vào req.user đấy
  }
}
