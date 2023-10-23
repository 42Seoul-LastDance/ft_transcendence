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

    @Patch('/update')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateUserInfo(
        @Req() req,
        @Res() res: Response,
        @UploadedFile() profileImage: Express.Multer.File | undefined,
        @Body('userName') userName: string | undefined,
        @Body('require2fa') require2fa: string,
    ) {
        try {
			let require : boolean;
            console.log('update', userName, require2fa, profileImage?.filename);
            if (require2fa === 'true')
                require = true;
            else
                require = false;
            await this.userService.updateUserInfo(req.user.sub, userName, require, profileImage);
            this.logger.log('api done!');

            const user = await this.userService.findUserById(req.user.sub);
            console.log('user after end api:', user);

            return res.sendStatus(200);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: updateUserInfo', error);
            if (error.status === 500) res.sendStatus(500);
            return res.status(400).send({ reason: 'updateUserInfo failed' });
        }
    }

    @Get('/userInfo')
    @UseGuards(JwtAuthGuard)
    async getUserSetInfo(@Req() req, @Res() res: Response) {
        try {
			const userSetting = await this.userService.getUserSetInfo(req.user.sub);
            this.logger.log('userInfo endpoint!!!!! 불림', userSetting);
            return res.status(200).json(userSetting);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getUserSetInfo', error);
            if (error.status === 500) res.sendStatus(500);
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
            if (error.status === 500) res.sendStatus(500);
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
            return res.send(image); // 이미지 파일을 클라이언트로 전송
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getProfileImage', error);
            if (error.status === 500) res.sendStatus(500);
            return res.status(400).send({ reason: 'getProfileImage failed' });
        }
    }

    @Post('/exist/')
    @UseGuards(JwtAuthGuard)
    async checkIfExists(@Res() res: Response, @Body('slackId') slackId: string) {
        this.logger.debug('user/exists/ called.');
        try {
            const user: User = await this.userService.getUserBySlackId(slackId);
            this.logger.debug('user' , user);
            if (user) {
                return res.sendStatus(200);
            }
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: checkIfExists', error);
            if (error.status === 500) res.sendStatus(500);
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
            if (error.status === 500) res.sendStatus(500);
            //* this is not error
            return res.sendStatus(200);
        }
    }
}
