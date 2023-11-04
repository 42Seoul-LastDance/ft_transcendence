import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { FriendStatus } from './friend.enum';
import { User } from '../user.entity';

@Injectable()
export class FriendService {
    private logger = new Logger(FriendService.name);
    constructor(
        @InjectRepository(Friend)
        private friendRepository: FriendRepository,
        private userService: UserService,
    ) {}

    async getFriendData(userId: number, friendId: number): Promise<Friend | null> {
        const query: Friend = await this.friendRepository.findOne({
            where: [{ requestUserId: userId, targetUserId: friendId }],
        });
        if (query) return query;

        const query2: Friend = await this.friendRepository.findOne({
            where: [{ requestUserId: friendId, targetUserId: userId }],
        });
        if (!query2) return null; // No matching friend record found
        return query2;
    }

    async getFriendList(userId: number): Promise<Array<number>> {
        const result: Array<number> = [];
        try {
            const foundFriend: Friend[] = await this.friendRepository.find({
                where: [
                    { requestUserId: userId, status: FriendStatus.FRIEND },
                    { targetUserId: userId, status: FriendStatus.FRIEND },
                ],
            });
            for (const friend of foundFriend) {
                let friendId: number;
                if (userId === friend.requestUserId) friendId = friend.targetUserId;
                else friendId = friend.requestUserId;
                result.push(friendId);
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('friendService >> getFriendList');
        }
        return result;
    }

    async getFriendNameAndSlackIdList(userId: number): Promise<Array<{ userName: string; slackId: string }>> {
        const friendList: Array<{ userName: string; slackId: string }> = [];

        try {
            const foundFriend: Friend[] = await this.friendRepository.find({
                where: [
                    { requestUserId: userId, status: FriendStatus.FRIEND },
                    { targetUserId: userId, status: FriendStatus.FRIEND },
                ],
            });
            for (const friend of foundFriend) {
                let friendData: User;
                if (userId === friend.requestUserId)
                    friendData = await this.userService.findUserById(friend.targetUserId);
                else friendData = await this.userService.findUserById(friend.requestUserId);
                if (friendData === undefined) continue;
                friendList.push({ userName: friendData.userName, slackId: friendData.slackId });
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('friendService >> getFriendNameList');
        }
        return friendList;
    }

    async getFriendStatus(userId: number, friendSlackId: string): Promise<FriendStatus> {
        try {
            const friend: User = await this.userService.getUserBySlackId(friendSlackId);
            if (friend === undefined) throw new BadRequestException('friendService >> getFriendStatus');

            const data: Friend = await this.getFriendData(userId, friend.id);
            let friendStatus: FriendStatus = FriendStatus.FRIEND;
            if (!data) friendStatus = FriendStatus.UNKNOWN;
            else if (data.requestUserId === friend.id && data.status === FriendStatus.REQUESTED)
                friendStatus = FriendStatus.LAGGING;
            else if (data.requestUserId === userId && data.status === FriendStatus.REQUESTED)
                friendStatus = FriendStatus.REQUESTED;
            this.logger.log(`getFriendStatus ${userId} and ${friendSlackId} : ${friendStatus}`);
            return friendStatus;
        } catch (error) {
            this.logger.error(error);
            throw new BadRequestException('friendService >> getFriendStatus');
        }
    }

    async requestFriend(userId: number, friendSlackId: string): Promise<void> {
        try {
            //본인인지 확인
            const friend: User = await this.userService.getUserBySlackId(friendSlackId);
            if (friend === undefined || userId === friend.id) return;
            //친구 상태 확인
            const status = await this.getFriendStatus(userId, friendSlackId);
            switch (status) {
                //요청한 적이 있거나 이미 친구이면 무시
                case FriendStatus.FRIEND:
                case FriendStatus.REQUESTED:
                    return;
                //상대방에게 요청 받은 적이 있으면 친구 수락
                case FriendStatus.LAGGING:
                    await this.acceptRequest(userId, friendSlackId); //
                    return;
                //기록 없을 경우 DB처리 진행
                case FriendStatus.UNKNOWN:
                    const newData = this.friendRepository.create({
                        requestUserId: userId,
                        targetUserId: friend.id,
                        status: FriendStatus.REQUESTED,
                    } as Friend);
                    await this.friendRepository.save(newData);
                    return;
                default:
                    console.log('error >>> requestFriend >>> default');
            }
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> requestFriend');
        }
    }

    async deleteFriend(userId: number, slackId: string) {
        try {
            const friend: User = await this.userService.getUserBySlackId(slackId);
            if (friend === undefined) return;
            const data = await this.getFriendData(userId, friend.id);
            if (!data || data.status !== FriendStatus.FRIEND) return;
            await this.friendRepository.delete(data.id);
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> deleteFriend');
        }
    }

    async getInvitation(userId: number): Promise<Array<{ userName: string; slackId: string }>> {
        try {
            const invitations: Array<{ userName: string; slackId: string }> = [];
            const requestUsers = await this.friendRepository
                .createQueryBuilder('friend')
                .where('friend.targetUserId = :userId', { userId })
                .andWhere('friend.status = :status', { status: FriendStatus.REQUESTED })
                .distinct(true)
                .getRawMany();

            if (!requestUsers) return [];
            for (const requestUser of requestUsers) {
                const friend: User = await this.userService.findUserById(requestUser.friend_requestUserId);
                if (friend) invitations.push({ userName: friend.userName, slackId: friend.slackId });
            }
            return invitations;
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> getInvitation');
        }
    }

    async acceptRequest(userId: number, friendSlackId: string) {
        //TODO : socketUserService의 friendList 업데이트
        try {
            const status: FriendStatus = await this.getFriendStatus(userId, friendSlackId);
            if (status !== FriendStatus.LAGGING) return;

            const friend: User = await this.userService.getUserBySlackId(friendSlackId);
            if (friend === undefined) return;
            await this.friendRepository.update(
                { requestUserId: friend.id, targetUserId: userId },
                { status: FriendStatus.FRIEND },
            );
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> acceptRequest');
        }
    }

    async declineRequest(userId: number, friendSlackId: string) {
        try {
            const status: FriendStatus = await this.getFriendStatus(userId, friendSlackId);
            const friend: User = await this.userService.getUserBySlackId(friendSlackId);
            if (status !== FriendStatus.LAGGING || friend === undefined) return;

            const data = await this.getFriendData(userId, friend.id);
            await this.friendRepository.delete(data.id);
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> declineRequest');
        }
    }
}
