import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserInfoDto } from './dto/user-info.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    // @Post()
    // async createUser(@Body() createUserDto: CreateUserDto): User {
    //     return this.userService.createUser(createUserDto);
    // }

    @Get('searchOne')
    async searchOne(@Query('name') name: string): Promise<User> {
        return this.userService.searchOne(name);
    }

    @Get('searchUser')
    async searchUser(@Query('slackId') slackId: string): Promise<User[]> {
        return this.userService.getUserListByFistSlackId(slackId);
    }

    @Delete('deleteOne/:id')
    async deleteOne(@Param('id') id: number): Promise<void> {
        await this.userService.deleteOne(id);
    }
}
