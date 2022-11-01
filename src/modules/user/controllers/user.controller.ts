import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { GetUser } from '../../../shared/decorators/current-user.decorator';
import { UsernameDto } from '../dtos/follower.dto';
import { SearchUserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private userSrv: UserService) {}

  @Patch(':username/follow')
  async followUser(@GetUser() user: User, @Param() param: UsernameDto) {
    return this.userSrv.manageFollow(user, param.username, true);
  }

  @Patch(':username/unfollow')
  async unFollowUser(@GetUser() user: User, @Param() param: UsernameDto) {
    return this.userSrv.manageFollow(user, param.username, false);
  }

  @Get('search')
  async searchUser(@Query() query: SearchUserDto) {}

  @Get(':username')
  async findUserByUsername(@Param() param: UsernameDto): Promise<User | null> {
    return this.userSrv.findByUsername(param.username);
  }
}
