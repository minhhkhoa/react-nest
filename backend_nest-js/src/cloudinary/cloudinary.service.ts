import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resume', //- lưu vào folder resume trên cloud
          resource_type: 'auto', //- tự động biết kiểu mở rộng của file
          access_mode: 'public', //- Cho phép public link
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve(result as CloudinaryResponse);
          } else {
            reject(new Error('Upload failed with no result'));
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
