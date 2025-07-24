import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';;
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadOptions } from './cloudinary/file-upload.options';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('fileUpload', fileUploadOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const data = await this.cloudinaryService.uploadFile(file);
    return data.secure_url;
  }
}
