import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {}

//- PartialType sẽ mở rộng (extend) DTO gốc và tự động đặt tất cả các thuộc tính thành optional.

