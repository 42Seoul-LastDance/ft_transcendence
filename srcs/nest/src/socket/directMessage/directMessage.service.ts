import { BadRequestException, Injectable } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';
import { Socket } from 'socket.io';
import { DirectMessage } from './directMessage.entity';
import { DateTime } from 'luxon';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { DirectMessageInfoDto } from './dto/directMessageInfo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/user/user-status.enum';
const TIMEZONE: string = 'Asia/Seoul';

@Injectable()
export class DirectMessageService {
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
        console.log('socket id, userId in addNewUser(DM) : ', socket.id, userId);
        const signedUser: Socket = this.socketUsersService.getDMSocketById(userId);
        if (signedUser !== undefined) this.socketUsersService.deleteDMSocket(signedUser.id);
        this.socketUsersService.addDMSocket(socket.id, userId);
        this.socketUsersService.addDMUser(userId, socket);
        this.socketUsersService.setFriendList(userId);
        this.socketUsersService.setBlockList(userId);
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
            targetSocket.emit('sendMessage', { userName: userName, content: content });
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
                sentTime: 'DESC',
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

    async getFriendStateList(socket: Socket, userName: string): Promise<[string, UserStatus][]> {
        if (userName === undefined || userName === null) {
            this.emitFailReason(socket, 'getFriendStateList', 'username error');
            return;
        }
        const result: [string, UserStatus][] = await this.socketUsersService.getFriendStateList(userName);
        console.log('🏊GET FRIEND STATE LIST🏊', result);
        socket.emit('getFriendStateList', result);
    }
}
