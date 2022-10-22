import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserService } from '../../user/services/user.service';
import { AuthService } from '../auth.service';
import { JwtPayload, LoginDto, SignUpDto } from '../dtos/auth.dto';
import { userFixture } from './fixtures/user.fixture';

const mockUserService = () => ({
  userRepo: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
  },
  create: jest.fn(),
});

const mockJwtService = () => ({ signAsync: jest.fn() });
const users = userFixture();

describe('Auth service', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtServcice: JwtService;

  beforeEach(async () => {
    let module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userService = await module.get<UserService>(UserService);
    jwtServcice = await module.get<JwtService>(JwtService);
  });

  describe('validate user', () => {
    it('should return user', async () => {
      expect(userService.userRepo.findOne).not.toHaveBeenCalled();
      const paylaod: JwtPayload = { email: users[0].email, sub: users[0].id };
      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(users[0]);

      const result = await authService.validateUser(paylaod);
      expect(userService.userRepo.findOne).toHaveBeenCalled();
      expect(result.email).toEqual(paylaod.email);
    });

    it('should return Unauthorized', async () => {
      expect(userService.userRepo.findOne).not.toHaveBeenCalled();
      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(undefined);
      const paylaod: JwtPayload = { email: users[0].email, sub: users[0].id };

      expect(authService.validateUser(paylaod)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.userRepo.findOne).toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('return new user', async () => {
      const signupDto: SignUpDto = {
        birthDate: users[0].birthDate,
        email: users[0].email,
        name: users[0].name,
        password: '12346578',
        username: users[0].username,
        phone: users[0].phone,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(users[0]);
      jest
        .spyOn(jwtServcice, 'signAsync')
        .mockResolvedValue('JWT_generated_token');
      const result = await authService.signupLocal(signupDto);

      expect(jwtServcice.signAsync).toHaveBeenCalled();
      expect(result.authToken).toEqual('JWT_generated_token');
      expect(result.refreshToken).toEqual('JWT_generated_token');
    });
  });

  describe('signin', () => {
    it('return tokens', async () => {
      let signInDto: LoginDto = {
        email: users[0].email,
        password: '12345678',
      };

      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(users[0]);
      jest
        .spyOn(jwtServcice, 'signAsync')
        .mockResolvedValue('JWT_generated_token');

      const result = await authService.signinLocal(signInDto);

      expect(jwtServcice.signAsync).toHaveBeenCalled();
      expect(result.authToken).toEqual('JWT_generated_token');
      expect(result.refreshToken).toEqual('JWT_generated_token');
    });

    it('throw error if user not found', async () => {
      let signInDto: LoginDto = {
        email: users[0].email,
        password: '12345678',
      };

      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(null);

      expect(authService.signinLocal(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throw error if both username and email are provided', async () => {
      let signInDto: LoginDto = {
        email: users[0].email,
        password: '12345678',
        username: 'sdfsdf',
      };

      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(users[0]);
      jest
        .spyOn(jwtServcice, 'signAsync')
        .mockResolvedValue('JWT_generated_token');

      expect(authService.signinLocal(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throw error if both phone and email are provided', async () => {
      let signInDto: LoginDto = {
        email: users[0].email,
        phone: users[0].phone,
        password: '12345678',
      };

      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(users[0]);
      jest
        .spyOn(jwtServcice, 'signAsync')
        .mockResolvedValue('JWT_generated_token');

      expect(authService.signinLocal(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throw error if password is wrong', async () => {
      let signInDto: LoginDto = {
        email: users[0].email,
        password: 'wrongPassword',
      };

      jest.spyOn(userService.userRepo, 'findOne').mockResolvedValue(users[0]);
      jest
        .spyOn(jwtServcice, 'signAsync')
        .mockResolvedValue('JWT_generated_token');

      expect(authService.signinLocal(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
