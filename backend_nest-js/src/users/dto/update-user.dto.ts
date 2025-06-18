import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;
}
//- omit sẽ giúp chúng ta loại bỏ các trường không cần thiết trong DTO
//- ở đây chúng ta loại bỏ trường password trong DTO UpdateUserDto
//- chúng ta sẽ không cần nhập trường password khi update thông tin user
