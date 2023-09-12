import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: UserRepository,
    ) {}

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (!user) {
            throw new NotFoundException('from findUserByEmail');
        }
        return user;
    }

    async getUserIdByEmail(email: string): Promise<number> {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (!user) {
            throw new NotFoundException('from getUserIdByEmail');
        }
        return user.id;
    }

    async findUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            console.log('findUserById error - not found');
            throw new NotFoundException(`user with id ${id} not found`);
        }
        return user;
    }

    async registerUser(userDto: Auth42Dto): Promise<User> {
        try {
            //*  Dto에 없는 내용은 entity에 저장되어있는 default 값으로 세팅된다.
            const newUser = this.userRepository.create(userDto);
            const user = await this.userRepository.save(newUser);
            // console.log('register user in UserService:', newUser);
            return user;
        } catch (error) {
            console.log('error in registerUser ', error);
            throw new InternalServerErrorException('from registerUser');
        }
    }

    async saveUserCurrentRefreshToken(userId: number, refreshToken: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        await this.userRepository.update(userId, {
            refreshToken: hashedRefreshToken,
        });
    }

    async verifyRefreshToken(payload, token: string): Promise<void> {
        //userRepository 에서 payload.id (userid) 에 해당하는 refresh token 꺼내서 같은 지 비교.
        try {
            const storedToken = (await this.findUserById(payload.id))
                .refreshToken;
            if (!(storedToken && (await bcrypt.compare(token, storedToken)))) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            if (error.getStatus() == 404)
                throw new NotFoundException('from verifyRefreshToken');
            throw new UnauthorizedException('from verifyRefreshToken');
        }
    }

    async getUserBySlackId(slackId: string): Promise<User> {
        const found = await this.userRepository.findOne({
            where: {
                slackId: slackId,
            },
        });

        if (!found) {
            throw new NotFoundException('from getUserBySlackId');
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
            throw new NotFoundException('from getUserListBySlackId');
        }
        return found;
    }

    async removeRefreshToken(user): Promise<any> {
        // TODO: 프론트 쿠키 관리 로직이 추가되면 수정해야 함
        // TODO: 함수 명이랑 로직 다시 정리필요해보입니다!
        const found = await this.findUserById(user.sub); //안에서 에러처리 됨

        //없는 유저로 id 넣어서 요청하기 post 맨 좋네요! !
        return await this.userRepository.update(found.id, {
            refreshToken: null,
        }); // exception 안던지고 그냥 혼자 터져버리면 비상
        //에러 안뜨고 그냥 아무일도 안일어나는거 같아요 -> 그럼 안찾고 이대로 그냥 둬도 될지도??
        //findUserById 안하면 클라이언트에 에러 안던져짐 (아무일도 안일어나고 logout called 진행)
    }

    async saveUser2faCode(userId: number, code: string): Promise<void> {
        await this.userRepository.update(userId, { code2fa: code });
    }

    async verifyUser2faCode(userId: number, code: string): Promise<boolean> {
        const storedCode: string = (await this.findUserById(userId)).code2fa;
        console.log('stored = ', storedCode);
        console.log('input = ', code);
        if (storedCode === code) return true;
        else return false;
    }
}
