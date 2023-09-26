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
        this.socketList.set(socket.id, userId);
    }

    deleteUser(socket: Socket) {
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
        return this.socketList[socket.id];
    }

    async sendMessage(socket: Socket, content: string, targetId: number){
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
}
