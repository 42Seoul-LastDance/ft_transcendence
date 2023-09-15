import {
    Controller,
    Get,
    Param,
    UseGuards,
    Patch,
    Post,
    Req,
    Body,
    UseInterceptors,
    UploadedFile,
    Res,
    NotFoundException,
    InternalServerErrorException,
    ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { JwtAccessGuard } from 'src/auth/jwtAccess.guard';
import { UserInfoDto } from './dto/userInfo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { extname } from 'path';

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
    // @UseGuards(JwtAccessGuard)
    @UseInterceptors(FileInterceptor('image_url'))
    async signupUser(@UploadedFile() file: Express.Multer.File) {
        //신규 유저 생성
        console.log('in signupUser');
        console.log(file.filename);
        // await this.userService.registerUser(req.authDto, userInfoDto);
    }

    @Get('/profile/:id')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('id', ParseIntPipe) id: number) {
        //누구의 profile을 보고 싶은지 id로 조회.
        return await this.userService.getUserProfile(id);
        //TODO: 줄 정보: username, profileUrl, exp, level,
    }

    @Get('/profileImg/:id')
    @UseGuards(JwtAuthGuard)
    async getProfileImage(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const { image, mimeType } =
                await this.userService.getUserProfileImage(id);
            res.setHeader('Content-Type', mimeType); // 이미지의 MIME 타입 설정
            res.send(image); // 이미지 파일을 클라이언트로 전송
        } catch (error) {
            if (error.getStatus() == 404) throw new NotFoundException();
            else throw new InternalServerErrorException();
        }
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
