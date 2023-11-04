/* eslint-disable prettier/prettier */
import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { extname } from 'path';
import { UserProfileDto } from './dto/userProfile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { POINT, LEVELUP } from 'src/game/game.constants';
import * as bcrypt from 'bcrypt';

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

    async registerUser(authDto: Auth42Dto): Promise<User> {
        try {
            const { email, slackId } = authDto;
            const newUser = this.userRepository.create({
                userName: slackId + Math.floor(100000 + Math.random() * 900000).toString(),
                email: email,
                profileurl: null,
                slackId: slackId,
                role: 'GENERIC',
                require2fa: false,
                status: 'offline', //이건 socket 연결시 online 되는 로직일듯?
                exp: 0,
                level: 0,
            } as User);
            const user = await this.userRepository.save(newUser);
            return user;
        } catch (error) {
            if (error.code === '23505') throw new ConflictException('Existing userName');
            else throw new InternalServerErrorException('from registerUser');
        }
    }

    async updateUserInfo(
        userId: number,
        userName: string | undefined,
        require2fa: boolean,
        profileImage: Express.Multer.File | undefined,
    ) {
        try {
            const user = await this.findUserById(userId);
            if (user === undefined) throw new BadRequestException('no such userId');
            if (userName && user.userName !== userName) {
                this.logger.debug('userName update');
                user.userName = userName;
            }
            user.require2fa = require2fa;
            if (profileImage && user.profileurl) {
                //기존 이미지 삭제
                this.logger.debug('profile update');
                try {
                    const filePath = `/usr/app/srcs/profile/${user.profileurl}`;
                    if (existsSync(filePath)) unlinkSync(filePath);
                } catch (error) {
                    this.logger.error('[ERROR] Failed to delete profile image: ' + error.message);
                }
            }
            user.profileurl = profileImage ? profileImage.filename : user.profileurl;
            await this.userRepository.update(userId, user);
        } catch (error) {
            // this.logger.error('[ERRRRRR] userService: updateUserInfo');
            throw new BadRequestException('no such userId');
        }
    }

    async userBySlackId(slackId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { slackId: slackId },
        });
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async saveUserCurrentRefreshToken(userId: number, refreshToken: string) {
        this.logger.debug('userID', userId);
        await this.userRepository.update(userId, {
            refreshToken: refreshToken,
        });
    }

    async verifyRefreshToken(payload, token: string): Promise<void> {
        //userRepository 에서 payload.sub (userid) 에 해당하는 refresh token 꺼내서 같은 지 비교.
        try {
            const user: User = await this.findUserById(payload.sub);
            if (user === undefined) throw new NotFoundException('from verifyRefreshToken');
            this.logger.log('Checking RefreshToken to Verify');
            if (!(user.refreshToken && token === user.refreshToken)) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            if (error.getStatus() === 404) throw new NotFoundException('from verifyRefreshToken');
            throw new UnauthorizedException('from verifyRefreshToken');
        }
    }

    async getUserBySlackId(slackId: string): Promise<User> {
        const found = await this.userRepository.findOne({
            where: { slackId: slackId },
        });
        if (!found) {
            this.logger.error(`Cannot find ${slackId} in DB!`);
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
        const found = await this.findUserById(user.sub);
        if (found === undefined) return;
        found.refreshToken = null;
        return await this.userRepository.save(found);
    }

    async saveUser2faCode(userId: number, code: string): Promise<void> {
        try {
            const encodedCode = await bcrypt.hash(code, 10);
            await this.userRepository.update(userId, { code2fa: encodedCode });
        } catch {
            this.logger.debug(`code , id : ${code} ${userId} ${typeof code}`);
        }
    }

    async verifyUser2faCode(userId: number, code: string): Promise<boolean> {
        const user: User = await this.findUserById(userId);
        if (user === undefined) return false;
        const isMatch = await bcrypt.compare(code, user.code2fa);
        if (isMatch) return true;
        else return false;
    }

    async getUserSetInfo(userId: number) {
        const user: User = await this.findUserById(userId);

        if (user) {
            this.logger.debug('userInfo in getUserSetInfo:');
            this.logger.debug(user);
            const userSetting = {
                userName: user.userName,
                require2fa: user.require2fa,
            };
            return userSetting;
        }
        return {};
    }

    async getUserProfile(slackId: string): Promise<UserProfileDto> {
        const user: User = await this.getUserBySlackId(slackId);
        if (user === undefined || user === null) return undefined;
        const userProfileDto: UserProfileDto = {
            userName: user.userName,
            slackId: user.slackId,
            exp: user.exp,
            level: user.level,
        };
        return userProfileDto;
    }

    async getUserProfileImage(slackId: string): Promise<{ image: Buffer; mimeType: string }> {
        try {
            const user: User = await this.getUserBySlackId(slackId);
            if (user === undefined || user === null) return undefined;
            let profileImgTarget = user.profileurl ? user.profileurl : 'default.png';
            let imagePath = '/usr/app/srcs/profile/' + profileImgTarget;
            let image = readFileSync(imagePath); // 이미지 파일을 읽어옴
            if (!image) {
                profileImgTarget = 'default.png';
                imagePath = '/usr/app/srcs/profile/' + profileImgTarget;
                image = readFileSync(imagePath); // 이미지 파일을 읽어옴
            }
            const mimeType = 'image/' + extname(profileImgTarget).substring(1);
            return { image, mimeType };
        } catch (error) {
            console.log('ERRRRR: getUserProfileImage', error);
        }
    }

    async updateUserExp(userId: number, score: number) {
        const user = await this.findUserById(userId);
        if (user === undefined) return;
        user.exp += POINT * score;
        if (user.exp >= (user.level + 1) * LEVELUP) {
            user.exp -= (user.level + 1) * LEVELUP;
            user.level += 1;
        }
        await this.userRepository.save(user);
    }
}
