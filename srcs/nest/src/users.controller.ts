import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<Users[]> {
    return this.usersService.findAll();
  }

  @Post('addOne')
  async addOne(@Body() user: Users): Promise<Users> {
    return this.usersService.addOne(user);
  }

  @Get('searchOne')
  async searchOne(@Query('name') name: string): Promise<Users> {
    return this.usersService.searchOne(name);
  }

  @Get('searchUsers')
  async searchUsers(@Query('name') name: string): Promise<Users[]> {
    return this.usersService.searchUsers(name);
  }

  @Delete('deleteOne/:id')
  async deleteOne(@Param('id') id: number): Promise<void> {
    await this.usersService.deleteOne(id);
  }
}
