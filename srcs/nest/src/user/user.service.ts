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

    async findUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email }})
    }

    async getUserIdByEmail(email: string){
        return (await this.userRepository.findOne({ where: {email} })).id;
    }

    async findUserById(id: number){
        return (await this.userRepository.findOne({ where: {id} }));
    }
    async registerUser(user: Auth42Dto) {
        try {
            //*  Dto에 없는 내용은 entity에 저장되어있는 default 값으로 세팅된다. 
            const newUser = await this.userRepository.create(user);
            await this.userRepository.save(newUser);
            return user;
        } catch {}
    }

    async saveUserCurrentRefreshToken(userId: number, refreshToken) {
        //TODO: 암호화해서 refreshToken 저장하기.
        this.userRepository.update(userId, { refreshToken: refreshToken });
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
