import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { use } from 'passport';
import aqp from 'api-query-params';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>, //- sử dụng SoftDeleteModel thông qua model ResumeDocument
  ) {}
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    try {
      const newResume = await this.resumeModel.create({
        ...createUserCvDto,
        email: user.email,
        userId: user._id,
        status: 'PENDING',
        history: [
          {
            status: 'PENDING',
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user._id,
              name: user.name,
            },
          },
        ],
        createdBy: {
          _id: user._id,
          email: user._id,
          name: user.name,
        },
      });

      return {
        _id: newResume._id,
        createdAt: newResume.createdAt,
      };
    } catch (error) {}
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population, projection } = aqp(query);
    delete filter.current;
    delete filter.pageSize;

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter) //- nó tự động bỏ document có isDelete: true.
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
      throw new BadRequestCustom('Id Resume không hợp lệ!', !!id);
    }

    try {
      const checkResume = await this.resumeModel.findById(id);
      if (!checkResume) {
        throw new BadRequestCustom(`Không tìm thấy Resume với id ${id}`);
      }

      return checkResume;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    const { status } = updateResumeDto;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id Resume không hợp lệ!', !!id);
    }
    try {
      const checkResume = await this.resumeModel.findById(id);
      if (!checkResume) {
        throw new BadRequestCustom(`Không tìm thấy Resume với id ${id}`);
      }

      const data = {
        status,
        updatedAt: new Date(),
        updatedBy: {
          _id: user._id,
          email: user._id,
          name: user.name,
        },
      };
      const filter = { _id: id, isDeleted: false };
      const update = {
        $set: {
          status,
          updatedBy: {
            _id: user._id,
            email: user._id,
            name: user.name,
          },
          history: [...checkResume.history, data],
        },
      };

      const result = await this.resumeModel.updateOne(filter, update);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id Resume không hợp lệ!', !!id);
    }

    try {
      const checkResume = await this.resumeModel.findById(id);

      if (!checkResume) {
        throw new BadRequestCustom(`Không tìm thấy Resume với id ${id}`);
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
      await this.resumeModel.updateOne(filter, update);

      const result = await this.resumeModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getHistoryJobByUserId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id User không hợp lệ!', !!id);
    }
    try {
      const checkExist = await this.resumeModel
        .find({
          userId: id,
          isDeleted: false, //- không cần lắm vì nó tự loại ra đứa nào có isDeleted == true rồi
        })
        .sort('-createdAt') //- lấy những cái gần nhất
        .populate([
          {
            path: 'companyId',
            select: { name: 1 },
          },
          {
            path: 'jobId',
            select: { name: 1 },
          },
        ]);

      if (!checkExist) {
        throw new BadRequestCustom('User này chưa có ứng tuyển nào!', !!id);
      }

      return checkExist;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
