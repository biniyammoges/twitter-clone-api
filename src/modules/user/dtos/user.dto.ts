export type UserDto = {
  id: string;
  name: string;
  username: string;
  phone?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
};
