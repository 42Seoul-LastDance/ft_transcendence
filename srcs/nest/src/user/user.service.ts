import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async addOne(user: User): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async searchOne(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async getUserListByFistSlackId(slackId: string): Promise<User[]> {
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

  async deleteOne(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      await this.userRepository.remove(user);
    }
  }
}
