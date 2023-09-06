import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

export type JwtPayload = {
    sub: string;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        // @Inject(config.KEY) private configService: ConfigType<typeof config>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {
        const extractJwtFromCookie = (req) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies['access_token'];
            }
            return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        };

        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY,
            jwtFromRequest: extractJwtFromCookie,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findOne({
            where: { email: payload.email },
        });

        if (!user) throw new UnauthorizedException('Please log in to continue');
        return {
            email: payload.email,
        };
    }
}
