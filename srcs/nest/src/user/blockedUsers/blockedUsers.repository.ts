import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlockedUsers } from './blockedUsers.entity';

@Injectable()
export class BlockedUsersRepository extends Repository<BlockedUsers> {}
