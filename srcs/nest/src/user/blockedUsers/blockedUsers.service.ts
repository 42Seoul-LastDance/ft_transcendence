import { Injectable, Logger } from '@nestjs/common';
import { BlockedUsersRepository } from './blockedUsers.repository';
import { BlockedUsers } from './blockedUsers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { User } from '../user.entity';
@Injectable()
export class BlockedUsersService {
    private logger = new Logger(BlockedUsersService.name);
    constructor(
        @InjectRepository(BlockedUsers)
        private blockedUsersRepository: BlockedUsersRepository,
        private userSerivce: UserService,
    ) {}

    async blockUserById(userId: number, targetId: number): Promise<void> {
        if (userId === targetId) return;
        if ((await this.isBlocked(userId, targetId)) === true) return;
        const blockInfo = this.blockedUsersRepository.create({
            requestUserId: userId,
            targetUserId: targetId,
        });
        await this.blockedUsersRepository.save(blockInfo);
        this.logger.log(
            `Saved : ${(await this.userSerivce.findUserById(userId)).userName} blocked ${
                (await this.userSerivce.findUserById(targetId)).userName
            }`,
        );
    }

    async unblockUserById(userId: number, targetId: number): Promise<void> {
        await this.blockedUsersRepository.delete({ requestUserId: userId, targetUserId: targetId });
    }

    async isBlocked(userId: number, targetId: number): Promise<boolean> {
        if (userId === targetId) return false;
        const check = await this.blockedUsersRepository.find({
            where: { requestUserId: userId, targetUserId: targetId },
        });
        this.logger.debug(`Checking User ${userId} blocks User ${targetId}`);
        if (check === undefined || check === null || check.length === 0) return false;
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
    async getBlockUsernameAndSlackIdListById(id: number): Promise<Array<{ userName: string; slackId: string }>> {
        const blockList: Array<{ userName: string; slackId: string }> = [];
        const blockListId: number[] = await this.getBlockUserListById(id);

        for (const blockUserId of blockListId) {
            const blockUser: User = await this.userSerivce.findUserById(blockUserId);
            const blockUserName = blockUser.userName;
            const blockSlackId = blockUser.slackId;
            blockList.push({ userName: blockUserName, slackId: blockSlackId });
        }
        this.logger.debug('GET BLOCK USER NAME LIST : ', blockList);
        return blockList;
    }
}
