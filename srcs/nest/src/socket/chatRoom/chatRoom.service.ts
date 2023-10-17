import { Injectable, Logger } from '@nestjs/common';
import { AppService } from '../../app.service';
import { Socket, Server } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomStatus } from './roomStatus.enum';
import { UserPermission } from './userPermission.enum';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { time } from 'console';
import { InviteType } from '../socketUsersService/socketUsers.enum';
// import { RouterModule } from '@nestjs/core';
// import * as schedule from 'node-schedule';

/*
1. 채팅방 개설
2. 채팅방 나가기
3. 채팅방 리스트 주기
4. 채팅방 안에 있는 사람들끼리 채팅
*/

interface MemberList {
    userName: string;
    permission: UserPermission;
}

@Injectable()
export class ChatRoomService {
    private logger = new Logger(ChatRoomService.name);
    private publicRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();
    private privateRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();

    constructor(private socketUsersService: SocketUsersService) {
        // console.log('🌟🌟🌟new connection!!!! 다 초기화 됨!!!!!!!🌟🌟🌟');
    }

    private async getMemberList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        let userName;
        for (const member of chatRoom.memberList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            memberList.push(userName);
        }
        return memberList;
    }

    private async getMuteList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];

        let userName;
        for (const member of chatRoom.muteList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            memberList.push(userName);
        }
        return memberList;
    }

    // private async getInviteList(chatRoom: ChatRoomDto): Promise<Array<string>> {
    //     const memberList: Array<string> = [];

    //     let userName;
    //     for (const member of chatRoom.inviteList) {
    //         userName = await this.socketUsersService.getUserNameByUserId(member);
    //         memberList.push(userName);
    //     }
    //     return memberList;
    // }

    private async getBanList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];

        let userName;
        for (const member of chatRoom.banList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            memberList.push(userName);
        }
        return memberList;
    }

    private async getBlockListById(userId: number): Promise<Array<number>> {
        // 새로 들어오는 유저의 blockList를 DB에서 꺼내와 배열로 반환하기
        const resultArray = new Array<number>();
        // DB에서 userId가 block한 다른 user의 id들을 가져와 resultArray에 담기
        return resultArray;
    }

    getUserId(socket: Socket): number | undefined {
        return this.socketUsersService.getUserIdByChatSocketId(socket.id);
    }

    async addNewUser(socket: Socket, userId: number, io: Server) {
        // const userName = socket.handshake.query['userName'].toString();
        // console.log('socket id, userId in ADD NEW USER : ', socket.id, userId);
        socket.rooms.clear();

        await this.socketUsersService.disconnectIfConnected(userId);
        this.socketUsersService.addChatRoomUser(userId, socket);
        this.socketUsersService.addChatRoomSocket(socket.id, userId);
        await this.socketUsersService.setBlockList(userId);
        //!test
        // console.log('add new user, has rooms : ', socket.rooms);
    }

    async deleteUser(socket: Socket) {
        const userId = this.getUserId(socket);
        // console.log('DELETE USER', await this.socketUsersService.getUserNameByUserId(userId));
        //user가 속했던 방  삭제
        const publicRooms: Map<string, ChatRoomDto> = this.publicRoomList;
        const privateRooms: Map<string, ChatRoomDto> = this.privateRoomList;
        for (let [k, v] of publicRooms) {
            if (v.memberList.has(userId)) this.publicRoomList.delete(k);
        }
        for (let [k, v] of privateRooms) {
            if (v.memberList.has(userId)) this.privateRoomList.delete(k);
        }
    }
    //result, reason
    emitFailReason(socket: Socket, event: string, reason: string) {
        const response = {
            result: false,
            reason: reason,
        };
        socket.emit(event, response);
    }

    emitSuccess(socket: Socket, event: string) {
        const response = {
            result: true,
            reason: '성공함^^',
        };
        socket.emit(event, response);
    }

    getChatRoomList(): Array<{ roomName: string; requirePassword: boolean }> {
        const keyArray = Array.from(this.publicRoomList.keys()); // keyArray:  [ 'default room', 'roomName', ... ]
        let roomList = new Array<{ roomName: string; requirePassword: boolean }>();
        for (const key of keyArray) {
            const requirePassword = this.publicRoomList.get(key)?.requirePassword;
            roomList.push({
                roomName: key,
                requirePassword: requirePassword,
            });
        }
        this.logger.log(`getChatRoomList :: type: ${typeof roomList}`);
        this.logger.log(roomList);
        return roomList;
    }

    async getUserPermission(socket: Socket, roomStatus: RoomStatus, roomName: string): Promise<UserPermission> {
        // room: ChatRoomDto, userId: number, userName: string
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else if (roomStatus === RoomStatus.PRIVATE) room = this.publicRoomList.get(roomName);
        else return;

        const userId: number = this.getUserId(socket);
        const userName: string = await this.getUserNameBySocket(socket);
        let result: UserPermission;
        result = UserPermission.MEMBER;
        if (room === undefined || room === null) return;
        if (room?.ownerName === userName) result = UserPermission.OWNER;
        else if (room?.operatorList) {
            for (const memberId of room.operatorList) {
                if (memberId === userId) result = UserPermission.ADMIN;
            }
        }
        return result;
    }

    async getUserNameBySocket(socket: Socket): Promise<string> {
        const userId: number = await this.socketUsersService.getUserIdByChatSocketId(socket.id);
        const userName: string = await this.socketUsersService.getUserNameByUserId(userId);
        return userName;
    }

    async getChatRoomInfo(socket: Socket, roomName: string, roomstatus: RoomStatus) {
        //public/private 중 특정 방 정보를 준다.
        let chatroomDto: ChatRoomDto;
        if (roomstatus === RoomStatus.PUBLIC) {
            chatroomDto = this.publicRoomList.get(roomName);
        } else chatroomDto = this.privateRoomList.get(roomName);
        if (!chatroomDto) {
            // console.log('getChatRoomInfo :: 채팅방 정보를 찾을 수 없어요 : ', roomName);
            return undefined;
        }
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);

        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        const roomInfo = {
            roomName: chatroomDto.roomName,
            ownerName: chatroomDto.ownerName,
            status: chatroomDto.status,
            requirePassword: chatroomDto.requirePassword,
            banList: await this.getBanList(chatroomDto),
            muteList: await this.getMuteList(chatroomDto),
        };
        return roomInfo;
    }

    async getMemberStateList(socket: Socket, roomName: string, roomStatus: RoomStatus): Promise<Array<MemberList>> {
        const memberStateList: Array<MemberList> = [];
        let room: ChatRoomDto;
        if (roomName === undefined || roomStatus === undefined) {
            this.emitFailReason(socket, 'memberStateList', 'undefined exception');
            return;
        }
        if (roomName === null || roomStatus === null) {
            this.emitFailReason(socket, 'memberStateList', 'null exception');
            return;
        }

        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else return;

        if (room === undefined || room.memberList === undefined) {
            this.emitFailReason(socket, 'getMemberStateList', 'room or memberList does not exist');
            return;
        }

        for (const member of room.memberList) {
            const name: string = await this.socketUsersService.getUserNameByUserId(member);
            let permission: UserPermission = UserPermission.MEMBER;
            if (room.operatorList.has(member)) permission = UserPermission.ADMIN;
            if (room.ownerName === name) permission = UserPermission.OWNER;
            memberStateList.push({ userName: name, permission: permission });
        }
        return memberStateList;
    }

    async createChatRoom(socket: Socket, createRoomDto: CreateRoomDto, io: Server): Promise<void> {
        //check duplicate

        let checkDuplicate: ChatRoomDto;
        if (createRoomDto.status === RoomStatus.PUBLIC)
            checkDuplicate = this.publicRoomList.get(createRoomDto.roomName);
        else checkDuplicate = this.privateRoomList.get(createRoomDto.roomName);
        if (checkDuplicate !== undefined) {
            this.logger.warn(`Create failed : chat room already exists.`);
            this.emitFailReason(socket, 'createChatRoom', 'channel already exists.');
            return;
        }

        const roomDto: ChatRoomDto = new ChatRoomDto();
        // console.log('chat room dto created🥪.'); //귀여워 🥹

        roomDto.roomName = createRoomDto.roomName;
        roomDto.ownerName = await this.socketUsersService.getUserNameByUserId(
            this.socketUsersService.getUserIdByChatSocketId(socket.id),
        );

        roomDto.requirePassword = createRoomDto.requirePassword;
        roomDto.status = createRoomDto.status;
        if (createRoomDto.password) {
            roomDto.password = createRoomDto.password;
        }

        this.logger.log(`CREATE CHAT ROOM : ${roomDto}`);
        if (createRoomDto.status === RoomStatus.PRIVATE) this.privateRoomList.set(createRoomDto.roomName, roomDto);
        else if (createRoomDto.status === RoomStatus.PUBLIC) this.publicRoomList.set(createRoomDto.roomName, roomDto);

        if (createRoomDto.status === RoomStatus.PRIVATE) await this.joinPrivateChatRoom(socket, roomDto.roomName, io);
        else if (createRoomDto.status === RoomStatus.PUBLIC)
            await this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password, io);
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    explodeRoom(socket: Socket, pastRoom: ChatRoomDto, io: Server) {
        const pastRoomName = pastRoom.roomName;
        socket.to(pastRoomName).emit('explodeRoom', () => {});
        if (pastRoom.status === RoomStatus.PUBLIC) this.publicRoomList.delete(pastRoomName);
        else if (pastRoom.status === RoomStatus.PRIVATE) this.privateRoomList.delete(pastRoomName);
        this.logger.log(`ROOM ${pastRoomName} exploded.`);
        io.emit('getChatRoomList', this.getChatRoomList());
        io.socketsLeave(pastRoomName);
        // console.log('🥇이거 보내는 거임 ------ !!!!!!!!!!!!!!!!!!!!! ----------- !!!!!!!🥇 ', this.getChatRoomList());
    }

    async leavePastRoom(socket: Socket, rooms: Set<string>, io: Server): Promise<boolean> {
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        this.logger.log('LEAVE PAST ROOM');
        const array = Array.from(rooms);
        const pastRoomName = array[0];

        socket.leave(pastRoomName); //void

        if (pastRoomName === undefined) {
            this.logger.debug(`LEAVE PAST ROOM : ${userName} has no pastroom.`);
            this.emitFailReason(socket, 'leavePastRoom', 'there was no pastroom');
            return;
        }

        //? 유저가 privateroom에 있었으면 privateRoomList에서 찾아야하지 않을까요? (1) (juhoh) -> 맞는 것 같습니다
        let pastRoom: ChatRoomDto;
        pastRoom = this.publicRoomList.get(pastRoomName);
        if (pastRoom === undefined) pastRoom = this.privateRoomList.get(pastRoomName);
        if (pastRoom === undefined) {
            this.logger.warn(`LEAVE PAST ROOM : pastroom is undefined`);
            return;
        }
        const pastRoomStatus: RoomStatus = pastRoom?.status;
        socket.to(pastRoomName).emit('sendMessage', userName + '님이 방을 나가셨습니다.');
        if (userName === pastRoom?.ownerName) {
            // owner가 나갈 경우 방 폭파
            // socket.to(pastRoomName).emit('explodeChatRoom', '방 소유자가 나갔으므로 채팅방이 사라집니다.');
            this.explodeRoom(socket, pastRoom, io);
        } else {
            //한 유저만 chatRoom에서 삭제
            // console.log('DELETE ONLY ONE USER (no room explode)');
            pastRoom?.memberList.delete(userId);
            pastRoom?.muteList.delete(userId);
            socket.leave(pastRoomName);
            // console.log('LEAVE PAST ROOM: after ', socket.id, ' leave : ', socket.rooms);
            // console.log('😭😭😭어째서...', pastRoom);
            const roomInfo = await this.getChatRoomInfo(socket, pastRoomName, pastRoomStatus);
            io.to(pastRoomName).emit('getChatRoomInfo', roomInfo);
        }
        // this.emitSuccess(socket, 'leavePastRoom');
        return true;
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string, io: Server): Promise<void> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);

        // console.log('JOIN PUBLIC CHAT ROOM targetRoom : ', targetRoom);
        // console.log('userId: ', userId);
        if (targetRoom === undefined) {
            //NO SUCH ROOM
            this.logger.warn(`JOIN PUBLIC CHAT ROOM : ${targetRoom} does not exist.`);
            this.emitFailReason(socket, 'joinPublicChatRoom', 'Room does not exist.');
            return;
        }
        //banList
        if (targetRoom.banList.has(userId)) {
            this.logger.warn(`JOIN PUBLIC CHAT ROOM : ${userName} is banned from ${targetRoom}`);
            this.emitFailReason(socket, 'joinPublicChatRoom', 'user is banned.');
            return;
        }

        //locked ROOMMMMMMMMA
        if (targetRoom.requirePassword === true && password !== targetRoom.password) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'wrong password');
            return;
        }

        await this.leavePastRoom(socket, socket.rooms, io);
        socket.join(roomName);

        //user의 Channel 변경
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        socket.to(roomName).emit('receiveMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPublicChatRoom');
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string, io: Server): Promise<void> {
        const targetRoom = this.privateRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByDMSocketId(socket.id);
        if (targetRoom == undefined) {
            this.logger.warn(`JOIN PRIVATE CHAT ROOM : ${targetRoom} does not exist.`);
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'Room does not exists.');
            return;
        }
        if (targetRoom.banList.has(userId)) {
            this.logger.warn(`JOIN PRIVATE CHAT ROOM : ${userId} is banned from ${targetRoom}`);
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is banned.');
            return;
        }

        if (!this.socketUsersService.isInvited(socket.id, roomName)) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'is not invited.');
            return;
        }

        await this.leavePastRoom(socket, socket.rooms, io);
        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        socket.to(roomName).emit('receiveMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPrivateChatRoom');
    }

    async kickUser(socket: Socket, roomName: string, targetName: string, io: Server) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        //!test
        if (socket.rooms[0] != roomName)
            console.log('test failed. user 가 속해있는 room이 1개 이상이거나 맞지 않습니다.');
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        socket.to(roomName).emit('kickUser', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        const targetId = await this.socketUsersService.getUserIdByUserName(userName);
        const targetSocket = this.socketUsersService.getChatSocketById(targetId);
        if (targetSocket !== undefined) await this.leavePastRoom(socket, socket.rooms, io);
        this.emitSuccess(socket, 'kickUser');
    }

    private checkOperator(roomName: string, roomStatus: RoomStatus, userId: number): boolean {
        let room;
        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else room = this.privateRoomList.get(roomName);
        const condition = (id) => {
            if (id === userId) return true;
        };
        if (room.operatorList.findIndex(condition) === -1) return false;
        return true;
    }

    async muteUser(
        socket: Socket,
        status: RoomStatus,
        roomName: string,
        targetName: string,
        time: number,
    ): Promise<void> {
        //! test  : op가 아니어도 된다면?! (front에서 혹시 잘못 띄우는지 확인)
        const userId = this.getUserId(socket);
        if (this.checkOperator(roomName, status, userId) === false) {
            this.logger.error(`User ${userId} is not an operator.`);
            return;
        }

        if (status === undefined || roomName === undefined || targetName === undefined || time === undefined) {
            this.emitFailReason(socket, 'muteUser', 'undefined exception');
            return;
        }
        if (status === null || roomName === null || targetName === null || time === null) {
            this.emitFailReason(socket, 'muteUser', 'null exception');
            return;
        }

        //TODO : test . mute  가 잘 사라지나.
        let room: ChatRoomDto;

        if (status === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        room.muteList.add(targetId);

        const removeMuteUser = (targetName, roomDto) => {
            roomDto.muteList.delete(targetName);
        };

        setTimeout(() => {
            removeMuteUser(targetName, room);
        }, time * 1000);
    }

    async blockUser(socket: Socket, targetName: string): Promise<void> {
        //1. map에서 가져옴
        //2. 추가후 다시 갱신
        //! test
        const userId = this.getUserId(socket);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        await this.socketUsersService.blockUser(userId, targetId);
        this.emitSuccess(socket, 'blockUser');
    }

    async unBlockUser(socket: Socket, targetName: string): Promise<void> {
        const userId = this.getUserId(socket);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        await this.socketUsersService.unBlockUser(userId, targetId);
        this.emitSuccess(socket, 'unBlockUser');
    }

    sendMessage(socket: Socket, roomName: string, userName: string, content: string, status: RoomStatus): boolean {
        let room: ChatRoomDto;

        if (roomName === undefined || roomName === null) {
            this.emitFailReason(socket, 'sendMessage', 'roomName undefined');
            return;
        }

        if (userName === undefined || userName === null) {
            this.emitFailReason(socket, 'sendMessage', 'userName is invalid');
            return;
        }

        if (status == RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else if (status === RoomStatus.PUBLIC) {
            room = this.publicRoomList.get(roomName);
        }
        if (room === undefined || room === null) {
            this.emitFailReason(socket, 'sendMessage', 'room has already exploded.');
            return;
        }
        // console.log('socket id:', socket.id, 'user id:', this.getUserId(socket));
        // console.log(
        //     'our holded socket:',
        //     this.socketUsersService.getChatRoomUserList().get(this.getUserId(socket))?.id,
        // );
        // if (socket.id !== this.socketUsersService.getChatRoomUserList().get(this.getUserId(socket)).id) {
        //     console.log('saved socket different🤹🏿🤹🏿. DISCONNECT!');
        //     socket.disconnect(false);
        //     return;
        // }

        socket.emit('sendMessage', { userName: userName, content: content }); //sender
        socket.to(room.roomName).emit('sendMessage', { userName: userName, content: content }); //members
        this.logger.log(`Successfully sent message. ${userName} in ${roomName} : ${content}`);
    }

    /*
    socket 친구가 userName 친구의 메시지를 받아도 될까요?
    A가 B의 메시지를 받아도 되는가? A->B B->A 둘 다 검사??
    @Brief userName이 보낸 메시지를 socket의 front 에게 렌더링 할지 말지 알려줍니다.
    */
    async receiveMessage(
        socket: Socket,
        userName: string,
        content: string,
    ): Promise<{ canReceive: boolean; userName: string; content: string }> {
        const userId: number = this.getUserId(socket);
        const targetId: number = await this.socketUsersService.getUserIdByUserName(userName);
        const isBlocked: boolean = await this.socketUsersService.isBlocked(userId, targetId);
        const result = {
            canReceive: !isBlocked,
            userName: userName,
            content: content,
        };
        return result;
    }

    async banUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        const condition = (curId) => {
            curId === targetId;
        };
        if (room.banList.has(targetId)) {
            this.emitFailReason(socket, 'banUser', 'user already banned');
            return;
        }
        room.banList.add(targetId);
        this.emitSuccess(socket, 'banUser');
    }

    async unbanUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        room.banList.delete(targetId);
        this.emitSuccess(socket, 'unbanUser');
    }

    async grantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        const condition = (curId) => {
            curId === targetId;
        };
        if (room === undefined) this.emitFailReason(socket, 'grantUser', 'such room does not exists.');

        //! test
        if (room.operatorList === undefined) this.logger.error('test failed. operatorList is undefined.');
        else if (room.operatorList.has(targetId)) this.emitFailReason(socket, 'grantUser', 'is already operator.');

        //operatorList append
        room.operatorList.add(targetId);
        this.emitSuccess(socket, 'grantUser');

        const memberList = await this.getMemberStateList(socket, roomName, roomStatus);
        if (memberList === undefined) {
            this.emitFailReason(socket, 'getMemberStateList', 'memberList undefined');
            return;
        }
        socket.emit('getMemberStateList', memberList);
    }

    async ungrantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        if (room === undefined) this.emitFailReason(socket, 'ungrantUser', 'room does not exists.');
        if (room.operatorList === undefined) {
            this.logger.error('test failed. operatorList is undefined.');
            return;
        }

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        room.operatorList.delete(targetId);
        this.emitSuccess(socket, 'ungrantUser');

        const memberList = await this.getMemberStateList(socket, roomName, roomStatus);
        socket.emit('getMemberStateList', memberList);
    }

    setRoomPassword(socket: Socket, roomName: string, password: string) {
        this.logger.log('SET ROOM PASSWORD');
        const room = this.publicRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'setRoomPassword', 'such room does not exist.');
        room.requirePassword = true;
        room.password = password;
        this.emitSuccess(socket, 'setRoomPassword');
    }

    unsetRoomPassword(socket: Socket, roomName: string) {
        this.logger.log('UNSET ROOM PASSWORD');
        const room = this.publicRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'unsetRoomPassword', 'such room does not exist.');
        room.requirePassword = false;
        room.password = null;
        this.emitSuccess(socket, 'unsetRoomPassword');
    }
}
