import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>; //- đây là một kiểu dữ liệu mới được tạo ra từ HydratedDocument<Company> để đại diện cho một document của Company

@Schema({ timestamps: true }) //- đánh dấu class Company là một schema trong mongoose timestamps: true sử dụng cho field createdAt và updatedAt
export class Company {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop()
  isDeleted?: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company); //- tạo ra một schema từ class Company
