import { SharedEntity } from '../../../shared/entities/shared.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follower extends SharedEntity {
  @Column()
  followerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followeeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'followeeId' })
  followee: User;
}
