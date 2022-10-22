import {
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  Length,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ValidateIf((ld: LoginDto) => !ld.email && !ld.phone)
  @Length(3, 50)
  username?: string;

  @ValidateIf((ld: LoginDto) => !ld.username && !ld.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((ld: LoginDto) => !ld.email && !ld.username)
  @IsPhoneNumber()
  phone?: string;

  @Length(8, 30)
  password: string;
}

export class SignUpDto {
  @Length(3, 30)
  name: string;

  @Length(3, 30)
  username: string;

  @ValidateIf((sd: SignUpDto) => !sd.phone)
  @IsEmail()
  email: string;

  @ValidateIf((sd: SignUpDto) => !sd.email)
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  birthDate: Date;

  @Length(8, 30)
  password: string;
}

export type TokenResponse = {
  authToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  email: string;
  sub: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };
