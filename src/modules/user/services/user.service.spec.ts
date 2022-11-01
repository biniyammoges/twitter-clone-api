import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ds } from '../../../typeorm-ds';
import { AppModule } from '../../../app.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forRoot({ ...ds })],
    }).compile();
    userService = await moduleRef.get<UserService>(UserService);
  });

  describe('FollowUser', () => {
    // const result = await userService.manageFollow()
    it('should be true', () => {
      expect(2 + 1).toEqual(3);
      expect(userService).toBeDefined();
    });
  });
});
