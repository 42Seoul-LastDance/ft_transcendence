import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { FriendStatus } from './friend.enum';

@Injectable()
export class FriendRepository extends Repository<Friend> {
    async getFriendData(userId: number, friendId: number): Promise<Friend | null> {
        const query = await this.createQueryBuilder('friend')
            .where('(friend.requestUserId = :userId AND friend.targetUserId = :friendId)', { userId, friendId })
            .getOne();
        if (query) return query;

        const query2 = await this.createQueryBuilder('friend')
            .where('(friend.requestUserId = :friendId AND friend.targetUserId = :userId)', { userId, friendId })
            .getOne();
        if (!query2) return null; // No matching friend record found
        return query2;
    }

    async getInvitations(userId: number) {
        try {
            const requestUserIds = await this.createQueryBuilder('friend')
                .select('friend.requestUserId')
                .where('friend.targetUserId = :userId', { userId })
                .andWhere('friend.status = :status', { status: FriendStatus.REQUESTED })
                .distinct(true)
                .getRawMany();

            return requestUserIds.map((result) => result.requestUserId);
        } catch (error) {
            console.error('Error retrieving requestUserIds:', error.message);
            return [];
        }
    }
}
