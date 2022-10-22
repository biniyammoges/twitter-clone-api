import { hashSync } from 'bcrypt';
import { User } from '../../../user/entities/user.entity';

export function userFixture(): Array<User> {
  return [
    {
      id: '1',
      name: 'Biniyam Moges',
      email: 'bini@gmail.com',
      birthDate: new Date(),
      username: 'biniyammoges',
      phone: '+2519955306094',
      createdAt: new Date(),
      password: hashSync('12345678', 10),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Elias Sisay',
      email: 'ela@gmail.com',
      birthDate: new Date(),
      username: 'biniyammoges',
      phone: '+2519955306094',
      createdAt: new Date(),
      password: hashSync('12345678', 10),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Sofi Gizaw',
      email: 'sofi@gmail.com',
      birthDate: new Date(),
      username: 'biniyammoges',
      phone: '+2519955306094',
      createdAt: new Date(),
      password: hashSync('12345678', 10),
      updatedAt: new Date(),
    },
  ];
}
