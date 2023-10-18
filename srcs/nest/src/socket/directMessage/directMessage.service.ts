import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';
import { Socket } from 'socket.io';
import { DirectMessage } from './directMessage.entity';
import { DateTime } from 'luxon';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { DirectMessageInfoDto } from './dto/directMessageInfo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/user/user-status.enum';
import { InviteType } from '../socketUsersService/socketUsers.enum';
import { Invitation } from '../socketUsersService/socketUsers.interface';
import { User } from 'src/user/user.entity';
const TIMEZONE: string = 'Asia/Seoul';

@Injectable()
export class DirectMessageService {
    private logger = new Logger(DirectMessageService.name);
    constructor(
        @InjectRepository(DirectMessage)
        private directMessageRepository: DirectMessageRepository,
        private socketUsersService: SocketUsersService,
    ) {}

    //result, reason
    private emitFailReason(socket: Socket, event: string, reason: string) {
        const response = {
            result: false,
            reason: reason,
        };
        socket.emit(event, response);
    }

    async addNewUser(socket: Socket, userId: number) {
        this.logger.debug(`ADD NEW USER : ${userId}, ${socket.id}`);
        const signedUser: Socket = this.socketUsersService.getDMSocketById(userId);
        if (signedUser !== undefined) await this.socketUsersService.deleteDMSocket(signedUser.id);
        await this.socketUsersService.addDMSocket(socket.id, userId);
        this.socketUsersService.addDMUser(userId, socket);
        this.socketUsersService.setFriendList(userId);
        this.socketUsersService.setBlockList(userId);
        this.socketUsersService.setInviteList(userId);
    }

    async getUserBySocketId(socketId: string): Promise<User> {
        return await this.socketUsersService.getUserByUserId(this.socketUsersService.getUserIdByDMSocketId(socketId));
    }

    deleteUser(socket: Socket) {
        this.socketUsersService.deleteDMUserAll(socket);
    }

    blockUser(socket: Socket, userId: number, targetId: number) {
        const blockedList = this.socketUsersService.getBlockListById(userId);
        if (blockedList.indexOf(targetId) !== -1) return;
        blockedList.push(targetId);
    }

    unblockUser(socket: Socket, userId: number, targetId: number) {
        const blockedList = this.socketUsersService.getBlockListById(userId);
        const idx = blockedList.indexOf(targetId);
        if (idx === -1) return;
        blockedList.splice(idx);
    }

    async saveMessage(senderId: number, receiverId: number, hasReceived: boolean, content: string) {
        const time = DateTime.now().setZone(TIMEZONE);
        if (content === null || senderId === null || receiverId === null || hasReceived === null) {
            throw new BadRequestException('null exception');
        }
        if (content === undefined || senderId === undefined || receiverId === undefined || hasReceived === undefined) {
            throw new BadRequestException('undefined exception');
        }

        const dm = this.directMessageRepository.create({
            senderId: senderId,
            receiverId: receiverId,
            hasReceived: hasReceived,
            content: content,
            sentTime: time,
        } as DirectMessage);
        await this.directMessageRepository.save(dm);
    }

    getUserId(socket: Socket): number | undefined {
        return this.socketUsersService.getUserIdByDMSocketId(socket.id);
    }

    async sendMessage(socket: Socket, content: string, targetName: string) {
        const userId: number = this.getUserId(socket);
        const userName: string = await this.socketUsersService.getUserNameByUserId(userId);
        const targetId: number = await this.socketUsersService.getUserIdByUserName(targetName);
        const targetSocket: Socket = this.socketUsersService.getDMSocketById(targetId);

        // !test
        if (!userId) {
            this.emitFailReason(socket, 'sendMessage', 'no userId');
            return;
        }

        let hasReceived: boolean = false; //(전제 조건)만약 차단되었으면 false
        const isBlocked = await this.socketUsersService.isBlocked(userId, targetId);
        if (isBlocked === false) {
            //차단되지 않았으므로 hasReceived = true, emit
            hasReceived = true;
            if (targetSocket) targetSocket.emit('sendMessage', { userName: userName, content: content });
        }
        await this.saveMessage(userId, targetId, hasReceived, content);
        socket.emit('sendMessage', { userName: userName, content: content }); //sender
    }

    async findRecentDMs(target1Id: number, userName: string, count: number): Promise<DirectMessageInfoDto[]> {
        const target2Id = await this.socketUsersService.getUserIdByUserName(userName);
        const DMList: DirectMessage[] = await this.directMessageRepository.find({
            where: [
                { senderId: target1Id, receiverId: target2Id },
                { senderId: target2Id, receiverId: target1Id, hasReceived: true },
            ],
            order: {
                sentTime: 'ASC',
            },
            take: count,
        });

        // * DirectMessage[] 에서 DirectMessageInfoDto[] 로 일부 정보만 추출하여 변경 후 리턴해주기
        const returnArray: DirectMessageInfoDto[] = [];
        // const friendList: Array<{ username: string; status: UserStatus }> = [];
        for (const dm of DMList) {
            const userName = await this.socketUsersService.getUserNameByUserId(dm.senderId);
            const content = dm.content;

            returnArray.push({ userName: userName, content: content });
        }
        return returnArray;
    }

    async getFriendStateList(socket: Socket, userName: string): Promise<[string, string, UserStatus][]> {
        if (userName === undefined || userName === null) {
            this.logger.error('userName undefined');
            this.emitFailReason(socket, 'getFriendStateList', 'username error');
            return;
        }
        const result: { userName: string; slackId: string; userStatus: UserStatus }[] =
            await this.socketUsersService.getFriendStateList(userName);
        this.logger.debug(`GET FRIEND STATE LIST :: ${userName} with : ${result}`);
        socket.emit('getFriendStateList', result);
    }

    // * invite
    async getInvitationList(socketId: string) {
        const invitationList: Invitation[] = [];
        const guestId: number = this.socketUsersService.getDMsocketList().get(socketId);
        const invitations: Map<number, Invitation> = this.socketUsersService.getInviteListByUserId(guestId);
        for (const hostId of invitations.keys()) {
            const invitation = {
                hostName: invitations.get(hostId).hostName,
                hostSlackId: invitations.get(hostId).hostSlackId,
                inviteType: invitations.get(hostId).inviteType,
                chatRoomName: invitations.get(hostId).chatRoomName,
                chatRoomType: invitations.get(hostId).chatRoomType,
                gameMode: invitations.get(hostId).gameMode,
            };
            invitationList.push(invitation);
        }
        return invitationList;
    }

    async sendInvitation(socketId: string, payload: JSON) {
        const guestSocket = await this.socketUsersService.sendInvitation(socketId, payload);
        if (guestSocket === undefined) {
            console.log('guestSocket undefined');
            return;
        }
        const guestId: number = this.socketUsersService.getUserIdByDMSocketId(guestSocket.id);
        guestSocket.emit('updateInvitation');
        guestSocket.emit('invitationSize', this.socketUsersService.getInviteListByUserId(guestId).size);
    }

    async agreeInvite(socketId: string, payload: JSON) {
        const guestSocket = await this.socketUsersService.agreeInvite(socketId, payload['hostSlackId']);
        const guestId: number = this.socketUsersService.getUserIdByDMSocketId(guestSocket.id);
        guestSocket.emit('updateInvitation');
        guestSocket.emit('invitationSize', this.socketUsersService.getInviteListByUserId(guestId).size);
    }

    async declineInvite(socketId: string, payload: JSON) {
        const guestSocket = await this.socketUsersService.declineInvite(socketId, payload['hostSlackId']);
        const guestId: number = this.socketUsersService.getUserIdByDMSocketId(guestSocket.id);
        guestSocket.emit('updateInvitation');
        guestSocket.emit('invitationSize', this.socketUsersService.getInviteListByUserId(guestId).size);
    }

    async deleteFriend(socket: Socket, payload: JSON) {
        // 친구 삭제 이벤트가 일어날 때 친구 리스트 실시간 업데이트
        // 프론트로 다시 getFriendStateList 날려주기
        const userName = payload['userName'];
        const targetName = payload['targetName'];
        const userId = this.socketUsersService.getUserIdByDMSocketId(socket.id);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);

        this.socketUsersService.deleteFriend(userId, targetId);
        const targetSocket = this.socketUsersService.getDMSocketById(targetId);
        await this.getFriendStateList(socket, userName);
        if (targetSocket) await this.getFriendStateList(targetSocket, targetName);
    }

    async addFriend(socket: Socket, payload: JSON) {
        const userName = payload['userName'];
        const targetName = payload['targetName'];
        const userId = this.socketUsersService.getUserIdByDMSocketId(socket.id);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);

        this.socketUsersService.addFriend(userId, targetId);
        const targetSocket = this.socketUsersService.getDMSocketById(targetId);
        await this.getFriendStateList(socket, userName);
        if (targetSocket != undefined && targetSocket !== null) await this.getFriendStateList(targetSocket, targetName);
        else this.logger.error('targetSocket does not exist');
    }
}
