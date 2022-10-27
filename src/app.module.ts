import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';

import { globalConfig } from './config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/gurads/at.guard';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { FileUploadModule } from './modules/file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '.env.local',
        `.env.${process.env.APP_ENV}`,
        `.env.${process.env.APP_ENV}.local`,
      ],
      load: [globalConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const module = await import('./typeorm-ds');
        return module.ds;
      },
    }),
    UserModule,
    AuthModule,
    FileUploadModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
