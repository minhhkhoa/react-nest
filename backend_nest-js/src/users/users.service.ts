import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

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

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);
    delete filter.current;
    delete filter.pageSize;

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: defaultPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findUser(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id người dùng không hợp lệ!', !!id);
    }

    try {
      const user = await this.userModel
        .findById(id)
        .select('-password')
        .populate({ path: 'role', select: { name: 1, _id: 1 } });
      if (!user) {
        throw new BadRequestCustom('Không tìm thấy người dùng!', !!user);
      }

      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  isValidPassword(password: string, hashPassword: string): boolean {
    return compareSync(password, hashPassword);
  }

  async checkEmailExist(email: string) {
    return await this.userModel
      .findOne({ email })
      .populate({ path: 'role', select: { name: 1 } });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom(
        'Id người dùng không hợp lệ!',
        !!id,
      );
    }
    try {
      const checkUser = await this.userModel.findById(id);
      if (!checkUser) {
        throw new BadRequestCustom('Không tìm thấy người dùng!');
      }

      const filterEmail = {
        email: updateUserDto.email,
        _id: { $ne: id }, //- trừ đứa đang cần update ra(ne--->not equal)
      };
      const checkEmail = await this.userModel.findOne(filterEmail);
      if (checkEmail) {
        throw new BadRequestCustom(
          'Email đã tồn tại hãy chọn một email khác!',
          !!checkEmail,
        );
      }

      //- nếu có thì để nguyên không thì lấy người tạo là người đang login
      const createdBy = checkUser.createdBy
        ? checkUser.createdBy
        : {
            _id: user._id,
            name: user.name,
            email: user.email,
          };

      const filter = { _id: id, isDeleted: false };
      const update = {
        $set: {
          ...updateUserDto,
          updatedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          createdBy,
        },
      };
      const result = await this.userModel.updateOne(filter, update);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id người dùng không hợp lệ!', !!id);
    }

    try {
      const checkUser = await this.userModel.findById(id);

      if (!checkUser) {
        throw new BadRequestCustom('Không tìm thấy người dùng!');
      }

      const isDelete = checkUser.isDeleted;
      if (isDelete) {
        throw new BadRequestCustom('Người dùng này đã được xóa', !!isDelete);
      }

      //- ko cho xoa admin
      if (checkUser.email === 'admin@gmail.com') {
        throw new BadRequestCustom(
          'Không được phép xóa người admin!',
          !!checkUser,
        );
      }

      const filter = { _id: id };
      const update = {
        $set: {
          deletedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      };
      await this.userModel.updateOne(filter, update);

      //- hàm softDelete là của soft-delete-plugin-mongoose nó sẽ giúp thêm 2 field deletedAt và isDeleted vào csdl
      const result = await this.userModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  updateUserRefreshToken = async (id: string, refreshToken: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id người dùng không hợp lệ!', !!id);
    }
    try {
      const checkUser = await this.userModel.findById(id);
      if (!checkUser) {
        throw new BadRequestCustom('Không tìm thấy người dùng!');
      }

      const filter = { _id: id };
      const update = {
        $set: {
          refreshToken,
        },
      };
      const result = await this.userModel.updateOne(filter, update);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  };

  findUserByRefreshToken = async (refreshToken: string) => {
    if (!refreshToken) {
      throw new BadRequestCustom('Refresh token không hợp lệ!', !!refreshToken);
    }
    return await this.userModel.findOne({ refreshToken });
  };
}
