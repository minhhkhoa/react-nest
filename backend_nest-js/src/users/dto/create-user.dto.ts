import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  name: string;
  phone?: string;

  @IsInt({ message: 'Tuổi phải là số nguyên' })
  @Min(0, { message: 'Tuổi phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  age?: number;

  address?: string;

  @IsNotEmpty({ message: 'Vai trò của người dùng không được để trống' })
  role: string;
  createdAt?: Date;
  updatedAt?: string;
}
