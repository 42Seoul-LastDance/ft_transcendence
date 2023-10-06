import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FriendService {
    constructor(
        @InjectRepository(Friend)
        private friendRepository: FriendRepository,
    ) {}
}
