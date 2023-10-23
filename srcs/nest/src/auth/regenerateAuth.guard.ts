import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RegenerateAuthGuard implements CanActivate {
    private logger = new Logger(RegenerateAuthGuard.name);
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.getRefreshTokenFromHeader(request);
        if (!token) {
            this.logger.error('no refresh token');
            throw new UnauthorizedException('no refresh token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            request['user'] = payload;
        } catch (error) {
            this.logger.error('error:', error.message);
            throw new UnauthorizedException('error!');
        }
        return true;
    }

    private getRefreshTokenFromHeader(request: Request): string | null {
        // HTTP 요청 헤더에서 "refresh_token" 값을 가져옵니다.
        const headers = request.headers.authorization;
        // this.logger.debug('refresh toekn REFRESH TOKEN:', request.headers.authorization);
        // console.log('refresh token from header :', headers);
        if (!headers) return null;
        const token = headers.split(' ');

        // for (const cookie of cookies) {
        //     if (cookie.startsWith('refresh_token=')) return cookie.slice('refresh_token='.length);
        // }
        // "refresh_token" 헤더가 없거나 문자열이 아닌 경우 null을 반환합니다.
        // return null;
        // this.logger.debug('token ', token[1]);
        return token[1];
    }
}
