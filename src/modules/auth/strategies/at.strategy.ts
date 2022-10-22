import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../dtos/auth.dto';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_TOKEN_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(paylaod: JwtPayload) {
    return this.authService.validateUser(paylaod);
  }
}
