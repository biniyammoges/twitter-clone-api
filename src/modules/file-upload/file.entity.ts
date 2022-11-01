import { SharedEntity } from '../../shared/entities/shared.entity';
import { Column, Entity } from 'typeorm';

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer | string;
}

@Entity()
export class File extends SharedEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column()
  src?: string;

  @Column()
  mimetype: string;
}
