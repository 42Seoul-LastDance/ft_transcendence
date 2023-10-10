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
    private friendList: Map<number, number[]> = new Map<number, number[]>(); // {user id, user id[]}
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

        // TODO : 상대방이 나를 차단했는지 확인 -> hasReceived = false
        let hasReceived: boolean = false; //(전제 조건)만약 차단되었으면 false
        const isBlocked = await this.blockedUsersService.isBlocked(userId, targetId);
        if (isBlocked === false) {
            //차단되지 않았으므로 hasReceived = true, emit
            hasReceived = true;
            targetSocket.emit('sendMessage', payload);
        }
        await this.saveMessage(userId, targetId, hasReceived, content);
    }

    async findRecentDMs(target1Id: number, target2Id: number, count: number): Promise<DirectMessage[]> {
        return await this.directMessageRepository.find({
            where: [
                { senderId: target1Id, receiverId: target2Id },
                { senderId: target2Id, receiverId: target1Id, hasReceived: true },
            ],
            order: {
                sentTime: 'DESC',
            },
            take: count,
        });
    }
}
