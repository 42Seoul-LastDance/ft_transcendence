import { Repository } from 'typeorm';
import { BlockedUsers } from './blockedUsers.entity';

export class BlockedUsersRepository extends Repository<BlockedUsers> {}
