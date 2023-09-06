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

        res.cookie('access_token', token, {
            httpOnly: true,
            maxAge: 2592000000,
            sameSite: true,
            secure: false,
        });

        res.status(HttpStatus.OK);
        //TODO: main page 로 redirect
        return res.redirect('/auth/cookie-check');
    }

    @Get('cookie-check')
    checkCooke(@Req() req){
        console.log(req);
    }

}
