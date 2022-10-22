import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from 'src/modules/auth/dtos/auth.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) public userRepo: Repository<User>) {}

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
}
