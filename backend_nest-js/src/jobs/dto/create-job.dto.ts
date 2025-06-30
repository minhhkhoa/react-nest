import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Company as CompanyType } from 'src/users/dto/create-user.dto';
export class CreateJobDto {
  @IsNotEmpty({ message: 'Tên công việc không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Kỹ năng không được để trống' })
  skills: string;

  @IsNotEmptyObject({}, { message: 'Thông tin công ty không hợp lệ' })
  @IsObject({ message: 'Thông tin công ty không hợp lệ' })
  @ValidateNested()
  @Type(() => CompanyType) //- nâng cấp kieu dữ liệu cho nested_obj sử dụng @Type
  company: CompanyType;

  @IsNotEmpty({ message: 'Lương không được để trống' })
  salary: number;

  @IsNotEmpty({ message: 'Số lượng tuyển không được để trống' })
  quantity: string;

  @IsNotEmpty({ message: 'Level không được để trống' })
  level: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;
}
