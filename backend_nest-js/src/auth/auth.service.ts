import { Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
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
  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken({ name: 'khoahii' });

    //- update user with refreshToken
    await this.usersService.updateUserRefreshToken(_id, refreshToken);

    //-set refresh_token to cookie
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      //- maxAge là thoi gian hieu luc cua cookie tính theo ms
      maxAge: ms(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') as ms.StringValue,
      ),
    });

    //- ngoài việc nhả ra token cho client thì ta trả thêm 1 số thông tin đi kèm
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
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

  createRefreshToken = (payload: any) => {
    //- đây là cách để mình tạo ra refresh_token với jwt
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(
          (this.configService.get<string>('JWT_REFRESH_EXPIRE') ??
            '1d') as ms.StringValue,
        ) / 1000, //- ms: mili-seconds còn jwt là second (1 second = 1000 mili-seconds)
    });

    return refreshToken;
  };
}
