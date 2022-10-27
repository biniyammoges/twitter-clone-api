import { UserDto } from 'src/modules/user/dtos/user.dto';
import { User } from 'src/modules/user/entities/user.entity';

export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  name: user.name,
  username: user.username,
  birthDate: user.birthDate,
  phone: user.phone,
  email: user.email,
  bio: user.bio,
  location: user.location,
  website: user.website,
  avatar: user.avatar,
  avatarId: user.avatarId,
  cover: user.cover,
  coverId: user.coverId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
