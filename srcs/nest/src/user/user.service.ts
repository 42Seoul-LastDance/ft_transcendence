/* eslint-disable prettier/prettier */
import {
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
    forwardRef,
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
import { UserStatus } from './user-status.enum';
import { POINT, LEVELUP } from 'src/game/game.constants';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
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
        const user = await this.userRepository.findOne({
            where: { id: id },
        });
        if (!user) {
            this.logger.warn('findUserById error - not found');
            throw new NotFoundException(`user with id ${id} not found`);
        }
        return user;
    }

    async getUserByUserName(name: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { userName: name },
        });
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async registerUser(authDto: Auth42Dto, filename: string): Promise<User> {
        try {
            const { email, slackId } = authDto;
            const newUser = this.userRepository.create({
                userName: slackId,
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
            this.logger.log('register user in UserService:', newUser);
            return user;
        } catch (error) {
            if (error.code == '23505') throw new ConflictException('Existing userName');
            else throw new InternalServerErrorException('from registerUser');
        }
    }

    async updateUserInfo(
        userId: number,
        userName: string | undefined,
        require2fa: boolean | undefined,
        profileImage: Express.Multer.File | undefined,
    ) {
        try {
            const user = await this.findUserById(userId);
            user.userName = userName ? userName : user.userName;
            user.require2fa = require2fa;
            user.profileurl = profileImage ? profileImage.filename : user.profileurl;
            await this.userRepository.update(userId, user);
            if (userName) {
                //TODO 유저네임 업데이트되었으면 친구들에게 emit 처리 필요-> 친구 목록, 친구 요청, blockUser
                //-> 프론트에서 updateUserName 이벤트 받을 예정
            }
        } catch (error) {
            this.logger.error('[ERRRRRR] userService: updateUserInfo');
        }
    }

    // async updateUserNameBySlackId(slackId: string, userName: string): Promise<User> {
    //     try {
    //         const user = await this.getUserBySlackId(slackId);
    //         user.userName = userName;
    //         await this.userRepository.save(user);
    //         return user;
    //     } catch (error) {
    //         if (error.code == '23505') throw new ConflictException('Existing userName');
    //         else throw new InternalServerErrorException('from updateuserName');
    //     }
    // }

    // async update2faConfBySlackId(slackId: string, is2fa: boolean): Promise<User> {
    //     try {
    //         const user = await this.getUserBySlackId(slackId);
    //         user.require2fa = is2fa;
    //         await this.userRepository.save(user);
    //         return user;
    //     } catch (error) {
    //         throw new InternalServerErrorException('from update2fa');
    //     }
    // }

    // async updateProfileImageBySlackId(slackId: string, img: string): Promise<User> {
    //     try {
    //         const user = await this.getUserBySlackId(slackId);
    //         //* default 이미지가 아니었을 경우 기존 이미지 삭제
    //         if (user.profileurl != 'default.png') {
    //             const filePath = __dirname + '/../../profile/' + user.profileurl;
    //             if (existsSync(filePath)) unlinkSync(__dirname + '/../../profile/' + user.profileurl);
    //         }
    //         user.profileurl = img;
    //         await this.userRepository.save(user);
    //         return user;
    //     } catch (error) {
    //         throw new InternalServerErrorException('from updateProfileImage');
    //     }
    // }

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
                userName: 'ASC', // Ascending order (alphabetically)
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

    async getUserSetInfo(userId: number) {
        const user: User = await this.findUserById(userId);

        if (user) {
            const userSetting = {
                userName: user.userName,
                require2fa: user.require2fa,
            };
            return userSetting;
        }
        return {};
    }

    async getUserProfile(username: string): Promise<UserProfileDto> {
        const user = await this.getUserByUserName(username);
        const userProfileDto: UserProfileDto = {
            userName: user.userName,
            slackId: user.slackId,
            exp: user.exp,
            level: user.level,
        };
        return userProfileDto;
    }

    async getUserProfileImage(username: string): Promise<{ image: Buffer; mimeType: string }> {
        try {
            const user = await this.getUserByUserName(username);
            const profileImgTarget = user.profileurl ? user.profileurl : 'default.png';
            const imagePath = '/usr/app/srcs/profile/' + profileImgTarget;
            const image = readFileSync(imagePath); // 이미지 파일을 읽어옴
            if (!image) {
                throw new InternalServerErrorException(`could not read ${imagePath}`);
            }
            const mimeType = 'image/' + extname(profileImgTarget).substring(1);
            return { image, mimeType };
        } catch (error) {
            console.log('ERRRRR: getUserProfileImage', error);
        }
    }

    async updateUserExp(userId: number, score: number) {
        const user = await this.findUserById(userId);
        user.exp += POINT * score;
        if (user.exp >= (user.level + 1) * LEVELUP) {
            user.exp -= (user.level + 1) * LEVELUP;
            user.level += 1;
        }
        await this.userRepository.save(user);
    }
}
