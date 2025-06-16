import { Injectable } from '@nestjs/common';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';

@Injectable()
export class ParseIntPipeCustom {
  transform(value: string, metadata: any) {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) {
      throw new BadRequestCustom(
        'Sai định dạng dữ liệu, chỉ được nhập số nguyên dương.',
        !!value,
      );
    }

    return val;
  }
}
