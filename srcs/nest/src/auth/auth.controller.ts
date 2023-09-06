import {
    Controller,
    Get,
    HttpStatus,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { FortytwoAuthGuard } from './fortytwo.guard';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @Get('/42login')
    @UseGuards(FortytwoAuthGuard)
    async login() {
        //실패하면 이쪽으로 오나..?
        console.log('42 login called');
        return 'success';
    }

    @Get('/callback')
    @UseGuards(FortytwoAuthGuard)
    async callBack(@Req() req, @Res() res: Response) {
        console.log('callback 함수 호출');

        const token = await this.authService.signIn(req.user);

        //TODO: refresh token 이 만들어지는 부분이 없는데 jwtService 에서 주는지 확인 -> signAsync 함수사용
        console.log('token: ', token);

        res.cookie('access_token', token, {
            httpOnly: true,
            maxAge: 2592000000,
            sameSite: true,
            secure: false,
        });

        //? controller 에서 리다이렉션으로 main을 줘야 하나?
        res.status(HttpStatus.OK);
        // console.log('res', res);
        //TODO main page 로 redirect할지 아니면 쿠키만 셋해서 ok 보낼지 결정
        return res.redirect('/auth/cookie-check');
    }
}
