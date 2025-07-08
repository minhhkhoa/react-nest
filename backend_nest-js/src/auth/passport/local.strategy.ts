import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  //- nhận giá trị username và password từ request body client gửi lên
  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password); //- xác thực
    if (!user) {
      throw new UnauthorizedException("Username or Password không hợp lệ!");
    }
    return user; //req.user
  }
}
