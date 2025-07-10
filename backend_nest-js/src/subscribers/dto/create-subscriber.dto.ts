import {
  IsArray,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Kỹ năng không được để trống' })
  @IsArray({ message: 'Skills có định danh là array' })
  @IsString({ each: true, message: 'Mỗi skill sẽ phải là string' })
  skills: string[];
}
