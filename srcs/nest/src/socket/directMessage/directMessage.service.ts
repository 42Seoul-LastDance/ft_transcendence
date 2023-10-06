import { Injectable } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';
import { Socket } from 'socket.io';
import { DirectMessage } from './directMessage.entity';
import { DateTime } from 'luxon';
const TIMEZONE: string = 'Asia/Seoul';

@Injectable()
export class DirectMessageService {
    private userList: Map<number, Socket> = new Map<number, Socket>(); // {user ID, Socket}
    private socketList: Map<string, number> = new Map<string, number>(); // {Socket.ID, user ID}
    constructor(private directMessageRepository: DirectMessageRepository) {}

    addNewUser(socket: Socket, userId: number) {
        console.log('socket id, userId in addNewUser(DM) : ', socket.id, userId);
        const signedUser = this.userList.get(userId);
        if (signedUser !== undefined) this.socketList.delete(signedUser.id);
        this.socketList.set(socket.id, userId);
        this.userList.set(userId, socket);
        // ? DM도 blockList를 유저별로 인메모리에 저장해놔야 빠르게 체크할 수 있지 않을까?
    }

    deleteUser(socket: Socket) {
        this.userList.delete(this.socketList.get(socket.id));
        this.socketList.delete(socket.id);
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
        return this.directMessageRepository.find({
            where: [
                { senderId: target1Id },
                { receiverId: target1Id },
                { senderId: target2Id },
                { receiverId: target2Id },
            ],
            order: {
                sentTime: 'DESC',
            },
            take: count,
        });
    }
}
