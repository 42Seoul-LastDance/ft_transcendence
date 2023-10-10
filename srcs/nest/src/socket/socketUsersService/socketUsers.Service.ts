import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';

@Injectable()
export class SocketUsersService {
    constructor(
        private blockedUsersService: BlockedUsersService,
        private userService: UserService,
    ) {}
    private chatRoomUserList: Map<number, Socket> = new Map<number, Socket>(); //{userName->id, Socket}
    private chatRoomSocketList: Map<string, number> = new Map<string, number>(); //{socket id , userName->id}

    private dmUserList: Map<number, Socket> = new Map<number, Socket>(); //{userName->id, Socket}
    private dmSocketList: Map<string, number> = new Map<string, number>(); //{socket id , userName->id}

    private blockList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , blockUserList} // ! -> DB에서 한번 가져 들고왔다가 지속 업데이트
    private friendList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , blockUserList} // ! -> DB에서 한번 가져 들고왔다가 지속 업데이트

    //* socket --
    getChatSocketById(userId: number): Socket | undefined {
        const socket = this.chatRoomUserList.get(userId);
        return socket;
    }

    addChatRoomUser(userId: number, socket: Socket): void {
        this.chatRoomUserList.set(userId, socket);
    }

    deleteChatRoomUser(userId: number): boolean {
        return this.chatRoomUserList.delete(userId);
    }

    getUserIdByChatSocketId(socketId: string): number | undefined {
        const userId: number = this.chatRoomSocketList.get(socketId);
        return userId;
    }

    addChatRoomSocket(socketId: string, userId: number): void {
        this.chatRoomSocketList.set(socketId, userId);
    }

    deleteChatRoomSocket(socket: Socket): boolean {
        return this.chatRoomSocketList.delete(socket.id);
    }

    deleteUserAll(socket: Socket): void {
        const userId = this.getUserIdBySocketId(socket.id);
        this.chatRoomUserList.delete(userId);
        this.chatRoomSocketList.delete(socket.id);
        this.blockList.delete(userId);
    }

    async setBlockList(userId: number): Promise<void> {
        this.blockList.set(userId, await this.blockedUsersService.getBlockListById(userId));
    }

    //* DM--
    getDMSocketById(userId: number): Socket | undefined {
        const socket: Socket = this.dmUserList.get(userId);
        return socket;
    }

    addDMUser(userId: number, socket: Socket): void {
        this.dmUserList.set(userId, socket);
    }

    deleteDMUser(userId: number): boolean {
        return this.dmUserList.delete(userId);
    }

    getUserIdByDMSocketId(socketId: string): number | undefined {
        const userId: number = this.dmSocketList.get(socketId);
        return userId;
    }

    addDMSocket(socketId: string, userId: number): void {
        this.dmSocketList.set(socketId, userId);
    }

    deleteDMSocket(socketId: string): boolean {
        return this.dmSocketList.delete(socketId);
    }

    //* getter
    async getUserNameByUserId(userId: number): Promise<string> {
        return await this.userService.findUserById(userId).userName;
    }

    async getUserIdByUserName(userName: string): Promise<number> {
        return (await this.userService.getUserByUserName(userName)).id;
    }

    getChatRoomUserList(): Map<number, Socket> {
        return this.chatRoomUserList;
    }

    getChatRoomsocketList(): Map<string, number> {
        return this.chatRoomSocketList;
    }

    getDMUserList(): Map<string, Socket> {
        return this.dmUserList;
    }

    getDMsocketList(): Map<string, number> {
        return this.dmSocketList;
    }

    getBlockList(): Map<number, Array<number>> {
        return this.blockList;
    }

    getFriendList(): Map<number, Array<number>> {
        return this.friendList;
    }
}
