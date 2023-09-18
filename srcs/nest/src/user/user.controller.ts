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
	BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { JwtEnrollGuard } from 'src/auth/jwtEnroll.guard';
import { UserInfoDto } from './dto/userInfo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { extname } from 'path';
import { UserProfileDto } from './dto/userProfile.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

//* user signup

    @Post('/signup')
    @UseGuards(JwtEnrollGuard)
    async signup(@Req() req) {
        await this.userService.registerUser(req.authDto);
    }

    @Patch('/signup/username')
    @UseGuards(JwtEnrollGuard)
    async signupUsername(@Req() req, @Body('username') username: string) {
        const user = await this.userService.getUserByUsername(username);
        if (user)
            throw new BadRequestException('already used username');
        await this.userService.updateUsernameBySlackId(req.authDto.slackId, username);
    }

    //*프론트에서 이거 안한대
    // @Patch('/signup/2fa')
    // @UseGuards(JwtEnrollGuard)
    // async signupUser2fa(@Req() req, @Body('2fa') is2fa: boolean) {
    //     await this.userService.update2faConfBySlackId(req.authDto.slackId, is2fa);
    // }

    //TODO: null일 수 도 있다
    @Patch('/signup/profileImage')
    @UseGuards(JwtEnrollGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    async signupProfileImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
        await this.userService.updateProfileImageBySlackId(req.authDto.slackId, file.filename);
    }
    
//* user info update
    @Patch('/update/username')
    @UseGuards(JwtAuthGuard)
    async updateUsername(@Req() req, @Body('username') username: string ) {
    const user = await this.userService.getUserByUsername(username);
    if (user)
        throw new BadRequestException('already used username');
    await this.userService.updateUsernameBySlackId(req.user.slackId, username);
    }

    @Patch('/update/2fa')
    @UseGuards(JwtAuthGuard)
    async updateUser2fa(@Req() req, @Body('2fa') is2fa: boolean) {
        await this.userService.update2faConfBySlackId(req.user.slackId, is2fa);
    }

    @Patch('/update/username')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image_url'))
    async updateProfileImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
        await this.userService.updateProfileImageBySlackId(req.user.slackId, file.filename);
    }

    @Get('/profile/:id')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('id', ParseIntPipe) id: number, @Res() res) {
        //누구의 profile을 보고 싶은지 id로 조회.
        const userProfile: UserProfileDto = await this.userService.getUserProfile(id);
        return res.status(200).json(userProfile);
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

    @Get('/username/:name')
    // @UseGuards(JwtAuthGuard) // TODO : enroll 과 accesstoken 분리 필요
    async checkUniqueName(@Param('name') name: string, @Res() res: Response) {
        try {
            console.log(`checking name : ${name}`);
            const user = await this.userService.getUserByUsername(name);
            if (user) throw new BadRequestException('username exist');
        } catch (error) {
            if (error.getStatus() == 404) res.send('OK');
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
