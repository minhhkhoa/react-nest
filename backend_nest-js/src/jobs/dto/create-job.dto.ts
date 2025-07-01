import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Company as CompanyType } from 'src/users/dto/create-user.dto';

//- start validate date
//-@ValidatorConstraint là decorator do class-validator cung cấp, dùng để đánh dấu một class là một custom validation constraint.
@ValidatorConstraint({ name: 'isEndAfterStart', async: false })
class IsEndAfterStartConstraint implements ValidatorConstraintInterface {
  //- implements method
  validate(endDate: string, args: ValidationArguments) {
    const obj = args.object as any; //- args.object là object chính là createJobDto
    const startDate = new Date(obj.startDate);
    const end = new Date(endDate);
    return end > startDate; //check xem endDate lớn hơn startDate hay khong
  }

  //- implements method
  defaultMessage(args: ValidationArguments) {
    //-Khi validate() trả về false, class-validator sẽ gọi defaultMessage()
    return `endDate (${args.value}) phải lớn hơn startDate!`;
  }
}
//- end validate date

export class CreateJobDto {
  @IsNotEmpty({ message: 'Tên công việc không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Kỹ năng không được để trống' })
  @IsArray({ message: 'Skills có định danh là array' })
  @IsString({ each: true, message: 'Mỗi skill sẽ phải là string' })
  skills: string[];

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

  @IsNotEmpty({ message: 'Địa chỉ công việc không được để trống' })
  location: string;

  @IsNotEmpty({ message: 'Start_Date không được để trống' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Start_Date không hợp lệ' })
  startDate: Date;

  @Validate(IsEndAfterStartConstraint)
  @IsNotEmpty({ message: 'End_Date không được để trống' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'End_Date không hợp lệ' })
  endDate: Date;

  @IsNotEmpty({ message: 'Trang thái công việc không được để trống' })
  @IsBoolean({ message: 'Trạng thái công việc không hợp lệ' })
  isActive: boolean;
}
