import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Permission } from 'src/permissions/schemas/permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  isActive: boolean;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
  permissions: Permission[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

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
  isDeleted?: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role); //- tạo ra một schema từ class Role

/*

 Giải thích đoạn code sau:  
 @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
 permissions: Permission[];

  type: [mongoose.Schema.Types.ObjectId]
  Cho biết trường này là một mảng các ObjectId.

  ref: Permission.name
  Nói với Mongoose rằng mỗi ObjectId trong mảng sẽ tham chiếu đến collection được đặt tên bằng Permission.name (tức tên model “Permission”).

  permissions: Permission[];
  Về mặt TypeScript, khai báo kiểu mảng Permission[] để dễ thao tác (nhưng thực ra khi lưu xuống database là mảng ObjectId).

  Khi gọi .populate('permissions') trên query, Mongoose sẽ tự động “thay” mỗi ObjectId thành document tương ứng từ collection permissions.
*/
