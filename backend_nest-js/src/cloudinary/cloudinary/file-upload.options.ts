import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import multer from 'multer';

export const fileUploadOptions: MulterModuleOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'pdf',
      'doc',
      'docx',
    ];
    const fileExtension = file.originalname
      .split('.')
      .pop()
      ?.toLowerCase() as string;
    if (!allowedFileTypes.includes(fileExtension)) {
      return cb(
        new HttpException('Invalid file type', HttpStatus.UNPROCESSABLE_ENTITY),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
};
