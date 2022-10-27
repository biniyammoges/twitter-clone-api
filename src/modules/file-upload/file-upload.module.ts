import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from 'nestjs-minio-client';
import { File } from './file.entity';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadSubscriber } from './services/file-upload.subscriber';

@Module({
  imports: [
    MinioModule.registerAsync({
      useFactory: () => ({
        endPoint: '172.18.0.3',
        port: 9000, // +process.env.S3_PORT,
        useSSL: process.env.APP_ENV === 'prod',
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
      }),
    }),
    TypeOrmModule.forFeature([File]),
  ],
  providers: [FileUploadService, FileUploadSubscriber],
  exports: [FileUploadModule, FileUploadService],
})
export class FileUploadModule {}
