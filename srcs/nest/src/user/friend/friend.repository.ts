import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Friend } from './friend.entity';

@EntityRepository(Friend)
@Injectable()
export class FriendRepository extends Repository<Friend> {}
