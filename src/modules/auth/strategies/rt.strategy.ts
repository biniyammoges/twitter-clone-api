import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compare } from 'bcrypt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayloadWithRt } from '../dtos/auth.dto';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authServ: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: any, paylaod: JwtPayloadWithRt) {
    const user = await this.authServ.validateUser(paylaod, true);
    const refreshToken = req.headers.authorization.split(' ')[1];

    const isRefreshMatch = await compare(refreshToken, user.refreshToken);

    if (!isRefreshMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
