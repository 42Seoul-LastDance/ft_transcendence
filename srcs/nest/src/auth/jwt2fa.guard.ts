import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class Jwt2faGuard implements CanActivate {
    private logger = new Logger(Jwt2faGuard.name);
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // console.log('request : ', request.headers);
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            console.log('2faJwt: no token');
            throw new UnauthorizedException('2faJwt: no token');
        }
        try {
            // this.logger.debug(`token = ${token}`);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_2FA_SECRET_KEY,
            });
            this.logger.debug(`payload = ${payload}`);

            request['user'] = payload;
        } catch (error) {
            console.log('2faJwt: token not right', error.message);
            throw new UnauthorizedException("2faJwt: can't verify token");
        }
        console.log('2faJwt guard okay');
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
