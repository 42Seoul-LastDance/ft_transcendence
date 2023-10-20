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
import { User } from './user.entity';

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
    @Patch('/update')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateUserInfo(
        @Req() req,
        @Res() res: Response,
        @UploadedFile() profileImage: Express.Multer.File | undefined,
        @Body('userName') userName: string | undefined,
        @Body('require2fa') require2fa: boolean | undefined,
        @Body() body,
    ) {
        try {
            console.log(body);
            console.log('update', userName, require2fa, profileImage?.filename);
            await this.userService.updateUserInfo(req.user.sub, userName, require2fa, profileImage);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: updateUserInfo', error);
            return res.status(400).send({ reason: 'updateUserInfo failed' });
        }
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
            //ERROR HANDLE
            console.log('[ERROR]: getUserSetInfo', error);
            return res.status(400).send({ reason: 'getUserSetInfo failed' });
        }
    }

    @Get('/profile/:slackId')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('slackId') slackId: string, @Res() res) {
        try {
            //누구의 profile을 보고 싶은지 id로 조회.
            // * 무조건 있는 유저를 조회하긴 할텐데, userProfile도 검사 한 번 하는게 좋지 않을까요?
            //TODO 존재하는 유저인지 확인 필요
            const userProfile: UserProfileDto = await this.userService.getUserProfile(slackId);
            return res.status(200).json(userProfile);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getProfile', error);
            return res.status(400).send({ reason: 'getProfile failed' });
        }
    }

    @Get('/profileImg/:slackId')
    @UseGuards(JwtAuthGuard)
    async getProfileImage(@Res() res: Response, @Param('slackId') slackId: string) {
        try {
            //getUserProfileImage에서 존재하는 유저인지 확인함 (juhoh)
            const { image, mimeType } = await this.userService.getUserProfileImage(slackId);
            if (image === undefined || mimeType === undefined) return;
            res.setHeader('Content-Type', mimeType); // 이미지의 MIME 타입 설정
            res.send(image); // 이미지 파일을 클라이언트로 전송
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getProfileImage', error);
            return res.status(400).send({ reason: 'getProfileImage failed' });
        }
    }

    @Post('/exist/')
    @UseGuards(JwtAuthGuard)
    async checkIfExists(@Res() res: Response, @Body('slackId') slackId: string) {
        try {
            const user: User = await this.userService.getUserBySlackId(slackId);
            if (user) {
                return res.sendStatus(200);
            }
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: checkIfExists', error);
            return res.status(400).send({ reason: 'checkIfExists failed' });
        }
    }

    @Post('/username/')
    @UseGuards(JwtAuthGuard)
    async checkUniqueName(@Body('name') name: string, @Res() res: Response) {
        try {
            // console.log(`checking name : ${body.name}`);
            const user = await this.userService.getUserByUserName(name);
            if (user) {
                console.log('[ERROR]: checkUniqueName');
                return res.status(400).send({ reason: 'checkUniqueName failed: already in DB' });
            }
        } catch (error) {
            //* this is not error
            return res.sendStatus(200);
        }
    }
}
