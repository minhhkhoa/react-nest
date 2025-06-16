import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto, user: IUser) {
    try {
      const result = await this.companyModel.create({
        ...createCompanyDto,
        createdBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);
    delete filter.page;
    delete filter.limit;

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //- xung đột type hàm sort của mongoose với sort của aqp
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
    return `This action returns a #${id} company`;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID Không hợp lệ!', !!id);
    }

    try {
      const result = await this.companyModel.updateOne(
        { _id: id },
        {
          $set: {
            ...updateCompanyDto,
            updatedBy: {
              _id: user._id,
              name: user.name,
              email: user.email,
            },
          },
        },
      );

      if (result.matchedCount === 0) {
        //- nó sẽ ném lỗi vào khối catch vì đang nằm trong try-catch mà
        throw new BadRequestCustom(`Công ty có id: ${id} không tồn tại!`, !!id);
      }

      return result;
    } catch (error) {
      //- phải Re-throw để có thể nhận được trên response client
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID Không hợp lệ!', !!id);
    }

    //- 8.6

    try {
      const document = await this.companyModel.findOne({ _id: id });
      if (!document) {
        throw new BadRequestCustom(`Công ty có id: ${id} không tồn tại!`, !!id);
      }

      await this.companyModel.updateOne(
        { _id: id },
        {
          $set: {
            deletedBy: {
              _id: user._id,
              name: user.name,
              email: user.email,
            },
          },
        },
      );

      const result = await this.companyModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
