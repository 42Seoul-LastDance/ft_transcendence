import { Repository } from 'typeorm';
import { Users } from './users.entity';

export class UserRepository extends Repository<Users> {
    // async createUser(createUserDto: CreateUserDto) : Promise<Users> {
    //     const {} = createUserDto;
    //     const ser = this.create({
    //     })
    //     await this.save(user);
    //     return user;
    // }
}
