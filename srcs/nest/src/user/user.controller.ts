import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    Param,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // @Get()
    // findAll(): Promise<User[]> {
    //     return this.userService.findAll();
    // }


    // @Post()
    // @UsePipes(ValidationPipe)
    // async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    //     return this.userService.createUser(createUserDto);
    // }

    // @Get('searchOne')
    // async searchOne(@Query('name') name: string): Promise<User> {
    //     return this.userService.searchOne(name);
    // }

    // @Get('searchUser')
    // async searchUser(@Query('slackId') slackId: string): Promise<User[]> {
    //     return this.userService.getUserListBySlackId(slackId);
    // }

    // @Delete('deleteOne/:id')
    // async deleteOne(@Param('id') id: number): Promise<void> {
    //     await this.userService.deleteOne(id);
    // }
}
