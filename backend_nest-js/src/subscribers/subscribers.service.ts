import { Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    try {
      const { name, email, skills } = createSubscriberDto;
      const isExistEmail = await this.subscriberModel.findOne({ email });
      if (isExistEmail) {
        throw new BadRequestCustom('Email đăng ký nhận thông báo đã tồn tại');
      }
      const subscriber = await this.subscriberModel.create({
        name,
        email,
        skills,
        createdBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      });
      return {
        _id: subscriber._id,
        createdAt: subscriber.createdAt,
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

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
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
      throw new BadRequestCustom('Id subscriber không hợp lệ!', !!id);
    }

    try {
      const checkSubscriber = await this.subscriberModel.findById(id);
      if (!checkSubscriber) {
        throw new BadRequestCustom(`Không tìm thấy subscriber với id ${id}`);
      }

      return checkSubscriber;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updateSubscriberDto: UpdateSubscriberDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID không hợp lệ!', !!id);
    }

    try {
      const checkExistDocument = await this.subscriberModel.findById(id);
      if (!checkExistDocument) {
        throw new BadRequestCustom(
          `Không tìm thấy subscriber với id ${id}`,
          !!id,
        );
      }

      const isExistEmail = await this.subscriberModel.findOne({
        email: updateSubscriberDto?.email,
      });
      if (isExistEmail) {
        throw new BadRequestCustom('Email đăng ký nhận thông báo đã tồn tại');
      }

      const filter = { _id: id };
      const update = {
        $set: {
          ...updateSubscriberDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
            name: user.name,
          },
        },
      };

      const result = await this.subscriberModel.updateOne(filter, update);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('Id subscriber không hợp lệ!', !!id);
    }

    try {
      const checkRole = await this.subscriberModel.findById(id);

      if (!checkRole) {
        throw new BadRequestCustom(`Không tìm thấy subscriber với id ${id}`);
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
      await this.subscriberModel.updateOne(filter, update);

      const result = await this.subscriberModel.softDelete({ _id: id });
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
