import {
    Controller,
    Get,
    Param,
    Request,
    Body,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortytwoAuthGuard } from './fortytwo.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(FortytwoAuthGuard)
    @Get('/42login')
    async login(AccessToken, RefreshToken) {
        console.log('42 login called')
        return 'success';
    }

    @Get('/callback')
    @UseGuards(FortytwoAuthGuard)
    async callBack(@Body() accessToken: string, refreshToken: string) {
        //code 로 유저 불러오기 : code 로 accesss token 받아서 사용자 정보 요청
        console.log('callback 함수 호출');
    }
}
