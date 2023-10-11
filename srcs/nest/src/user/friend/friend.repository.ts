import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { FriendStatus } from './friend.enum';

@EntityRepository(Friend)
@Injectable()
export class FriendRepository extends Repository<Friend> {}
