import { EntityRepository, Repository } from 'typeorm';
import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { Auth42Dto } from 'src/auth/dto/auth42.dto';
import { UserInfoDto } from './dto/user-info.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    // async createUser(createUserDto: CreateUserDto) : Promise<User> {
    //     const {} = createUserDto;
    //     const ser = this.create({
    //     })
    //     await this.save(user);
    //     return user;
    // }
    //? createUser()  -> 미리 42 api 관련한 정보는 저장된 후에 실행되는 함수?
    //* username 중복체크를 위해 catch error -> if(error.code == '23505') throw new ConflictException('Existing username')' else -> thrwo new InternalServerErrorException();

    async createUser(
        authDto: Auth42Dto,
        userinfoDto: UserInfoDto,
    ): Promise<void> {
        //oath 로그인 시 정보
        const { email, login, image_url, displayname } = authDto;
        //회원가입 시 정보
        const { username, profileurl, require2fa } = userinfoDto;

        const user = this.create({});

        //try
        await this.save(user);
        //catch
        // if (Error.code == '23505')
        //     throw new ConflictException('Existing username');
        // else throw new InternalServerErrorException();

        //로그인 처리 (token 발행)
        //return 토큰
    }
}
