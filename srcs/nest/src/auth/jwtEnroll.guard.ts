import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtEnrollGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            console.log('enrollJwt: no token');
            throw new UnauthorizedException('enrollJwt: no token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ENROLL_SECRET,
            });

            request['authDto'] = [payload];
        } catch (error) {
            console.log('enrollJwt: token not right');
            throw new UnauthorizedException("enrollJwt: can't verify token");
        }
        console.log('enrollJwt guard okay');
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
