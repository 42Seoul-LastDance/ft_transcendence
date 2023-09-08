import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
// import { Auth42Dto } from './dto/auth42.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Auth42Dto } from './dto/auth42.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
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
            throw new UnauthorizedException();
        }
        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET_KEY,
        }); // ! 로직 확인 필요 : try 블록 밖에 있어도 되는 친구인가?
        try {
            this.userService.verifyRefreshToken(payload, token);
        } catch {
            throw new UnauthorizedException();
        }

        const userEmail = (await this.userService.findUserById(payload.id))
            .email;
        const newPayload = {
            sub: payload.id,
            email: userEmail,
        };
        const newAccessToken = await this.generateJwt(newPayload);

        return newAccessToken;
        // refresh 토큰 검증(guard) , 서버에서도 검증 -> 삭제되어있으면 x (로그아웃한거임)
        // 검증했으면 jwt 토큰 발급해서 반환.
        // this.jwtService.
    }

    async signIn(
        user: Auth42Dto,
    ): Promise<{ jwt: string; refreshToken: string }> {
        if (!user) {
            throw new BadRequestException('Unauthenticated');
        }
        const userExists = await this.userService.findUserByEmail(user.email);
        if (!userExists) {
            console.log('user does no exist, so must be saved.\n');
            await this.userService.registerUser(user);
        }
        const id = await this.userService.getUserIdByEmail(user.email);
        //ok 로직 보낸다. 그럼 frontend가 jwt 발급 로직 endpoint로 이동
        //&& 창으로 'code 를 입력해서 인증을 완료하세요 ' 로직?

        //! 여기선 jwt 토큰 발급안하는 걸로?

        //! FactorAuthentication 확인 여부 저장하고 확인하는 로직 작성. -> 그 다음에 jwt 토큰 발급하게.

        // TODO mailService 에서 verifyFactorAuthentication ㅇ
        const jwt = await this.generateJwt({
            sub: id,
            email: user.email,
        });
        const refreshToken = await this.generateRefreshToken({ id });
        this.userService.saveUserCurrentRefreshToken(id, refreshToken);

        const returnObject: { jwt: string; refreshToken: string } = {
            jwt,
            refreshToken,
        };
        return returnObject;
    }
}
