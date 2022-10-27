import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [JwtModule.register({}), UserModule, FileUploadModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
