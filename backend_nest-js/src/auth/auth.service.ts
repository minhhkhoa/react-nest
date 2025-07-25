import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private roleService: RolesService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>, //- tiêm vào để có thể tương tác vs csdl
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
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
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };

        return objUser;
      }
    }
    return null;
  }

  //-bất kỳ object nào có những 4 trường (_id,name,email,role) đều đủ điều kiện để được coi là IUser
  async login(user: any, response: Response) {
    const { _id, name, email, role, permissions, company } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
      company,
    };

    const refreshToken = this.createRefreshToken(payload);

    //- update user with refreshToken
    await this.usersService.updateUserRefreshToken(_id, refreshToken);

    //-set refresh_token to cookie
    response.clearCookie('refresh_token');
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
        permissions,
        company,
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

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    if (!userRole) {
      throw new BadRequestCustom('Không tìm thấy role người dùng!', !!userRole);
    }

    registerUserDto.role = userRole._id;

    const hashPassword: string = this.usersService.getHashPassword(
      registerUserDto.password,
    );
    registerUserDto.password = hashPassword;

    const user = await this.userModel.create({
      ...registerUserDto,
      role: userRole._id,
    });
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
          this.configService.get<string>(
            'JWT_REFRESH_EXPIRE',
          ) as ms.StringValue,
        ) / 1000, //- ms: mili-seconds còn jwt là second (1 second = 1000 mili-seconds)
    });

    return refreshToken;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      //-gia ma refresh_token để xem nó có hợp lệ hay ko (ko hợp lệ khi ko đúng định dang, hoặc refresh_token hết thời hạn - cái thời hạn đó do mình gán khi lưu vào cookie ở hàm login bên trên)
      //1. giải mã
      const decode = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      //2.Lấy user id
      const userId = decode._id;

      if (!userId) {
        throw new BadRequestException('Token payload thiếu userId');
      }

      // 3. Query user theo userId
      const user = await this.usersService.findUser(userId);
      if (!user) {
        throw new BadRequestException('User không tồn tại');
      }

      // 4. So sánh xem token client gửi lên có khớp với cái lưu ở DB không
      //    (tránh replay attack: token có thể bị hack rồi gọi lại API)
      //- Cách này chỉ đảm bảo hacker không thể dùng một token “ngẫu nhiên” hay token cũ đã bị thu hồi, nhưng không ngăn được nếu hacker dùng token hợp lệ( chưa hết hạn refresh_token )
      if (user.refreshToken !== refreshToken) {
        throw new BadRequestException('Refresh token không khớp');
      }

      //-update refresh_token
      const _id = user.id; //- cú phúp này lây ra id cơ sở dữ liệu (vì _id của mongoose là Object_id)
      const { email, name, role } = user;

      const userRole = user.role as unknown as { _id: string; name: string };
      const temp = await this.roleService.findOne(userRole._id);

      const payload = {
        sub: 'token login',
        iss: 'from server',
        _id,
        name,
        email,
        role,
        permissions: temp?.permissions ?? [],
        company: user.company ?? [],
      };

      const result = await this.login(payload, response);

      return result;
    } catch (error) {
      throw new UnauthorizedException('Refresh_token khong hop le!');
    }
  };

  logout = async (response: Response, user: IUser) => {
    try {
      const filter = { _id: user._id };
      const update = {
        $set: {
          refreshToken: '',
        },
      };
      const result = await this.userModel.updateOne(filter, update);
      response.clearCookie('refresh_token');

      if (result.matchedCount == 1) return 'OK';
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  };
}
