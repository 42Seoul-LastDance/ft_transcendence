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
import { RegenerateJwtGuard } from './regenerate-auth.guard';
// import { JwtAuthGuard } from './jwtAuth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    // @Get('/login')
    // @UseGuards()
    // async login() {
    //     // 이미 클라이언트가 유효한 access token(jwt)을 소유하고 있는지  -> front에서 메인페이지 접속 요청하면 확인 후 redirect
    //     // 아니라면 /auth/42login 이동 시켜서 로그인 or 회원가입
    //     // 소유하고 있다면 바로 메인으로 이동시키기
    // }

    @Get('/42login')
    @UseGuards(FortytwoAuthGuard)
    async oauth42() {
        console.log('42 login called');
        return 'success';
    }

    @Get('/callback')
    @UseGuards(FortytwoAuthGuard)
    // @UseGuards(JwtAuthGuard)
    async callBack(@Req() req, @Res() res: Response) {
        console.log('callback 함수 호출');

        const { jwt, refreshToken } = await this.authService.signIn(req.user);
        res.cookie('access_token', jwt, {
            httpOnly: true,
            maxAge: +process.env.JWT_ACCESS_EXPIRATION_TIME,
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: +process.env.JWT_REFRESH_EXPIRATION_TIME,
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });

        res.status(HttpStatus.OK);
        // TODO: main page 로 redirect

        // return res.redirect('/auth/cookie-check');
        return res.redirect('/');
    }

    @Get('/regenerate-token')
    @UseGuards(RegenerateJwtGuard)
    regenerateToken(@Req() req, @Res() res) {
        const regeneratedToken = this.authService.regenerateJwt(req);

        res.cookie('access_token', regeneratedToken, {
            httpOnly: true,
            maxAge: +process.env.JWT_ACCESS_EXPIRATION_TIME,
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });
        res.status(HttpStatus.OK);
        return res;
    }

    @Get('cookie-check')
    checkCooke(@Req() req) {
        console.log(req);
    }

    @Get('/request-jwt')
    regenerateJwt(@Req() req) {
        return req;
    }
}
