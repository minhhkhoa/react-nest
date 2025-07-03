import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'apiPath quyền không được để trống' })
  apiPath: string;

  @IsNotEmpty({ message: 'Method quyền không được để trống' })
  method: string;

  @IsNotEmpty({ message: 'Module quyền không được để trống' })
  module: string;
}
