import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { use } from 'passport';
import aqp from 'api-query-params';

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
        createdAt: newResume.createdAt,
      };
    } catch (error) {}
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);
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
    return `This action returns a #${id} resume`;
  }

  update(id: number, updateResumeDto: UpdateResumeDto) {
    return `This action updates a #${id} resume`;
  }

  remove(id: number) {
    return `This action removes a #${id} resume`;
  }
}
