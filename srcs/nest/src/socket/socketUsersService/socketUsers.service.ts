import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { Player } from 'src/game/game.interface';
import { FriendService } from 'src/user/friend/friend.service';
import { UserStatus } from 'src/user/user-status.enum';

@Injectable()
export class SocketUsersService {
    constructor(
        private blockedUsersService: BlockedUsersService,
        private userService: UserService,
        private friendService: FriendService,
    ) {}
    private chatRoomUserList: Map<number, Socket> = new Map<number, Socket>(); //{userName->id, Socket}
    private chatRoomSocketList: Map<string, number> = new Map<string, number>(); //{socket id , userName->id}

    private dmUserList: Map<number, Socket> = new Map<number, Socket>(); //{userName->id, Socket}
    private dmSocketList: Map<string, number> = new Map<string, number>(); //{socket id , userName->id}

    //game
    private gamePlayerList: Map<string, Player> = new Map<string, Player>(); //{socket.id, Player}
    private gameUserList: Map<number, string> = new Map<number, string>(); //{userId, socket.id}

    private blockList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , blockUserList} // ! -> DB에서 한번 가져 들고왔다가 지속 업데이트
    private friendList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , friendUserList}

    //* socket --
    getChatSocketById(userId: number): Socket | undefined {
        const socket = this.chatRoomUserList.get(userId);
        return socket;
    }

    addChatRoomUser(userId: number, socket: Socket): void {
        this.chatRoomUserList.set(Number(userId), socket);
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

    deleteChatUserAll(socket: Socket): void {
        const userId = this.getUserIdByChatSocketId(socket.id);
        if (this.chatRoomUserList.delete(userId)) console.log('chatRoomUserList DELETED : ', userId);
        if (this.chatRoomSocketList.delete(socket.id)) console.log('chatRoomSocketList DELETED : ', socket.id);
        this.blockList.delete(userId);
    }

    //* Game--
    getPlayerBySocketId(socketId: string): Player {
        const player: Player = this.gamePlayerList.get(socketId);
        return player;
    }

    addPlayerBySocketId(socketId: string, player: Player): void {
        this.gamePlayerList.set(socketId, player);
    }

    deletePlayer(socketId: string): boolean {
        return this.gamePlayerList.delete(socketId);
    }

    addGameUserList(userId: number, socketId: string) {
        this.gameUserList.set(userId, socketId);
        this.updateFriendList(userId);
    }

    deleteGameUserList(userId: number, socketId: string) {
        if (socketId === this.gameUserList.get(userId)) this.gameUserList.delete(userId);
        this.updateFriendList(userId);
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

    deleteDMUserAll(socket: Socket): void {
        const userId = this.getUserIdByDMSocketId(socket.id);
        this.dmUserList.delete(userId);
        this.dmSocketList.delete(socket.id);
        this.blockList.delete(userId);
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
        return (await this.userService.findUserById(userId)).userName;
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

    getDMUserList(): Map<number, Socket> {
        return this.dmUserList;
    }

    getDMsocketList(): Map<string, number> {
        return this.dmSocketList;
    }

    getBlockListById(userId: number): Array<number> {
        return this.blockList.get(userId);
    }

    getBlockList(): Map<number, Array<number>> {
        return this.blockList;
    }

    getFriendList(): Map<number, Array<number>> {
        return this.friendList;
    }

    getGameUserList(): Map<number, string> {
        return this.gameUserList;
    }

    // * Blocking --

    async setBlockList(userId: number): Promise<void> {
        this.blockList.set(userId, await this.blockedUsersService.getBlockUserListById(userId));
    }

    async blockUser(userId: number, targetId: number) {
        const blockList = this.blockList.get(userId);
        if (blockList.indexOf(targetId) !== -1) return;
        blockList.push(targetId);
        await this.blockedUsersService.blockUserById(userId, targetId);
    }

    async unBlockUser(userId: number, targetId: number) {
        const blockList = this.blockList.get(userId);
        const idx = blockList.indexOf(targetId);
        if (idx === -1) return;
        await this.blockedUsersService.unblockUserById(userId, targetId);
    }

    async isBlocked(userId: number, targetId: number): Promise<boolean> {
        return await this.blockedUsersService.isBlocked(userId, targetId);
    }

    async disconnectIfConnected(userId: number): Promise<void> {
        const socket = this.chatRoomUserList.get(userId);
        if (socket === undefined || socket === null) return;
        console.log('!!!DISCONNECT because user already existed.', (await this.userService.findUserById(userId)).id);
        this.deleteChatUserAll(socket);
        socket.disconnect(false);
    }

    // * friend --
    updateFriendList(userId: number) {
        const friends = this.friendList.get(userId);
        if (!friends) return;
        for (const friend of friends) {
            const socket: Socket = this.dmUserList.get(friend);
            socket.emit('updateFriendList');
        }
    }

    async setFriendList(userId: number) {
        const foundFriendList: Array<number> = await this.friendService.getFriendList(userId); // => Array<number> => map.insert (userId : Array)
        this.friendList.set(userId, foundFriendList);
    }

    getStatusById(userId: number): UserStatus {
        let status: UserStatus = UserStatus.OFFLINE;
        if (this.dmUserList.get(userId) !== undefined && this.dmUserList.get(userId) !== null)
            status = UserStatus.ONLINE;
        if (this.gameUserList.get(userId) !== undefined && this.gameUserList.get(userId) !== null)
            status = UserStatus.GAME;
        return status;
    }

    async getStatusByUserName(userName: string): Promise<UserStatus> {
        const userId: number = await this.getUserIdByUserName(userName);
        return this.getStatusById(userId);
    }

    async getFriendStateList(userName: string): Promise<[string, UserStatus][]> {
        const userId = await this.getUserIdByUserName(userName);
        const friendStateList: [string, UserStatus][] = [];

        const friendNameList: string[] = await this.friendService.getFriendNameList(userId);
        for (const friendName of friendNameList) {
            friendStateList.push([friendName, await this.getStatusByUserName(friendName)]);
        }
        return friendStateList;
    }
}
