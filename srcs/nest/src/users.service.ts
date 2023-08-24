import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Users } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  async addOne(user: Users): Promise<Users> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async searchOne(name: string): Promise<Users> {
    return this.usersRepository.findOne({
      where: {
        name: name,
      }
    });
  }

  async searchUsers(name: string): Promise<Users[]> {
    return this.usersRepository.find({
      where: {
        name: Like(`${name}%`),
      },
      order: {
        name: 'ASC', // Ascending order (alphabetically)
      },
    });
  }

  async deleteOne(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      }
    });
    if (user) {
      await this.usersRepository.remove(user);
    }
  }

}
