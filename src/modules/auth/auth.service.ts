import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { toUserDto } from '../../global/functions';
import { IsNull, Not, UpdateResult } from 'typeorm';
import { BufferedFile, File } from '../file-upload/file.entity';
import { FileUploadService } from '../file-upload/services/file-upload.service';
import { UpdateUserDto, UserDto } from '../user/dtos/user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import {
  JwtPayload,
  LoginDto,
  SignUpDto,
  TokenResponse,
} from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userSrv: UserService,
    private jwtServ: JwtService,
    private fileSrv: FileUploadService,
  ) {}

  async validateUser(paylaod: JwtPayload, isRefresh = false) {
    const user = await this.userSrv.userRepo.findOne({
      where: {
        id: paylaod.sub,
        email: paylaod.email,
        ...(isRefresh && { refreshToken: Not(IsNull()) }),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token!');
    }

    return user;
  }

  async signupLocal(data: SignUpDto): Promise<TokenResponse> {
    const user = await this.userSrv.create(data);
    const tokens = await this.generateTokens({
      email: user.email,
      sub: user.id,
    });

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async signinLocal(data: LoginDto): Promise<TokenResponse> {
    const bothEmailAndPhone = !!data.email && !!data.phone;
    const bothUsernameAndPhone = !!data.username && !!data.phone;
    const bothEmailAndUsername = !!data.email && !!data.username;

    if (bothEmailAndPhone || bothUsernameAndPhone || bothEmailAndUsername) {
      throw new BadRequestException(
        `You can't login with both ${
          bothEmailAndPhone ? 'email and phone' : ''
        }${bothUsernameAndPhone ? 'username and phone' : ''}${
          bothEmailAndUsername ? 'username and email' : ''
        } at the same time`,
      );
    }

    const user = await this.userSrv.userRepo.findOne({
      where: {
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.username && { phone: data.username }),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!(await compare(data.password, user.password))) {
      throw new BadRequestException('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, rf: string) {
    const user = await this.userSrv.userRepo.findOneOrFail({
      where: { id: userId },
    });

    return this.userSrv.userRepo.save({
      ...user,
      refreshToken: await hash(rf, 10),
    });
  }

  async signOut(userId: string) {
    const user = await this.userSrv.userRepo.findOneOrFail({
      where: { id: userId },
    });

    if (!user.refreshToken) {
      throw new ConflictException('You are already logged out');
    }

    await this.userSrv.userRepo.save({ ...user, refreshToken: null });
  }

  async refreshAccessToken(payload: JwtPayload): Promise<TokenResponse> {
    const tokens = await this.generateTokens(payload);

    await this.updateRefreshToken(payload.sub, tokens.refreshToken);
    return tokens;
  }

  async generateTokens(paylaod: JwtPayload): Promise<TokenResponse> {
    const [authToken, refreshToken] = await Promise.all([
      this.jwtServ.signAsync(paylaod, {
        expiresIn: process.env.AUTH_TOKEN_EXPIRE,
        secret: process.env.AUTH_TOKEN_SECRET,
      }),
      this.jwtServ.signAsync(paylaod, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        secret: process.env.REFRESH_TOKEN_SECRET,
      }),
    ]);

    return { authToken, refreshToken };
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.userSrv.userRepo.findOne({ where: { id: userId } });
    return toUserDto(user);
  }

  async updateProfile(
    userId: string,
    data: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.userSrv.userRepo.update(userId, data);
  }

  async uploadProfilePhoto(user: User, data: BufferedFile, isAvatar = false) {
    let file: File;

    const deleteFile = async (id: string) => {
      await this.fileSrv.fileRepo.delete(id);
    };

    if (data) {
      if (!data.mimetype.startsWith('image'))
        throw new BadRequestException(
          `File type ${data.mimetype} is not allowed`,
        );

      file = await this.fileSrv.upload(data);
      await this.userSrv.userRepo.update(user.id, {
        ...(isAvatar ? { avatarId: file.id } : { coverId: file.id }),
      });

      // delete old files
      if (isAvatar && user.avatarId) deleteFile(user.avatarId);
      else if (!isAvatar && user.coverId) deleteFile(user.coverId);
    } else {
      if (isAvatar && !user.avatarId)
        throw new BadRequestException('Already no avatar photo');
      else if (!isAvatar && !user.coverId)
        throw new BadRequestException('Already no cover photo');

      await Promise.all([
        this.userSrv.userRepo.update(user.id, {
          ...(isAvatar ? { avatarId: null } : { coverId: null }),
        }),
        deleteFile(isAvatar ? user.avatarId : user.coverId),
      ]);
    }

    return data ? file : `deleted ${isAvatar ? 'avatar' : 'cover'} picture`;
  }
}
