import { EntityRepository, Repository } from 'typeorm';
import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import { CreateUserDto } from './dto/createUser.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(
        authDto: Auth42Dto,
        createUserDto: CreateUserDto,
    ): Promise<User> {
        //oath 로그인 시 정보
        const { email, login, image_url } = authDto;
        //회원가입 시 정보
        const { username, profileurl, require2fa } = createUserDto;

        const new_user = this.create({
            username,
            email,
            profileurl: profileurl ? profileurl : image_url,
            slackId: login,
            role: 'GENERIC',
            require2fa,
            status: 'online',
            exp: 0,
            level: 0,
        } as User);

        try {
            await this.save(new_user);
        } catch (error) {
            if (error.code == '23505')
                throw new ConflictException('Existing username');
            else throw new InternalServerErrorException();
        }

        return new_user;
        //로그인 처리 (token 발행)
        //return 토큰
    }
}
