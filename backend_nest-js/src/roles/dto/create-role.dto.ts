import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Mô tả vai trò không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'isActive vai trò không được để trống' })
  @IsBoolean({ message: 'isActive phải có giá trị boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'permissions vai trò không được để trống' })
  @IsArray({ message: 'isActive phải có dạng Array' })
  @IsMongoId({ each: true, message: 'each permissions phải là dạng object id' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
