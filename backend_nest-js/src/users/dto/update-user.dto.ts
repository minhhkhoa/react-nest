import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  _id: string;
}
//- omit sẽ giúp chúng ta loại bỏ các trường không cần thiết trong DTO
//- ở đây chúng ta loại bỏ trường password trong DTO UpdateUserDto
//- chúng ta sẽ không cần nhập trường password khi update thông tin user
