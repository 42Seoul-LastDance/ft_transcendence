import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';

@Injectable()
export class FriendRepository extends Repository<Friend> {}
