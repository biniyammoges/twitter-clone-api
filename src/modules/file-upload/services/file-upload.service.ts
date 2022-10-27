import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { MinioService } from 'nestjs-minio-client';
import { Repository } from 'typeorm';
import { BufferedFile, File } from '../file.entity';

interface MinioClientInterface {
  upload: Function;
}

@Injectable()
export class FileUploadService implements MinioClientInterface {
  constructor(
    private minioSrv: MinioService,
    @InjectRepository(File) public fileRepo: Repository<File>,
  ) {}

  private defaultBucket = process.env.S3_BUCKET_NAME || 'media';
  private logger = new Logger(FileUploadService.name);

  private get client() {
    return this.minioSrv.client;
  }

  async upload(file: BufferedFile, bucket = this.defaultBucket): Promise<File> {
    let temp_filename = Date.now().toString();
    let hashedFileName = createHash('md5').update(temp_filename).digest('hex');
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    const metaData = {
      'Content-Type': file.mimetype,
      // 'X-Amz-Meta-Testing': 1234,
    };

    let filename = hashedFileName + ext;
    const fileName: string = `${filename}`;

    const fileBuffer = file.buffer;
    this.logger.debug('Uploading file to s3');
    this.client.putObject(
      bucket,
      filename,
      fileBuffer,
      metaData,
      (err, res) => {
        if (err) {
          console.log(err);
          throw new InternalServerErrorException('Error uploading file');
        } else this.logger.debug(`File ${file.originalname} uploaded `);
      },
    );

    const endPoint = process.env.S3_ENDPOINT;
    const port = process.env.S3_PORT;

    return this.fileRepo.save(
      this.fileRepo.create({
        name: fileName,
        path: `${bucket}/${filename}`,
        src: `${endPoint}:${port}/${bucket}/${filename}`,
        size: file.size,
        mimetype: file.mimetype,
      }),
    );
  }

  async delete(objectName: string, bucketName = this.defaultBucket) {
    return this.client.removeObject(objectName, bucketName, (err) => {
      if (err) throw new BadRequestException('Oops Something wrong happend');
    });
  }
}
