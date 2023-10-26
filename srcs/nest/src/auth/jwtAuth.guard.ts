// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private logger = new Logger(JwtAuthGuard.name);
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('no token');
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            request['user'] = payload;
        } catch (error) {
            this.logger.error('token error:', error.message);
            if (error.message === 'jwt expired') throw new UnauthorizedException("can't verify token");
            else throw new UnauthorizedException('jwt is invalid');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
