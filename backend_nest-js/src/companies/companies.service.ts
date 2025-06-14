import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto, user: IUser) {
    return await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }

  findAll() {
    return `This action returns all companies`;
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

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
