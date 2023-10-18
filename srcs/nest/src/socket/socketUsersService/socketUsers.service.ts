import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { Player } from 'src/game/game.interface';
import { FriendService } from 'src/user/friend/friend.service';
import { UserStatus } from 'src/user/user-status.enum';
import { Invitation } from './socketUsers.interface';
import { InviteType } from './socketUsers.enum';

@Injectable()
export class SocketUsersService {
    private logger = new Logger(SocketUsersService.name);
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

    private inviteList: Map<number, Map<number, Invitation>> = new Map<number, Map<number, Invitation>>(); //userId, {inviterId, Invitation}
    private blockList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , blockUserList} // ! -> DB에서 한번 가져 들고왔다가 지속 업데이트
    //TODO 친구 추가, 삭제 시 하기 리스트 업데이트되는지 확인 필요 (업데이트 안할거면 DB에서 매번 찾아서 하는 방법도 있어요)
    private friendList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , friendUserList}

    //* socket
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
        if (this.chatRoomUserList.delete(userId)) this.logger.log(`chatRoomUserList DELETED : ${userId}`);
        if (this.chatRoomSocketList.delete(socket.id)) this.logger.log(`chatRoomSocketList DELETED : ${socket.id}`);
        this.blockList.delete(userId);
    }

    //* Invitation--
    setInviteList(userId: number) {
        const invitations = new Map<number, Invitation>();
        //없을 때만 만듦
        if (this.inviteList.get(userId) === undefined) this.inviteList.set(userId, invitations);
    }

    //로그아웃 시 삭제로직
    async clearServerData(userId: number) {
        //보낸 초대 리스트 삭제
        for (const guest of this.inviteList.keys()) {
            if (this.inviteList.get(guest).get(userId)) {
                this.inviteList.get(guest).delete(userId);
                const guestSocket: Socket = this.dmUserList.get(guest);
                guestSocket.emit('updateInvitation');
                guestSocket.emit('invitationSize', this.inviteList.get(guest).size);
            }
        }
        //받은 초대 리스트 삭제
        this.inviteList.delete(userId);
        //offline status 친구들에게 emit 처리
        try {
            await this.updateFriendListAndEmit(userId);
        } catch (error) {
            this.logger.error('[ERRRRRR] clearServerData');
        }
    }

    async sendInvitation(socketId: string, payload: JSON): Promise<Socket> {
        const hostId: number = this.dmSocketList.get(socketId);
        const hostName: string = await this.getUserNameByUserId(hostId);
        const guestId: number = (await this.userService.getUserByUserName(payload['guestName'])).id;

        const invitation: Invitation = {
            hostName: hostName,
            inviteType: payload['inviteType'],
            chatRoomName: payload['chatRoomName'] ? payload['chatRoomName'] : undefined,
            chatRoomType: payload['chatRoomType'] ? payload['chatRoomType'] : undefined,
            gameMode: payload['gameMode'] ? payload['gameMode'] : undefined,
        };
        this.inviteList.get(guestId).set(hostId, invitation);
        return this.dmUserList.get(guestId);
    }

    isInvited(socketId: string, roomName: string): Boolean {
        //user가 해당 roomName privateRoom에 초대받았는지 반환
        const userId = this.getUserIdByChatSocketId(socketId);
        const invitations: Map<number, Invitation> = this.inviteList.get(userId);

        for (const hostId of invitations.keys()) {
            if (invitations.get(hostId).chatRoomName === roomName) return true;
        }
        return false;
    }

    async agreeInvite(socketId: string, hostName: string) {
        const hostId: number = (await this.userService.getUserByUserName(hostName)).id;
        const guestId: number = this.dmSocketList.get(socketId);
        const invitation: Invitation = this.inviteList.get(guestId).get(hostId);
        if (invitation === undefined) return;
        //invitation 삭제
        this.inviteList.get(guestId).delete(hostId);
    }

    async declineInvite(socketId: string, hostName: string): Promise<Socket> {
        const hostId: number = (await this.userService.getUserByUserName(hostName)).id;
        const guestId: number = this.dmSocketList.get(socketId);
        const invitation: Invitation = this.inviteList.get(guestId).get(hostId);
        if (invitation === undefined) return;
        if (invitation.inviteType === InviteType.GAME) {
            //Game의 경우 game socket으로 초대 거절 이벤트 전달
            const hostSocketId: string = this.gameUserList.get(hostId);
            const hostSocket: Socket = this.gamePlayerList.get(hostSocketId).socket;
            hostSocket.emit('denyInvite');
        }
        this.inviteList.get(guestId).delete(hostId);
        return this.dmUserList.get(guestId);
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

    async addGameUserList(userId: number, socketId: string) {
        try {
            this.gameUserList.set(userId, socketId);
            await this.updateFriendListAndEmit(userId);
        } catch (error) {
            this.logger.error('[ERRRRRR] addGameUserList');
        }
    }

    async deleteGameUserList(userId: number, socketId: string) {
        try {
            if (socketId === this.gameUserList.get(userId)) this.gameUserList.delete(userId);
            await this.updateFriendListAndEmit(userId);
        } catch (error) {
            this.logger.error('[ERRRRRR] deleteGameUserList');
        }
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
        this.deleteDMSocket(socket.id);
        this.blockList.delete(userId);
        this.friendList.delete(userId);
    }

    getUserIdByDMSocketId(socketId: string): number | undefined {
        const userId: number = this.dmSocketList.get(socketId);
        return userId;
    }

    async addDMSocket(socketId: string, userId: number): Promise<void> {
        try {
            this.dmSocketList.set(socketId, userId);
            await this.updateFriendListAndEmit(userId);
        } catch (error) {
            this.logger.error('[ERRRRRR] addDMSocket');
        }
    }

    async deleteDMSocket(socketId: string): Promise<boolean> {
        try {
            const userId: number = this.dmSocketList.get(socketId);
            await this.updateFriendListAndEmit(userId);
            return this.dmSocketList.delete(socketId);
        } catch (error) {
            this.logger.error('[ERRRRRR] deleteDMSocket');
        }
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

    getInviteListByUserId(userId: number): Map<number, Invitation> {
        return this.inviteList.get(userId);
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
        this.logger.log(`DISCONNECT because ${userId} was already connected.`);
        this.deleteChatUserAll(socket);
        socket.disconnect(false);
    }

    // * friend --
    async updateFriendListAndEmit(userId: number) {
        try {
            const foundFriendList: Array<number> = await this.friendService.getFriendList(userId);
            for (const friend of foundFriendList) {
                const socket: Socket = this.dmUserList.get(friend);
                if (socket) socket.emit('updateFriendList');
            }
        } catch (error) {
            this.logger.error('[ERRRRR] updateFriendListAndEmit');
        }
    }

    async setFriendList(userId: number) {
        const foundFriendList: Array<number> = await this.friendService.getFriendList(userId); // => Array<number> => map.insert (userId : Array)
        this.friendList.set(userId, foundFriendList);
    }

    addFriend(userId: number, targetId: number) {
        // map에서 userID value를 찾고 (=> Array<number>) 거기에 targetId 추가, 이미 있다면 무시
        const foundFriendList: Array<number> = this.friendList.get(userId);
        const targetFriendList: Array<number> = this.friendList.get(targetId);

        try {
            foundFriendList.push(targetId);
            targetFriendList.push(userId);
        } catch (e) {
            this.logger.warn(`cannot addFriend : ${e}`);
        }
    }

    deleteFriend(userId: number, targetId: number) {
        const foundFriendList: Array<number> = this.friendList.get(userId); // => Array<number> => map.insert (userId : Array)
        const targetFriendList: Array<number> = this.friendList.get(targetId);
        try {
            const idx = foundFriendList.indexOf(targetId);
            foundFriendList.splice(idx, 1);
        } catch (e) {
            this.logger.error(`cannot deleteFriend : ${e}`);
        }
        try {
            const targetIdx = targetFriendList.indexOf(userId);
            targetFriendList.splice(targetIdx, 1);
        } catch (e) {
            this.logger.warn(`cannot deleteFriend : ${e}`);
        }
    }

    getStatusById(userId: number): UserStatus {
        let status: UserStatus = UserStatus.OFFLINE;
        if (this.dmUserList.get(userId) !== undefined && this.dmUserList.get(userId) !== null)
            status = UserStatus.ONLINE;
        if (this.gameUserList.get(userId) !== undefined) status = UserStatus.GAME;
        return status;
    }

    async getStatusByUserName(userName: string): Promise<UserStatus> {
        const userId: number = await this.getUserIdByUserName(userName);
        return this.getStatusById(userId);
    }

    async getFriendStateList(userName: string): Promise<[string, UserStatus][]> {
        const userId = await this.getUserIdByUserName(userName);
        const friendStateList: [string, UserStatus][] = [];

        const friendIdList: Array<number> = this.friendList.get(userId);
        for (const friendId of friendIdList) {
            const friendName = await this.getUserNameByUserId(friendId);
            friendStateList.push([friendName, await this.getStatusByUserName(friendName)]);
        }
        return friendStateList;
    }
}
