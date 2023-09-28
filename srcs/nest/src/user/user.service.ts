import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import * as bcrypt from 'bcryptjs';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { extname } from 'path';
import { UserProfileDto } from './dto/userProfile.dto';
import { InjectRepository } from '@nestjs/typeorm';

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
        console.log('id in findUserById: ', id);
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            console.log('findUserById error - not found');
            throw new NotFoundException(`user with id ${id} not found`);
        }
        return user;
    }

    async getUserByUsername(name: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: name },
        });
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async registerUser(authDto: Auth42Dto, username: string, filename: string): Promise<User> {
        try {
            const { email, slackId } = authDto;
            const newUser = this.userRepository.create({
                username: username, //!random name으로 변경필요
                email: email,
                profileurl: filename ? filename : 'default.png',
                slackId: slackId,
                role: 'GENERIC',
                require2fa: false,
                status: 'offline', //이건 socket 연결시 online 되는 로직일듯?
                exp: 0,
                level: 0,
            } as User);
            const user = await this.userRepository.save(newUser);
            // console.log('register user in UserService:', newUser);
            return user;
        } catch (error) {
            if (error.code == '23505') throw new ConflictException('Existing username');
            else throw new InternalServerErrorException('from registerUser');
        }
    }

    async updateUsernameBySlackId(slackId: string, username: string): Promise<User> {
        try {
            const user = await this.getUserBySlackId(slackId);
            user.username = username;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            if (error.code == '23505') throw new ConflictException('Existing username');
            else throw new InternalServerErrorException('from updateUsername');
        }
    }

    async update2faConfBySlackId(slackId: string, is2fa: boolean): Promise<User> {
        try {
            const user = await this.getUserBySlackId(slackId);
            user.require2fa = is2fa;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            throw new InternalServerErrorException('from update2fa');
        }
    }

    async updateProfileImageBySlackId(slackId: string, img: string): Promise<User> {
        try {
            const user = await this.getUserBySlackId(slackId);
            //* default 이미지가 아니었을 경우 기존 이미지 삭제
            if (user.profileurl != 'default.png') {
                const filePath = __dirname + '/../../profile/' + user.profileurl;
                if (existsSync(filePath)) unlinkSync(__dirname + '/../../profile/' + user.profileurl);
            }
            user.profileurl = img;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            throw new InternalServerErrorException('from updateProfileImage');
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
            const storedToken = (await this.findUserById(payload.id)).refreshToken;
            if (!(storedToken && (await bcrypt.compare(token, storedToken)))) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            if (error.getStatus() == 404) throw new NotFoundException('from verifyRefreshToken');
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

    /*
    로그아웃 용
     **/
    async removeRefreshToken(user): Promise<any> {
        // TODO: 프론트 쿠키 관리 로직이 추가되면 수정해야 함
        // TODO: 함수 명이랑 로직 다시 정리필요해보입니다!
        const found = await this.findUserById(user.sub); //안에서 에러처리 됨

        return await this.userRepository.update(found.id, {
            refreshToken: null,
        });
    }

    async saveUser2faCode(userId: number, code: string): Promise<void> {
        await this.userRepository.update(userId, { code2fa: code });
    }

    async verifyUser2faCode(userId: number, code: string): Promise<boolean> {
        const storedCode: string = (await this.findUserById(userId)).code2fa;
        // console.log('stored = ', storedCode);
        // console.log('input = ', code);
        if (storedCode === code) return true;
        else return false;
    }

    async getUserProfile(userId: number): Promise<UserProfileDto> {
        //TODO UserProfileDto 업데이트하고 추가로 진행
        const user = await this.findUserById(userId);

        const userProfileDto: UserProfileDto = {
            //TODO UserProfileDto 업데이트하고 추가로 진행
            id: user.id,
            username: user.username,
            slackId: user.slackId,
            // profileurl: user.profileurl,
            exp: user.exp,
            level: user.level,
        };

        return userProfileDto;
    }

    async getUserProfileImage(userId: number): Promise<{ image: Buffer; mimeType: string }> {
        const user = await this.findUserById(userId);
        const profileImgTarget = user.profileurl || 'default.png';
        const imagePath = __dirname + '/../../profile/' + profileImgTarget;
        const image = readFileSync(imagePath); // 이미지 파일을 읽어옴
        if (!image) throw new InternalServerErrorException(`could not read ${imagePath}`);
        const mimeType = 'image/' + extname(profileImgTarget).substring(1);
        return { image, mimeType };
    }
}
