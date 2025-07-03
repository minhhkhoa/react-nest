import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose, { Types } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(dto: CreatePermissionDto, user: IUser) {
    const { apiPath, method, name, module } = dto;

    // 1. Check tồn tại (bao gồm cả bản đã soft-delete)
    const existing = await this.permissionModel
      .findOne({ apiPath, method })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Permission cho [${method} ${apiPath}] đã tồn tại`,
      );
    }

    // 2. Tạo mới
    try {
      const permission = await this.permissionModel.create({
        name,
        apiPath,
        method,
        module,
        createdBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      });
      return {
        _id: permission._id,
        createdAt: permission.createdAt,
      };
    } catch (err) {
      throw new BadRequestCustom(err.message, !!err.message);
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);
    delete filter.current;
    delete filter.pageSize;

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id permission không hợp lệ!', !!id);
    }

    try {
      const checkPermission = await this.permissionModel.findById(id);
      if (!checkPermission) {
        throw new BadRequestCustom(`Không tìm thấy permission với id ${id}`);
      }

      return checkPermission;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    const { apiPath, method, name, module } = updatePermissionDto;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id Permission không hợp lệ!', !!id);
    }

    const checkExistPermission = await this.permissionModel.findById(id);
    if (!checkExistPermission) {
      throw new BadRequestCustom(`Không tìm thấy Permission với id ${id}`);
    }

    const conflict = await this.permissionModel
      .findOne({
        apiPath,
        method,
        _id: { $ne: new Types.ObjectId(id) }, //- bỏ đứa đang sửa đi
      })
      .exec();
    if (conflict) {
      throw new ConflictException(
        `Permission cho [${method} ${apiPath}] đã tồn tại`,
      );
    }

    try {
      const filter = { _id: id };
      const update = {
        $set: {
          ...updatePermissionDto,
          updatedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      };

      const result = await this.permissionModel.updateOne(filter, update);

      return result;
    } catch (error) {}
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id permission không hợp lệ!', !!id);
    }

    try {
      const checkpermission = await this.permissionModel.findById(id);

      if (!checkpermission) {
        throw new BadRequestCustom(`Không tìm thấy permission với id ${id}`);
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
      await this.permissionModel.updateOne(filter, update);

      const result = await this.permissionModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
