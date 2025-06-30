import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

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

  findAll() {
    return `This action returns all jobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
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

      const filter = { _id: id };
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

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
