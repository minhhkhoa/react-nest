import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    try {
      const checkExist = await this.roleModel.findOne({
        name: createRoleDto.name,
      });
      if (checkExist) {
        throw new Error(`Vai trò ${createRoleDto.name} đã tồn tại!`);
      }

      const Role = await this.roleModel.create({
        ...createRoleDto,
        createdBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      });

      return {
        _id: Role._id,
        createdAt: Role.createdAt,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);
    delete filter.current;
    delete filter.pageSize;

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
      .find(filter) //- nó tự động bỏ document có isDelete: true.
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID không hợp lệ!', !!id);
    }

    try {
      const checkExistDocument = await this.roleModel.findById(id);
      if (!checkExistDocument) {
        throw new BadRequestCustom(`Không tìm thấy role với id ${id}`, !!id);
      }

      const existNameRole = await this.roleModel.findOne({
        name: updateRoleDto.name,
      });

      if (existNameRole) {
        throw new BadRequestCustom(
          `Vai trò ${updateRoleDto.name} đã tồn tại!`,
          !!updateRoleDto.name,
        );
      }

      const filter = { _id: id };
      const update = {
        $set: {
          ...updateRoleDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
            name: user.name,
          },
        },
      };

      const result = await this.roleModel.updateOne(filter, update);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
