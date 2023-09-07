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
            //? expiresIn .env => JWT_ACCESS_EXPIRATION_TIME랑 동일한 값으로 해야하나요?
            expiresIn: '60s',
        });
    }

    async generateRefreshToken(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            //? expiresIn .env => JWT_REFRESH_EXPIRATION_TIME과 동일한 값으로 해야하나요?
            expiresIn: '24d',
        });
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async regenerateJwt(request) {
        //헤더 에서 jwt, refreshToken 추출 후 DB에 저장해둔 것과 비교하여 검증
        //jwt payload 에서 id추출.

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            this.userService.verifyRefreshToken(payload, token);
        } catch {
            throw new UnauthorizedException();
        }

        const payload = {
            sub: request.id,
            email: request.email,
        };
        const newAccessToken = await this.generateJwt(payload);

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
