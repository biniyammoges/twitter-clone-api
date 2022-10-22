import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsPublic } from 'src/shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, TokenResponse } from './dtos/auth.dto';

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
}
