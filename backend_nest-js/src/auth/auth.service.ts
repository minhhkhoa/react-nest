import { Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>, //- tiêm vào để có thể tương tác vs csdl
  ) {}

  //-email va pass la 2 tham so ma thu vien passport se truyen vao
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.checkEmailExist(email);
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

  async registerUser(registerUserDto: any) {
    const email = registerUserDto.email;

    const checkEmail = await this.usersService.checkEmailExist(email);
    if (checkEmail) {
      throw new BadRequestCustom(
        'Email đã tồn tại hãy chọn một email khác!',
        !!checkEmail,
      );
    }

    const hashPassword: string = this.usersService.getHashPassword(
      registerUserDto.password,
    );
    registerUserDto.password = hashPassword;

    registerUserDto.role = 'USER';
    const user = await this.userModel.create(registerUserDto);
    return {
      _id: user._id,
      createdAt: user.createdAt,
    };
  }
}
