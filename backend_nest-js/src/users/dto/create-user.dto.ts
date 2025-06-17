import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company { //- mục đích để validate cho nested_obj company
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được để trống' })
  @IsInt({ message: 'Tuổi phải là số nguyên' })
  @Min(0, { message: 'Tuổi phải lớn hơn hoặc bằng 0' })
  age: number;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'Quyền không được để trống' })
  role: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company) //- nâng cấp kieu dữ liệu cho nested_obj sử dụng @Type
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được để trống' })
  @IsInt({ message: 'Tuổi phải là số nguyên' })
  @Min(0, { message: 'Tuổi phải lớn hơn hoặc bằng 0' })
  age: number;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;
}
