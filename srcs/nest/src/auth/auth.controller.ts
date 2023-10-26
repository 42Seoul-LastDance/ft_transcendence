import {
    Controller,
    Get,
    Post,
    HttpStatus,
    Req,
    Res,
    UseGuards,
    UnauthorizedException,
    Query,
    InternalServerErrorException,
    Logger,
    Param,
    Body,
    Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { FortytwoAuthGuard } from './fortytwo.guard';
import { UserService } from 'src/user/user.service';
import { RegenerateAuthGuard } from './regenerateAuth.guard';
import { JwtAuthGuard } from './jwtAuth.guard';
import { Jwt2faGuard } from './jwt2fa.guard';
import { SocketUsersService } from '../socket/socketUsersService/socketUsers.service';

@Controller('auth')
export class AuthController {
    private logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private socketUsersService: SocketUsersService,
    ) {}
    // * 1. 현재 클라이언트가 유효한 jwt 토큰을 가지고 있는지 확인 (메인 페이지에서)
    // * 2. 유효하지 않다면 `/42login`으로 보내서 oauth 인증 (로그인 페이지 -> 42 intra)
    // * 3. oauth 인증 후 해당 유저가 가입되어 있지 않으면 저장 (default 2fa : true)
    // * 4. 2fa:true 라면 nodemailer를 통해 2fa 인증
    // * 5. 2fa 인증 후 (or 가입되어 있는데 2fa:false 라면) 토큰과 함께 메인 페이지 리다이렉션

    //추가로 같이 했으면 하는 일
    //1. 파이프 관련 내용 ======================= 오늘 juhoh 정리예정
    //2. socket.io -> 게임 큐, 게임 진행, 채팅 DM

    //나눠서 할 일
    //1. 게임(socket.io 제외) + elo(수식 구현) + 게임 큐
    //2. 채팅룸(public, private, secret): 방장 나가면 터짐 (채팅 DM 제외)
    //3. DM: 대화내용 DB에 저장
    //4. 친구추가 및 유저 관련내용
    //5. 관리자(?)
    //6.

    @Get('/42login')
    @UseGuards(FortytwoAuthGuard)
    async oauth42() {
        console.log('42 login called');
        return 'success';
    }

    @Get('/callback')
    @UseGuards(FortytwoAuthGuard)
    async callBack(@Req() req, @Res() res: Response) {
        try {
            this.logger.log('42 callback called.');

            //유저 검색해 신규 유저면 등록해줌 => 유저 리턴 (0912 작업 내용)
            const user = await this.authService.signUser(req.user);
            if (user === undefined) return res.redirect(process.env.FRONT_URL);

            //TODO : 2fa logic 잠시 막아둠(0912)
            if (user.require2fa === true) {
                res.status(HttpStatus.OK);
                const token = await this.authService.generate2faToken(user.id, user.userName);
                res.cookie('2fa_token', token);
                try {
                    // this.logger.debug(`${user.id} id `);
                    await this.authService.sendMail(user.id);
                } catch (error) {
                    this.logger.debug('sendMail fail T.T');
                    return res.redirect(process.env.FRONT_URL);
                }
                return res.redirect(process.env.FRONT_URL + '/tfa'); //TODO : 로직 변경
            }

            const { jwt, refreshToken } = await this.authService.generateAuthToken(user.id, user.userName);
            res.status(HttpStatus.OK);
            res.cookie('access_token', jwt);
            res.cookie('refresh_token', refreshToken);
            return res.redirect(process.env.FRONT_URL + '/home');
        } catch (error) {
            //ERROR HANDLE
            this.logger.error(`callBack : ${error.name}`);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Patch('verify2fa/')
    @UseGuards(Jwt2faGuard)
    async verify2fa(@Req() req, @Body('code') code: string, @Res() res: Response) {
        try {
            // this.logger.debug('code : ', code);
            const isAuthenticated = await this.userService.verifyUser2faCode(req.user.sub, code);

            if (isAuthenticated) {
                const { jwt, refreshToken } = await this.authService.generateAuthToken(req.user.sub, req.user.userName);
                res.status(HttpStatus.OK);
                return res.send({
                    access_token: jwt,
                    refresh_token: refreshToken,
                });
            } else {
                this.logger.debug('verify failed');
                throw new UnauthorizedException('verify failed');
            }
        } catch (error) {
            //ERROR HANDLE
            this.logger.error(`verify2fa : ${error.name}`);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Get('/regenerateToken')
    @UseGuards(RegenerateAuthGuard)
    async regenerateToken(@Req() req, @Res() res: Response) {
        try {
            // this.logger.log('regenerateToken called');
            const newToken = await this.authService.regenerateJwt(req);
            return res.status(200).send({ token: newToken });
        } catch (error) {
            this.logger.error(`regenerateToken : ${error.name}`);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Post('/logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any, @Res() res: Response) {
        try {
            await this.userService.removeRefreshToken(req.user);
            await this.socketUsersService.clearServerData(req.user.sub);
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.statusCode = 200;
            return res.send({
                message: 'logout success',
            });
        } catch (error) {
            //ERROR HANDLE
            this.logger.error(`logout : ${error.name}`);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }
}
