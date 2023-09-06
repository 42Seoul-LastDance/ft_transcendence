import { BadRequestException, Injectable } from '@nestjs/common';
// import { Auth42Dto } from './dto/auth42.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Auth42Dto } from './dto/auth42.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    generateJwt(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '1h',
        });
    }

    generateRefreshToken(payload) {
        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '24d',
        });
    }

    async signIn(user: Auth42Dto) {
        if (!user) {
            throw new BadRequestException('Unauthenticated');
        }
        const userExists = await this.userService.findByEmail(user.email);

        if (!userExists) {
            //없었던 경우 저장 먼저
            this.userService.registerUser(user);
        }

        const refreshToken = this.generateRefreshToken(user);

        const userId = this.userService.setCurrentRefreshToken(
            user.email,
            refreshToken,
        );
        console.log('user saved', userExists);
        return this.generateJwt({
            sub: userId,
            email: user.email,
        });
    }
    // setLoginUser(auth42Dto: Auth42Dto) {
    //     this.auth42Dto = auth42Dto;
    // }

    // getUserData() {
    //     return this.auth42Dto;
    // }

    //! 이 아래로는 무시하세요
    //로그인 시 받을 정보? -> Auth
}
