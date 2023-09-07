import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: UserRepository,
    ) {}

    async findUserByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ where: { email: email } });
    }

    async getUserIdByEmail(email: string) {
        return (await this.userRepository.findOne({ where: { email: email } }))
            .id;
    }

    async findUserById(id: number) {
        return await this.userRepository.findOne({ where: { id: id } });
    }

    async registerUser(user: Auth42Dto) {
        try {
            //*  Dto에 없는 내용은 entity에 저장되어있는 default 값으로 세팅된다.
            const newUser = this.userRepository.create(user);
            await this.userRepository.save(newUser);
            console.log('register user in UserService:', newUser);
            return user;
        } catch (error) {
            console.log('error in registerUser ', error);
        }
    }

    async saveUserCurrentRefreshToken(userId: number, refreshToken: string) {
        //TODO: 암호화해서 refreshToken 저장하기.
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        await this.userRepository.update(userId, {
            refreshToken: hashedRefreshToken,
        });
    }

    async verifyRefreshToken(payload, token: string): Promise<void> {
        //userRepository 에서 payload.sub (userid) 에 해당하는 refresh token 꺼내서 같은 지 비교.
        const storedToken = (
            await this.userRepository.findOne({
                where: { email: payload.sub },
            })
        ).refreshToken;

        if (!(storedToken && (await bcrypt.compare(storedToken, token)))) {
            throw new UnauthorizedException();
        }
    }

    async getUserBySlackId(slackId: string): Promise<User> {
        const found = await this.userRepository.findOne({
            where: {
                slackId: slackId,
            },
        });

        if (!found) {
            throw new NotFoundException();
        }

        return found;
    }

    async getUserListBySlackId(slackId: string): Promise<User[]> {
        const found = await this.userRepository.find({
            where: {
                slackId: Like(`${slackId}%`),
            },
            order: {
                username: 'ASC', // Ascending order (alphabetically)
            },
        });

        if (!found) {
            throw new NotFoundException();
        }
        return found;
    }
}
