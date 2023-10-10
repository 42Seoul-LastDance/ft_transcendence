import { Injectable } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';
import { Socket } from 'socket.io';
import { DirectMessage } from './directMessage.entity';
import { DateTime } from 'luxon';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { DirectMessageInfoDto } from './dto/directMessageInfo.dto';
const TIMEZONE: string = 'Asia/Seoul';

@Injectable()
export class DirectMessageService {
    //private userList: Map<number, Socket> = new Map<number, Socket>(); // {user ID, Socket}
    //private socketList: Map<string, number> = new Map<string, number>(); // {Socket.ID, user ID}
    //private blockList: Map<number, number[]> = new Map<number, number[]>(); // {user id, user id[]}
    //private friendList: Map<number, number[]> = new Map<number, number[]>(); // {user id, user id[]}
    constructor(
        private directMessageRepository: DirectMessageRepository,
        // private blockedUsersService: BlockedUsersService,
        private socketUsersService: SocketUsersService,
    ) {}

    async addNewUser(socket: Socket, userId: number) {
        console.log('socket id, userId in addNewUser(DM) : ', socket.id, userId);
        const signedUser: Socket = this.socketUsersService.getDMSocketById(userId);
        if (signedUser !== undefined) this.socketUsersService.deleteDMSocket(signedUser.id);
        this.socketUsersService.addDMSocket(socket.id, userId);
        this.socketUsersService.addDMUser(userId, socket);
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

    async sendMessage(socket: Socket, content: string, targetId: number) {
        const userId = this.getUserId(socket);
        const targetSocket: Socket = this.socketUsersService.getDMSocketById(targetId);
        const payload = {
            senderId: userId,
            receiverId: targetId,
            content: content,
        };
        // !test
        if (!userId) targetSocket.emit('sendMessage', 'internal server error');

        // TODO : 상대방이 나를 차단했는지 확인 -> hasReceived = false
        let hasReceived: boolean = false; //(전제 조건)만약 차단되었으면 false
        const isBlocked = await this.socketUsersService.isBlocked(userId, targetId);
        if (isBlocked === false) {
            //차단되지 않았으므로 hasReceived = true, emit
            hasReceived = true;
            targetSocket.emit('sendMessage', payload);
        }
        await this.saveMessage(userId, targetId, hasReceived, content);
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
        //TODO :  DirectMessage[] 에서 DirectMessageInfoDto[] 로 일부 정보만 추출하여 변경 후 리턴해주기

        return;
    }
}
