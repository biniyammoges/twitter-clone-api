import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { toUserDto } from 'src/global/functions';
import { IsNull, Not } from 'typeorm';
import { UserDto } from '../user/dtos/user.dto';
import { UserService } from '../user/services/user.service';
import {
  JwtPayload,
  LoginDto,
  SignUpDto,
  TokenResponse,
} from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private userSrv: UserService, private jwtServ: JwtService) {}

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
}
