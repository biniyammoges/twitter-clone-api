import * as request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/auth.module';
import { HttpStatus } from '@nestjs/common';

describe('Authentication', async () => {
  let app: NestApplication;

  beforeAll(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
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
