import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RegenerateAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.getRefreshTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('no refresh token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException('error!');
        }
        return true;
    }

    private getRefreshTokenFromHeader(request: Request): string | null {
        // HTTP 요청 헤더에서 "refresh_token" 값을 가져옵니다.
        const reqCookie = request.headers.cookie;
        if (!reqCookie) return null;
        const cookies = reqCookie.split(' ');

        for (const cookie of cookies) {
            if (cookie.startsWith('refresh_token='))
                return cookie.slice('refresh_token='.length);
        }
        // "refresh_token" 헤더가 없거나 문자열이 아닌 경우 null을 반환합니다.
        return null;
    }
}
