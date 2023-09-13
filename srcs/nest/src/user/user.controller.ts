import {
    Controller,
    Get,
    Param,
    UseGuards,
    Patch,
    Post,
    Req,
    Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { JwtAccessGuard } from 'src/auth/jwtAccess.guard';
import { UserInfoDto } from './dto/userInfo.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    //@Pipe //body에 userInfoDto 확인?
    @Patch('/updateUserInfo')
    @UseGuards(JwtAuthGuard)
    async updateUserInfo(@Req() req, @Body() userInfoDto: UserInfoDto) {
        //* 받을 정보: username, profileUrl, require2fa -> userInfoDto
        //* null 이 아닌 값만 업데이트
        await this.userService.updateUserInfo(req.user.id, userInfoDto);
    }

    @Post('/signupUser')
    @UseGuards(JwtAccessGuard)
    async signupUser(@Req() req, @Body() userInfoDto: UserInfoDto) {
        //신규 유저 생성
        console.log('in signupUser');
        await this.userService.registerUser(req.authDto, userInfoDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param() id) {
        //누구의 profile을 보고 싶은지 id로 조회.
        await this.userService.findUserById(id);
        //TODO: 줄 정보: username, profileUrl, exp, level,
    }

    // @Get('/status')
    // @UseGuards(JwtAuthGuard)
    // getStatus(@Param() id) {
    //     // TODO: 서로 친구인지 조회 필요
    // }

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
