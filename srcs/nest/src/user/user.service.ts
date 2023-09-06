import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: UserRepository,
    ) {}

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.findOneBy({ email });
    }

    async registerUser(user: Auth42Dto) {
        try {
            //* TODO: Dto에 없는 내용은 null로 저장된다. 확인 필요
            const newUser = await this.userRepository.create(user);
            await this.userRepository.save(newUser);
            return user;
        } catch {}
    }

    async setCurrentRefreshToken(userEmail: string, refreshToken) {
        const userid = (
            await this.userRepository.findOneBy({ email: userEmail })
        ).id;
        this.userRepository.update(userid, { refreshToken: refreshToken });
        return userid;
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
