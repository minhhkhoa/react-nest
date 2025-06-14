import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
//- tất cả các trường của CreateCompanyDto trở thành không bắt buộc (optional) kh sử dụng PartialType
