import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    Param,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Patch()
    updateUserInfo(){
        //* 받을 정보: username, profileUrl, require2fa -> userInfoDto
        //TODO : 고려할 사항: null 이 아닌 값만 변경하는 식으로 변경?  or 하나씩 api 요청? or 그런 기능이 따로 있나?
    }
    @Get()
    @UseGuards(JwtAuthGuard) //볼 수 있는 권한 인증
    getProfile(@Param() id ) {
        //누구의 profile을 보고 싶은지 id로 조회.
        this.userService.findUserById(id);
        //줄 정보: username, profileUrl, exp, level,
    }

    @Get('/status')
    @UseGuards(JwtAuthGuard) //볼 수 있는 권한 인증
    getStatus(@Param() id){
       // TODO: 서로 친구인지 조회 필요
    }


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
