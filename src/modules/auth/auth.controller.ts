import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/shared/decorators/current-user.decorator';
import { IsPublic } from 'src/shared/decorators/public.decorator';
import { UserDto } from '../user/dtos/user.dto';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, TokenResponse } from './dtos/auth.dto';
import { JwtRefreshGuard } from './gurads/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authServ: AuthService) {}

  @IsPublic()
  @Post('signup/local')
  @HttpCode(HttpStatus.CREATED)
  async signUpLocal(@Body() signUpDto: SignUpDto): Promise<TokenResponse> {
    return this.authServ.signupLocal(signUpDto);
  }

  @IsPublic()
  @Post('signin/local')
  @HttpCode(HttpStatus.OK)
  async signInLocal(@Body() signInDto: LoginDto): Promise<TokenResponse> {
    return this.authServ.signinLocal(signInDto);
  }

  @Get('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@GetUser('id') userId: string): Promise<void> {
    return this.authServ.signOut(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @IsPublic()
  @Get('refresh-access-token')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@GetUser() user: User): Promise<TokenResponse> {
    return this.authServ.refreshAccessToken({
      sub: user.id,
      email: user.email,
    });
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@GetUser('id') userId: string): Promise<UserDto> {
    return this.authServ.getProfile(userId);
  }
}
