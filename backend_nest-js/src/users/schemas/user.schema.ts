import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>; //- đây là một kiểu dữ liệu mới được tạo ra từ HydratedDocument<User> để đại diện cho một document của User

@Schema({ timestamps: true }) //- đánh dấu class User là một schema trong mongoose timestamps: true sử dụng cho field createdAt và updatedAt
export class User {
  @Prop()
  name: string;

  @Prop({ required: true }) //- đánh dấu thuộc tính name là một field trong schema
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  address: string;

  @Prop({ type: Object })
  company: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Schema.Types.ObjectId;

  @Prop()
  refreshToken: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  isDeleted?: boolean;

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
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); //- tạo ra một schema từ class User
