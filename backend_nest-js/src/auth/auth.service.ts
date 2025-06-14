import { Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';

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

  //-bất kỳ object nào có những 4 trường (_id,name,email,role) đều đủ điều kiện để được coi là IUser
  async login(user: IUser) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    //- ngoài việc nhả ra token cho client thì ta trả thêm 1 số thông tin đi kèm
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }
}
