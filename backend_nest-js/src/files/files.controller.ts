import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('fileUpload'))
  @ResponseMessage('Upload single file successfully')
  uploadFile(
    @UploadedFile(
      //- sử dụng pipe để validate file upload
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(jpg|png|jpeg|image\/jpeg|image\/png|image\/gif|text\/plain|application\/pdf|application\/msword|audio\/mpeg|video\/mp4)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024, //- 1MB
          message: 'File size is too large',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return {
      fileName: file.filename,
    };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
