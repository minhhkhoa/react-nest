import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { use } from 'passport';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>, //- sử dụng SoftDeleteModel thông qua model JobDocument
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
        createdAt: newResume.createdAt
      };
    } catch (error) {}
  }

  findAll() {
    return `This action returns all resumes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resume`;
  }

  update(id: number, updateResumeDto: UpdateResumeDto) {
    return `This action updates a #${id} resume`;
  }

  remove(id: number) {
    return `This action removes a #${id} resume`;
  }
}
