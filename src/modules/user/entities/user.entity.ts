import { SharedEntity } from '../../../shared/entities/shared.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { File } from 'src/modules/file-upload/file.entity';

@Entity()
export class User extends SharedEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, unique: true })
  phone?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  avatarId?: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn({ name: 'avatarId' })
  avatar?: File;

  @Column({ nullable: true })
  coverId?: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn({ name: 'coverId' })
  cover?: File;

  @Column()
  birthDate: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  fcmToken?: string;
}
