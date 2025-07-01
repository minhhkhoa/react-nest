import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>, //- sử dụng SoftDeleteModel thông qua model JobDocument
  ) {}
  async create(createJobDto: CreateJobDto, user: IUser) {
    try {
      const newJob = await this.jobModel.create({
        ...createJobDto,
        createdBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });

      return {
        _id: newJob._id,
        createdAt: newJob.createdAt,
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

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
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
      throw new BadRequestCustom('Id Job không hợp lệ!', !!id);
    }

    try {
      const checkJob = await this.jobModel.findById(id);
      if (!checkJob) {
        throw new BadRequestCustom(`Không tìm thấy job với id ${id}`);
      }

      return checkJob;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id Job không hợp lệ!', !!id);
    }
    try {
      const checkJob = await this.jobModel.findById(id);
      if (!checkJob) {
        throw new BadRequestCustom(`Không tìm thấy job với id ${id}`);
      }

      const filter = { _id: id, isDeleted: false };
      const update = {
        $set: {
          ...updateJobDto,
          updatedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      };

      const result = await this.jobModel.updateOne(filter, update);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id Job không hợp lệ!', !!id);
    }

    try {
      const checkUser = await this.jobModel.findById(id);

      if (!checkUser) {
        throw new BadRequestCustom(`Không tìm thấy job với id ${id}`);
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
      await this.jobModel.updateOne(filter, update);

      const result = await this.jobModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
