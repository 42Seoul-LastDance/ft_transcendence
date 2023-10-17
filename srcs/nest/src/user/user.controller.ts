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
    Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UserProfileDto } from './dto/userProfile.dto';

@Controller('users')
export class UserController {
    private logger = new Logger(UserController.name);
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

    //TODO user info update 하나로 합치기 => 테스트 필요
    //* user info update ===============================================================
    @Patch('/update/')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateUserInfo(
        @Req() req,
        @Res() res: Response,
        @Body('profileImage') @UploadedFile() profileImage: Express.Multer.File | undefined,
        @Body('userName') userName: string | undefined,
        @Body('require2fa') require2fa: boolean | undefined,
    ) {
        console.log('update', userName, require2fa, profileImage?.filename);
        await this.userService.updateUserInfo(req.user.sub, userName, require2fa, profileImage);
    }

    // @Patch('/update/:userName')
    // @UseGuards(JwtAuthGuard)
    // async updateUserName(@Req() req, @Param('userName') userName: string) {
    //     const user = await this.userService.getUserByUserName(userName);
    //     if (user) throw new BadRequestException('already used ');
    //     await this.userService.updateUserNameBySlackId(req.user.slackId, userName);
    // }

    // @Patch('/update/tfa')
    // @UseGuards(JwtAuthGuard)
    // async updateUser2fa(@Req() req, @Body('2fa') is2fa: boolean) {
    //     await this.userService.update2faConfBySlackId(req.user.slackId, is2fa);
    // }

    // @Patch('/update/profileImage')
    // @UseGuards(JwtAuthGuard)
    // @UseInterceptors(FileInterceptor('image_url'))
    // async updateProfileImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
    //     await this.userService.updateProfileImageBySlackId(req.user.slackId, file.filename);
    // }
    //* EOF user info update ===============================================================

    @Get('/userInfo')
    @UseGuards(JwtAuthGuard)
    async getUserSetInfo(@Req() req, @Res() res: Response) {
        try {
            const userSetting = await this.userService.getUserSetInfo(req.user.sub);
            return res.status(200).json(userSetting);
        } catch (error) {
            //TODO front에 어떻게 보내줘야 하지? (프론트와 함께 고민 필요)
            return res.status(200).json(['sth happened from back... sorry']);
        }
    }

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
            this.logger.error(`Failed to send profile image : ${error}`);
            if (error.status === 404) throw new NotFoundException();
            else throw new InternalServerErrorException();
        }
    }

    @Get('/username/:name')
    @UseGuards(JwtAuthGuard)
    async checkUniqueName(@Param('name') name: string, @Res() res: Response) {
        try {
            // console.log(`checking name : ${name}`);
            const user = await this.userService.getUserByUserName(name);
            if (user) throw new BadRequestException(`${name} already exist`);
            res.sendStatus(200);
        } catch (error) {
            if (error.getStatus() == 404) res.sendStatus(200);
            else throw new InternalServerErrorException();
        }
    }
}
