import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../src/modules/user/user.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ds } from '../src/typeorm-ds';
import { AppModule } from '../src/app.module';

describe('Authentication', () => {
  let app: INestApplication;

  beforeAll(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forRoot(ds)],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('User should be able to login /POST', async () => {
    const res = request(app.getHttpServer())
      .post('/auth/signup/local')
      .expect(HttpStatus.BAD_REQUEST);
  });
});
