import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { UserStatus } from '../user-status.enum';
import { FriendStatus } from './friend.enum';

@Injectable()
export class FriendService {
    private logger = new Logger(FriendService.name);
    constructor(
        @InjectRepository(Friend)
        private friendRepository: FriendRepository,
        private userService: UserService,
    ) {}

    async getFriendData(userId: number, friendId: number): Promise<Friend | null> {
        const query: Friend = await this.friendRepository
            .createQueryBuilder('friend')
            .where('(friend.requestUserId = :userId AND friend.targetUserId = :friendId)', { userId, friendId })
            .getOne();
        if (query) return query;

        const query2: Friend = await this.friendRepository
            .createQueryBuilder('friend')
            .where('(friend.requestUserId = :friendId AND friend.targetUserId = :userId)', { userId, friendId })
            .getOne();
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

    async getFriendNameList(userId: number): Promise<Array<string>> {
        const friendList: Array<string> = [];

        console.log('userid', userId);
        try {
            const foundFriend: Friend[] = await this.friendRepository.find({
                where: [
                    { requestUserId: userId, status: FriendStatus.FRIEND },
                    { targetUserId: userId, status: FriendStatus.FRIEND },
                ],
            });
            for (const friend of foundFriend) {
                let friendData;
                if (userId === friend.requestUserId)
                    friendData = await this.userService.findUserById(friend.targetUserId);
                else friendData = await this.userService.findUserById(friend.requestUserId);
                // console.log('{username, status:}', friendData);
                friendList.push(friendData.userName);
                // console.log('ppushed~~~~~~~~~');
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('friendService >> getFriendNameList');
        }
        // console.log('friend list: ', friendList);
        return friendList;
    }

    async getFriendStatus(userId: number, friendName: string): Promise<FriendStatus> {
        try {
            const friendId = (await this.userService.getUserByUserName(friendName)).id;
            const data = await this.getFriendData(userId, friendId);
            if (!data) return FriendStatus.UNKNOWN;
            if (data.requestUserId === friendId && data.status === FriendStatus.REQUESTED) return FriendStatus.LAGGING;
            return data.status; //FRIEND, REQUESTED
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> getFriendStatus');
        }
    }

    async requestFriend(userId: number, friendName: string): Promise<string> {
        try {
            //친구 상태 확인
            const status = await this.getFriendStatus(userId, friendName);
            switch (status) {
                //요청한 적이 있거나 이미 친구이면 무시
                case FriendStatus.FRIEND:
                case FriendStatus.REQUESTED:
                    return;
                //상대방에게 요청 받은 적이 있으면 친구 수락
                case FriendStatus.LAGGING:
                    await this.acceptRequest(userId, friendName);
                    return;
                //기록 없을 경우 DB처리 진행
                case FriendStatus.UNKNOWN:
                    const friendId = (await this.userService.getUserByUserName(friendName)).id;
                    const newData = this.friendRepository.create({
                        requestUserId: userId,
                        targetUserId: friendId,
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

    async deleteFriend(userId: number, friendName: string) {
        //TODO : socketUserService의 friendList 업데이트
        try {
            const friendId = (await this.userService.getUserByUserName(friendName)).id;
            const data = await this.getFriendData(userId, friendId);
            if (!data || data.status !== FriendStatus.FRIEND) return;
            await this.friendRepository.delete(data.id);
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> deleteFriend');
        }
    }

    async getInvitation(userId: number) {
        try {
            const invitations: Array<string> = [];
            const requestUsers = await this.friendRepository
                .createQueryBuilder('friend')
                .where('friend.targetUserId = :userId', { userId })
                .andWhere('friend.status = :status', { status: FriendStatus.REQUESTED })
                .distinct(true)
                .getRawMany();
            if (!requestUsers) return [];
            for (const requestUser of requestUsers) {
                const friendName = (await this.userService.findUserById(requestUser.friend_requestUserId)).userName;
                invitations.push(friendName);
            }
            return invitations;
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> getInvitation');
        }
    }

    async acceptRequest(userId: number, friendName: string) {
        //TODO : socketUserService의 friendList 업데이트
        try {
            const status = await this.getFriendStatus(userId, friendName);
            if (status !== FriendStatus.LAGGING) return;

            const friendId = (await this.userService.getUserByUserName(friendName)).id;
            await this.friendRepository.update(
                { requestUserId: friendId, targetUserId: userId },
                { status: FriendStatus.FRIEND },
            );
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> acceptRequest');
        }
    }

    async declineRequest(userId: number, friendName: string) {
        try {
            const status = await this.getFriendStatus(userId, friendName);
            if (status !== FriendStatus.LAGGING) return;

            const friendId = (await this.userService.getUserByUserName(friendName)).id;
            const data = await this.getFriendData(userId, friendId);
            await this.friendRepository.delete(data.id);
        } catch (error) {
            console.log(error);
            throw new BadRequestException('friendService >> declineRequest');
        }
    }
}
