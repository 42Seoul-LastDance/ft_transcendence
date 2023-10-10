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
    BadRequestException,
    ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UserProfileDto } from './dto/userProfile.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    //* user signup

    // @Post('/signup')
    // // @UseGuards(JwtEnrollGuard)
    // @UseInterceptors(FileInterceptor('profileImage'))
    // async signup(
    //     // @Req() req,
    //     // @Res() res: Response,
    //     @UploadedFile() profileImage: Express.Multer.File, // TODO -> 테스트 필요 : 프론트에서 파일을 Body에 묶어서 보낼 수 있는지 확인
    //     @Body('') : string, // * -> 프론트에서 Content-type 헤더를 multipart/form-data 로 설정하면 된다네요 by GPT ->great!!!
    // ) {
    //     const user = await this.userService.getUserByUserName();
    //     if (user) throw new BadRequestException('already used ');

    //     console.log(, profileImage.filename);
    //     //* authDto, , imageUrl 필요
    //     // await this.userService.registerUser(
    //     //     req.authDto,
    //     //     ,
    //     //     profileImage.filename,
    //     // );
    //     // res.clearCookie('enroll_token');

    //     // return res.redirect(process.env.FRONT_URL + '/main');
    // }

    // @Patch('/signup/')
    // @UseGuards(JwtEnrollGuard)
    // async signupuserName(@Req() req, @Body('') : string) {
    //     const user = await this.userService.getUserByUserName();
    //     if (user) throw new BadRequestException('already used ');
    //     await this.userService.updateuserNameBySlackId(
    //         req.authDto.slackId,
    //         ,
    //     );
    // }

    // //TODO: null일 수 도 있다
    // @Patch('/signup/profileImage')
    // @UseGuards(JwtEnrollGuard)
    // @UseInterceptors(FileInterceptor('profileImage'))
    // async signupProfileImage(
    //     @Req() req,
    //     @UploadedFile() file: Express.Multer.File,
    // ) {
    //     await this.userService.updateProfileImageBySlackId(
    //         req.authDto.slackId,
    //         file.filename,
    //     );
    // }

    //TODO user info update 하나로 합치기
    //* user info update ===============================================================
    @Patch('/update/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateUserInfo(
        @Req() req,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
        @Body('profileImage') @UploadedFile() profileImage: Express.Multer.File,
        @Body('userName') userName: string,
    ) {}

    @Patch('/update/:userName')
    @UseGuards(JwtAuthGuard)
    async updateUserName(@Req() req, @Param('userName') userName: string) {
        const user = await this.userService.getUserByUserName(userName);
        if (user) throw new BadRequestException('already used ');
        await this.userService.updateUserNameBySlackId(req.user.slackId, userName);
    }

    @Patch('/update/tfa')
    @UseGuards(JwtAuthGuard)
    async updateUser2fa(@Req() req, @Body('2fa') is2fa: boolean) {
        await this.userService.update2faConfBySlackId(req.user.slackId, is2fa);
    }

    @Patch('/update/profileImage')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image_url'))
    async updateProfileImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
        await this.userService.updateProfileImageBySlackId(req.user.slackId, file.filename);
    }
    //* EOF user info update ===============================================================

    @Get('/profile/:username')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('username') username: string, @Res() res) {
        //누구의 profile을 보고 싶은지 id로 조회.
        // * 무조건 있는 유저를 조회하긴 할텐데, userProfile도 검사 한 번 하는게 좋지 않을까요?
        const userProfile: UserProfileDto = await this.userService.getUserProfile(username);
        return res.status(200).json(userProfile);
    }

    @Get('/profileImg/:username')
    @UseGuards(JwtAuthGuard)
    async getProfileImage(@Res() res: Response, @Param('username') username: string) {
        try {
            const { image, mimeType } = await this.userService.getUserProfileImage(username);
            res.setHeader('Content-Type', mimeType); // 이미지의 MIME 타입 설정
            res.send(image); // 이미지 파일을 클라이언트로 전송
        } catch (error) {
            if (error.getStatus() == 404) throw new NotFoundException();
            else throw new InternalServerErrorException();
        }
    }

    @Get('/:name')
    // @UseGuards(JwtAuthGuard) // TODO : enroll 과 accesstoken 분리 필요 -> 중복체크는 가드 없이 그냥 쓰는걸로 하자~
    async checkUniqueName(@Param('name') name: string, @Res() res: Response) {
        let user;
        try {
            console.log(`checking name : ${name}`);
            user = await this.userService.getUserByUserName(name);
        } catch (error) {
            if (error.getStatus() == 404) throw new NotFoundException('no such user');
            else throw new InternalServerErrorException();
        }
        if (user) throw new BadRequestException(`${name} already exist`);
    }

    @Get('/status/:id')
    @UseGuards(JwtAuthGuard)
    getStatus(@Param() id) {
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
