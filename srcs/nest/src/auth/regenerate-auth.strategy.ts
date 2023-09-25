import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayload } from './jwtAuth.strategy';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RegenerateJwtStrategy extends PassportStrategy(Strategy, 'regenerate-jwt') {
    constructor(private readonly userService: UserService) {
        super({
            secretOrKey: process.env.JWT_SECRET_KEY,
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload) {
        //이 함수는 refresh 토큰이 검증되고 유효한 경우 실행된다.
        console.log(payload); //body 에 refreshToken 이 들어있다.

        return payload;
    }
}
