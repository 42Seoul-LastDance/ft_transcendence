import { Injectable } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';
import { Socket } from 'socket.io';
import { DirectMessage } from './directMessage.entity';
import { DateTime } from 'luxon';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
const TIMEZONE: string = 'Asia/Seoul';

@Injectable()
export class DirectMessageService {
    private userList: Map<number, Socket> = new Map<number, Socket>(); // {user ID, Socket}
    private socketList: Map<string, number> = new Map<string, number>(); // {Socket.ID, user ID}
    private blockList: Map<number, number[]> = new Map<number, number[]>(); // {user id, user id[]}
    constructor(
        private directMessageRepository: DirectMessageRepository,
        private blockedUsersService: BlockedUsersService,
    ) {}

    async addNewUser(socket: Socket, userId: number) {
        console.log('socket id, userId in addNewUser(DM) : ', socket.id, userId);
        const signedUser = this.userList.get(userId);
        if (signedUser !== undefined) this.socketList.delete(signedUser.id);
        this.socketList.set(socket.id, userId);
        this.userList.set(userId, socket);
        this.blockList.set(userId, await this.blockedUsersService.getBlockUserListById(userId));
        // ? DM도 blockList를 유저별로 인메모리에 저장해놔야 빠르게 체크할 수 있지 않을까?
    }

    deleteUser(socket: Socket) {
        this.userList.delete(this.socketList.get(socket.id));
        this.socketList.delete(socket.id);
    }

    blockUser(socket: Socket, userId: number, targetId: number) {
        const blockedList = this.blockList.get(userId);
        if (blockedList.indexOf(targetId) !== -1) return;
        blockedList.push(targetId);
    }

    unblockUser(socket: Socket, userId: number, targetId: number) {
        const blockedList = this.blockList.get(userId);
        const idx = blockedList.indexOf(targetId);
        if (idx === -1) return;
        blockedList.splice(idx);
    }

    async saveMessage(senderId: number, receiverId: number, content: string) {
        const time = DateTime.now().setZone(TIMEZONE);
        const dm = this.directMessageRepository.create({
            senderId: senderId,
            receiverId: receiverId,
            content: content,
            sentTime: time,
        } as DirectMessage);
        await this.directMessageRepository.save(dm);
    }

    getUserId(socket: Socket): number | undefined {
        return this.socketList.get(socket.id);
    }

    async sendMessage(socket: Socket, content: string, targetId: number) {
        const userId = this.getUserId(socket);
        const targetSocket: Socket = this.userList.get(targetId);
        const payload = {
            senderId: userId,
            receiverId: targetId,
            content: content,
        };
        // !test
        if (!userId) targetSocket.emit('sendMessage', 'internal server error');
        await this.saveMessage(userId, targetId, content);
        targetSocket.emit('sendMessage', payload);
    }

    async findRecentDMs(target1Id: number, target2Id: number, count: number): Promise<DirectMessage[]> {
        return await this.directMessageRepository.find({
            where: [
                { senderId: target1Id, receiverId: target2Id },
                { senderId: target2Id, receiverId: target1Id },
            ],
            order: {
                sentTime: 'DESC',
            },
            take: count,
        });
    }
}
