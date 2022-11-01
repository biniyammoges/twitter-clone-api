import { IsDate, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { File } from 'src/modules/file-upload/file.entity';

export type UserDto = {
  id: string;
  name: string;
  username: string;
  phone?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: File;
  avatarId?: string;
  cover?: File;
  coverId?: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class UpdateUserDto {
  @Length(3, 30)
  name: string;

  @IsOptional()
  @Length(1, 160)
  bio?: string;

  @Length(1, 30)
  location?: string;

  @Length(1, 100)
  @IsUrl()
  @IsOptional()
  website?: string;

  @IsDate()
  birthDate: Date;
}

export class SearchUserDto {
  @IsString()
  keyword: string;
}
