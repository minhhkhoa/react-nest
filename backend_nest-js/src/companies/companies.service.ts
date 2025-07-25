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
    delete filter.current;
    delete filter.pageSize;

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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id công ty không hợp lệ!', !!id);
    }

    try {
      const checkCompany = await this.companyModel.findById(id);
      if (!checkCompany) {
        throw new BadRequestCustom(`Không tìm thấy công ty với id ${id}`);
      }

      return checkCompany;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID Không hợp lệ!', !!id);
    }

    try {
      const checkCompany = await this.companyModel.findById(id);
      if (!checkCompany) {
        throw new BadRequestCustom(`Công ty có id: ${id} không tồn tại!`, !!id);
      }

      const filter = { _id: id, isDeleted: false };
      const update = {
        $set: {
          ...updateCompanyDto,
          updatedBy: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      };

      const result = await this.companyModel.updateOne(filter, update);

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

      const isDelete = document.isDeleted;
      if (isDelete) {
        throw new BadRequestCustom('Công ty này đã được xóa', !!isDelete);
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
