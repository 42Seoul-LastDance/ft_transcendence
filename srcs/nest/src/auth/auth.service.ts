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
        const userExists = await this.userService.findUserByEmail(user.email);

        if (!userExists) {
            console.log('user does no exist, so must be saved.\n');
            this.userService.registerUser(user);
           
        }
        const id = await this.userService.getUserIdByEmail(user.email);
        const refreshToken = await this.generateRefreshToken({id});
        this.userService.saveUserCurrentRefreshToken(
            id,
            refreshToken,
        );
 
        console.log('user saved', userExists);
        return this.generateJwt({
            sub: id,
            email: user.email,
        });
    }

}
