import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; //- đây là một kiểu dữ liệu mới được tạo ra từ HydratedDocument<User> để đại diện cho một document của User

@Schema({ timestamps: true }) //- đánh dấu class User là một schema trong mongoose timestamps: true sử dụng cho field createdAt và updatedAt
export class User {
  @Prop({ required: true }) //- đánh dấu thuộc tính name là một field trong schema
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  phone?: string;

  @Prop()
  age?: number;

  @Prop()
  address?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop()
  isDeleted?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User); //- tạo ra một schema từ class User
