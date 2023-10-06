import { Injectable } from '@nestjs/common';
import { BlockedUsersRepository } from './blockedUsers.repository';
import { BlockedUsers } from './blockedUsers.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class BlockedUsersService {
    constructor(
        @InjectRepository(BlockedUsers)
        private blockedUsersRepository: BlockedUsersRepository,
    ) {}

    async addBlockUser(userId: number, targetId: number): Promise<void> {
        if ((await this.isBlocked(userId, targetId)) === true) return;
        const blockInfo = this.blockedUsersRepository.create({
            requestUserId: userId,
            targetUserId: targetId,
        });
        await this.blockedUsersRepository.save(blockInfo);
    }

    async deleteBlockUserById(userId: number, targetId: number): Promise<void> {
        await this.blockedUsersRepository.delete({ requestUserId: userId, targetUserId: targetId });
    }

    async isBlocked(userId: number, targetId: number): Promise<boolean> {
        if (
            (await this.blockedUsersRepository.find({ where: { requestUserId: userId, targetUserId: targetId } })) ===
            undefined
        )
            return false;
        return true;
    }

    async getBlockUserListById(id: number): Promise<Array<number>> {
        const blockList: Array<number> = [];
        console.log('repository 정체를 밝혀라 undefined 냐', this.blockedUsersRepository);
        const foundBlockUsers: BlockedUsers[] = await this.blockedUsersRepository.find({
            // TypeError: Cannot read properties of undefined (reading 'find')
            where: { requestUserId: id },
            select: { targetUserId: true },
        });
        foundBlockUsers.forEach((blockedUser) => {
            blockList.push(blockedUser.targetUserId);
        });
        return blockList;
    }

    //TODO : 프론트에서 필요한 정보로 바꿔서 주기.
}
