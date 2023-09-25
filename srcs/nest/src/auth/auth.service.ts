import { Injectable, UnauthorizedException, Res, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Auth42Dto } from './dto/auth42.dto';
import { Request, Response } from 'express';
import { User } from 'src/user/user.entity';
import { MailService } from 'src/mail/mail.service';
import { UserInfoDto } from 'src/user/dto/userInfo.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private mailService: MailService,
    ) {}

    async generateJwt(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    async generateRefreshToken(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
        });
    }

    getRefreshTokenFromRequest(req: Request): string | undefined {
        if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'refresh_token') {
                    return decodeURIComponent(value);
                }
            }
        }
        return undefined;
    }
    async regenerateJwt(request) {
        //헤더 에서 jwt, refreshToken 추출 후 DB에 저장해둔 것과 비교하여 검증
        //jwt payload 에서 id추출.
        const token = this.getRefreshTokenFromRequest(request);
        if (!token) {
            throw new UnauthorizedException('no token ');
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            await this.userService.verifyRefreshToken(payload, token);
        } catch {
            throw new UnauthorizedException('not verified token');
        }

        const user = await this.userService.findUserById(payload.id);
        const newPayload = {
            sub: payload.id,
            email: user.email,
            slackId: user.slackId,
        };
        const newAccessToken = await this.generateJwt(newPayload);

        return newAccessToken;
        // refresh 토큰 검증(guard) , 서버에서도 검증 -> 삭제되어있으면 x (로그아웃한거임)
        // 검증했으면 jwt 토큰 발급해서 반환.
        // this.jwtService.
    }

    /**
     * Dto에 있는 정보가 DB에 없다면 유저를 만들고, 있다면 찾아서 반환하는 함수
     */
    async signUser(user: Auth42Dto): Promise<User> {
        try {
            const userExists = await this.userService.findUserByEmail(user.email);
            return userExists;
        } catch (error) {
            if (error.getStatus() == 404) {
                console.log('user does no exist, so must be saved.\n');
                //기존 함수 주석처리로 하기 내용 주석처리함
                // return await this.userService.registerUser(user);
            } else throw error;
        }
    }

    async generateToken(authDto: Auth42Dto): Promise<{ jwt: string; refreshToken: string }> {
        const id = await this.userService.getUserIdByEmail(authDto.email);
        const jwt = await this.generateJwt({
            sub: id,
            email: authDto.email,
        });
        const refreshToken = await this.generateRefreshToken({ id });
        this.userService.saveUserCurrentRefreshToken(id, refreshToken);

        const returnObject: { jwt: string; refreshToken: string } = {
            jwt,
            refreshToken,
        };
        return returnObject;
    }

    //TODO : signIn 함수의 책임 -> Auth42Dto를 받아서 User 객체 반환
    //TODO : 함수명이 이게 맞나? -> signIn도 하고 signUp도 하는데
    //* signIn 함수 원본 지킴이
    // async signIn(
    //     user: Auth42Dto,
    // ): Promise<{ jwt: string; refreshToken: string }> {
    //     if (!user) {
    //         throw new BadRequestException('Unauthenticated');
    //     }
    //     try {
    //         const userExists = await this.userService.findUserByEmail(
    //             user.email,
    //         );
    //     } catch (error) {
    //         if (error.getStatus() == 404) {
    //             console.log('user does no exist, so must be saved.\n');
    //             await this.userService.registerUser(user);
    //         }
    //     }
    //     const id = await this.userService.getUserIdByEmail(user.email);
    //     //ok 로직 보낸다. 그럼 frontend가 jwt 발급 로직 endpoint로 이동
    //     //&& 창으로 'code 를 입력해서 인증을 완료하세요 ' 로직?

    //     //! 여기선 jwt 토큰 발급안하는 걸로?

    //     //! FactorAuthentication 확인 여부 저장하고 확인하는 로직 작성. -> 그 다음에 jwt 토큰 발급하게.

    //     // TODO mailService 에서 verifyFactorAuthentication ㅇ
    //     const jwt = await this.generateJwt({
    //         sub: id,
    //         email: user.email,
    //     });
    //     const refreshToken = await this.generateRefreshToken({ id });
    //     this.userService.saveUserCurrentRefreshToken(id, refreshToken);

    //     const returnObject: { jwt: string; refreshToken: string } = {
    //         jwt,
    //         refreshToken,
    //     };
    //     return returnObject;
    // }

    async generateEnrollJwt(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ENROLL_SECRET,
            expiresIn: process.env.JWT_ENROLL_TIME,
        });
    }

    async generateEnrollToken(authDto: Auth42Dto): Promise<string> {
        const enrollToken = await this.generateEnrollJwt({
            email: authDto.email,
            slackId: authDto.slackId,
            image_url: authDto.image_url,
            displayname: authDto.displayname,
            accesstoken: authDto.accesstoken,
        });
        return enrollToken;
    }

    async generate2faJwt(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_2FA_SECRET,
            expiresIn: process.env.JWT_2FA_TIME,
        });
    }

    async generate2faToken(authDto: Auth42Dto): Promise<string> {
        const user = await this.userService.findUserByEmail(authDto.email);
        const token = await this.generate2faJwt({
            sub: user.id,
        });
        return token;
    }

    async signEnrollToken(@Res() res: Response, payload) {
        const enrollJwt = await this.generateEnrollToken(payload);
        res.status(HttpStatus.OK);
        res.cookie('enroll_token', enrollJwt, {
            // httpOnly: true,
            maxAge: +process.env.JWT_ENROLL_COOKIE_TIME,
            secure: false,
        });
        return res;
    }

    async sign2faToken(@Res() res: Response, payload) {
        const secondFaJwt = await this.generate2faToken(payload);
        res.status(HttpStatus.OK);
        res.cookie('2fa_token', secondFaJwt, {
            // httpOnly: true,
            maxAge: +process.env.JWT_2FA_COOKIE_TIME, //테스트용으로 숫자 길게 맘대로 해둠
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });
    }

    async signjwtToken(@Res() res: Response, payload) {
        const { jwt, refreshToken } = await this.generateToken(payload);
        res.status(HttpStatus.OK);
        res.cookie('access_token', jwt, {
            // httpOnly: true,
            maxAge: +process.env.COOKIE_MAX_AGE,
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });
        res.cookie('refresh_token', refreshToken, {
            // httpOnly: true,
            // maxAge: +process.env.COOKIE_MAX_AGE,
            maxAge: 100000000, //테스트용으로 숫자 길게 맘대로 해둠
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });
    }

    async signRegeneratejwt(@Res() res: Response, payload) {
        const regeneratedToken = await this.regenerateJwt(payload);
        res.cookie('access_token', regeneratedToken, {
            // httpOnly: true,
            maxAge: +process.env.COOKIE_MAX_AGE,
            sameSite: true, //: Lax 옵션으로 특정 상황에선 요청이 전송되는 방식.CORS 로 가능하게 하자.
            secure: false,
        });
        res.status(HttpStatus.OK);
    }

    async sendMail(@Res() res: Response, id: number) {
        try {
            this.mailService.sendMail(id);
            res.status(HttpStatus.OK);
        } catch (error) {
            return new InternalServerErrorException('from twofactorAuthentication');
        }
        return res.status(200).json({
            message: '2FA 코드가 이메일로 전송되었습니다. 코드를 확인해주세요.',
        });
    }

    async checkUserIfExists(@Res() res: Response, user: Auth42Dto): Promise<boolean> {
        try {
            await this.userService.getUserBySlackId(user.slackId);
            return true;
        } catch (error) {
            if (error.getStatus() == 404) {
                return false;
            } else throw new InternalServerErrorException('from 42callback');
        }
    }
}
