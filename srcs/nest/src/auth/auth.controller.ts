import {
    Controller,
    Get,
    Param,
    Post,
    Redirect,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //http://localhost:3000/auth/login/42/redirect
    @Redirect()
    @UseGuards()
    @Get('/login')
    async login() {
        //redirect_uri :127.0.0.1:3000/auth/callback
        return this.authService.get42Login();
    }

    @Get('/oauth_callback')
    async callBack(@Param('code') code: string) {
        //code 로 유저 불러오기 : code 로 accesss token 받아서 사용자 정보 요청
        const AuthDto = this.authService.verification(code);

        //
        //유저 등록
        //jwt 토큰 생성
        //jwt 토큰 헤더에 담아 전달.
    }
}
