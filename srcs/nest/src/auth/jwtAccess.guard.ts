import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAccessGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            console.log('tempJwt: no token');
            throw new UnauthorizedException('no token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_TEMP_SECRET,
            });

            request['authDto'] = [payload];
        } catch (error) {
            console.log('tempJwt: token not right');
            throw new UnauthorizedException("can't verify token");
        }
        console.log('tempJwt guard okay');
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
