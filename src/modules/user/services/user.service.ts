import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from 'src/modules/auth/dtos/auth.dto';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { hash } from 'bcrypt';
import { Follower } from '../entities/follower.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(Follower) private followerRepo: Repository<Follower>,
  ) {}

  private logger = new Logger(UserService.name);

  async checkUsername(username: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (user) {
      throw new BadRequestException(`Username not available`);
    }

    return { status: 'Available' };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async create(data: SignUpDto): Promise<User> {
    if (data.email && data.phone) {
      throw new BadRequestException(
        "You can't register with both email and phone at the same time",
      );
    }

    const [user, usernameExist] = await Promise.all([
      this.userRepo.findOne({
        where: {
          ...(data.email && { email: data.email }),
          ...(data.phone && { phone: data.phone }),
        },
      }),
      this.findByUsername(data.username),
    ]);

    if (user && usernameExist) {
      throw new BadRequestException(
        `User with ${
          data.email ? 'email ' + data.email : 'phone ' + data.phone
        } ${usernameExist && 'and username ' + data.username} already exist `,
      );
    } else if (user) {
      throw new BadRequestException(
        `User with ${
          data.email ? 'email ' + data.email : 'phone ' + data.phone
        }  already exist `,
      );
    } else if (usernameExist) {
      throw new BadRequestException(
        `User with username ${data.username} already exist `,
      );
    }

    return this.userRepo.save(
      this.userRepo.create({
        ...data,
        birthDate: new Date(data.birthDate),
        password: await hash(data.password, 10),
      }),
    );
  }

  async manageFollow(
    follower: User,
    followeeUsername: string,
    follow = false,
  ): Promise<Follower | DeleteResult> {
    const followee = await this.userRepo.findOne({
      where: { username: followeeUsername },
    });

    if (!followee) {
      throw new BadRequestException(
        `User not found with username ${followeeUsername}`,
      );
    }

    const alreadyFollowing = await this.followerRepo.findOne({
      where: { followeeId: followee.id, followerId: follower.id },
    });

    if (follow) {
      if (alreadyFollowing) {
        throw new ConflictException(
          `You are already following ${followee.name}`,
        );
      }

      return this.followerRepo.save(
        this.followerRepo.create({
          followeeId: followee.id,
          followerId: follower.id,
        }),
      );
    } else {
      if (!alreadyFollowing) {
        throw new ConflictException(`You are not following ${followee.name}`);
      }

      return this.followerRepo.delete({ ...alreadyFollowing });
    }
  }
}
