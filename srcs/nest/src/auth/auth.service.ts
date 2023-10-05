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

    private async generateJwtBySecret(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    private async generateRefreshTokenBySecret(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
        });
    }

    private async generate2faTokenBySecret(payload): Promise<string> {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_2FA_SECRET_KEY,
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
        const newAccessToken = await this.generateJwtBySecret(newPayload);
        return newAccessToken;
    }

    async generateAuthToken(id: number, username: string): Promise<{ jwt: string; refreshToken: string }> {
        const jwt = await this.generateJwtBySecret({
            sub: id,
            userName: username,
        });
        const refreshToken = await this.generateRefreshTokenBySecret({ id: id });
        this.userService.saveUserCurrentRefreshToken(id, refreshToken);

        const returnObject: { jwt: string; refreshToken: string } = {
            jwt,
            refreshToken,
        };
        return returnObject;
    }

    async generate2faToken(userId: number, userName: string): Promise<string> {
        const token = await this.generate2faTokenBySecret({
            sub: userId,
            username: userName,
        });
        return token;
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
                console.log('user does not exist, so must be saved.\n');
                return await this.userService.registerUser(user, user.image_url);
            } else throw error;
        }
    }

    async sendMail(@Res() res: Response, id: number): Promise<void> {
        try {
            this.mailService.sendMail(id);
            res.status(HttpStatus.OK);
        } catch (error) {
            throw new InternalServerErrorException('error from twofactorAuthentication');
        }
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
