import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';

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

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
