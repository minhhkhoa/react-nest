/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  //-email va pass la 2 tham so ma thu vien passport se truyen vao
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.login(email);
    if (user) {
      //- co user
      const isValid: boolean = this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValid) {
        //-mat khau dung
        return user;
      }
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: any) {
    const payload = {
      username: user.email,
      sub: user._id,
      // password: user.password, //- khong nen dua password vao payload
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
