import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>, //- sử dụng SoftDeleteModel thông qua model UserDocument
  ) {}

  getHashPassword(password: string): string {
    const salt: string = genSaltSync(10);
    const hash: string = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const email = createUserDto.email;

    const checkEmail = await this.userModel.findOne({ email });
    if (checkEmail) {
      throw new BadRequestCustom(
        'Email đã tồn tại hãy chọn một email khác!',
        !!checkEmail,
      );
    }

    const hashPassword: string = this.getHashPassword(createUserDto.password);
    createUserDto.password = hashPassword;

    const createUser = await this.userModel.create({
      ...createUserDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    return {
      _id: createUser._id,
      createdAt: createUser.createdAt,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  /**
   * Tìm user theo id hoặc username
   * @param criteria { id?: string; username?: string; }
   * @returns Một đối tượng user hoặc mảng user nếu tìm theo username
   */
  async findUser(criteria: {
    id?: string;
    username?: string;
  }): Promise<User | { users: User[]; total: number; message: string }> {
    if (criteria.id) {
      // Kiểm tra id hợp lệ với mongoose
      if (!mongoose.Types.ObjectId.isValid(criteria.id)) {
        throw new BadRequestCustom(
          'Id người dùng không hợp lệ!',
          !!criteria.id,
        );
      }
      const user = await this.userModel.findById({ _id: criteria.id });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return user;
    } else if (criteria.username) {
      // Tìm kiếm user theo username không phân biệt hoa thường
      const users = await this.userModel.find({
        name: new RegExp(criteria.username, 'i'),
      });
      if (!users.length) {
        throw new NotFoundException(`Không tìm thấy user ${criteria.username}`);
      }
      return {
        users: users,
        total: users.length,
        message: `Tìm thấy ${users.length} người dùng`,
      };
    } else {
      throw new BadRequestException(
        'You must provide either an id or a username.',
      );
    }
  }

  isValidPassword(password: string, hashPassword: string): boolean {
    return compareSync(password, hashPassword);
  }

  async checkEmailExist(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { $set: updateUserDto }, //-$set giúp tránh việc ghi đè toàn bộ document; chỉ những trường được chỉ định mới bị thay đổi.
    );
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id người dùng không hợp lệ!', !!id);
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      return {
        message: 'not found user want delete!',
      };
    }

    return await this.userModel.softDelete({ _id: id }); //- hàm softDelete là của soft-delete-plugin-mongoose nó sẽ giúp thêm 2 field deletedAt và isDeleted vào csdl
  }
}
