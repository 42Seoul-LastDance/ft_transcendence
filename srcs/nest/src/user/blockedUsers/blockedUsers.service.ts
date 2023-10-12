import { Injectable } from '@nestjs/common';
import { BlockedUsersRepository } from './blockedUsers.repository';
import { BlockedUsers } from './blockedUsers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user.service';
@Injectable()
export class BlockedUsersService {
    constructor(
        @InjectRepository(BlockedUsers)
        private blockedUsersRepository: BlockedUsersRepository,
        private userSerivce: UserService,
    ) {}

    async blockUserById(userId: number, targetId: number): Promise<void> {
        // if ((await this.isBlocked(userId, targetId)) === true) return;
        const blockInfo = this.blockedUsersRepository.create({
            requestUserId: userId,
            targetUserId: targetId,
        });
        await this.blockedUsersRepository.save(blockInfo);
    }

    async unblockUserById(userId: number, targetId: number): Promise<void> {
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

    //*REST API
    async getBlockUsernameListById(id: number): Promise<Array<string>> {
        const blockList: Array<string> = [];
        const blockListId = await this.getBlockUserListById(id);
        const foundBlockUsers: BlockedUsers[] = await this.blockedUsersRepository.find({
            where: { requestUserId: id },
        });
        console.log('found Blocked user:', blockListId);
        // if (!foundBlockUsers) return [];
        for (const blockUser of blockListId) {
            console.log('found Blocked user:', blockListId);
            const blockUserName = (await this.userSerivce.findUserById(blockUser)).userName;
            blockList.push(blockUserName);
        }
        console.log('block list in GET BLOCK USER NAME LISt', blockList);
        return blockList;
    }
}
