import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  DataSource,
  RemoveEvent,
} from 'typeorm';
import { File } from '../file.entity';
import { FileUploadService } from './file-upload.service';

@EventSubscriber()
export class FileUploadSubscriber implements EntitySubscriberInterface<File> {
  private logger = new Logger(FileUploadService.name);

  constructor(
    @InjectDataSource() ds: DataSource,
    private fileServ: FileUploadService,
  ) {
    ds.subscribers.push(this);
  }

  listenTo(): string | Function {
    return File;
  }

  beforeRemove(event: RemoveEvent<File>): Promise<any> {
    if (!(event.entity instanceof File)) {
      return;
    }

    const objName = event.entity.path.split('/')[1];
    const bucketName = event.entity.path.split('/')[0];

    // todo - Add remove file here
    this.logger.debug('Removing file from s3');
    this.fileServ.delete(objName, bucketName);
    this.logger.debug(event.entity);
  }
}
