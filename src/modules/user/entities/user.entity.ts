import { SharedEntity } from '../../../shared/entities/shared.entity';
import { Column, Entity } from 'typeorm';

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
  avatar?: string;

  @Column()
  birthDate: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  fcmToken?: string;
}
