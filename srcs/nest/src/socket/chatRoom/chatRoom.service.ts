import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomStatus } from './roomStatus.enum';
import { UserPermission } from './userPermission.enum';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
// import { RouterModule } from '@nestjs/core';
// import * as schedule from 'node-schedule';

/*
1. 채팅방 개설
2. 채팅방 나가기
3. 채팅방 리스트 주기
4. 채팅방 안에 있는 사람들끼리 채팅
*/
@Injectable()
export class ChatRoomService {
    private publicRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();
    private privateRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();

    constructor(private socketUsersService: SocketUsersService) {
        console.log('🌟🌟🌟new connection!!!! 다 초기화 됨!!!!!!!🌟🌟🌟');
    }

    private async getMemberList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        console.log(chatRoom.roomName, ' : ', chatRoom.memberList);
        let userName;
        for (const member of chatRoom.memberList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            memberList.push(userName);
        }
        return memberList;
    }

    private async getOperatorList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];

        let userName;
        for (const member of chatRoom.operatorList) {
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
        console.log('socket id, userId in ADD NEW USER : ', socket.id, userId);
        socket.rooms.clear();

        this.socketUsersService.addChatRoomUser(userId, socket);
        this.socketUsersService.addChatRoomSocket(socket.id, userId);
        this.socketUsersService.setBlockList(userId);

        //!test
        console.log('add new user, has rooms : ', socket.rooms);
    }

    async deleteUser(socket: Socket) {
        console.log('DELETE USER', await this.socketUsersService.getUserNameByUserId(this.getUserId(socket)));
        this.socketUsersService.deleteChatUserAll(socket);
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
            reason: '성공함^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
        };
        socket.emit(event, response);
    }

    getChatRoomList() {
        const keyArray = Array.from(this.publicRoomList.keys()); // keyArray:  [ 'default room', 'roomName', ... ]
        console.log('keyArray: ', keyArray);
        return keyArray;
    }

    private getUserPermission(room: ChatRoomDto, userId: number, userName: string) {
        let result: UserPermission;
        result = UserPermission.MEMBER;
        if (room?.ownerName === userName) result = UserPermission.OWNER;
        if (room?.operatorList) {
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
            console.log('getChatRoomInfo :: 채팅방 정보를 찾을 수 없어요 : ', roomName);
            return undefined;
        }
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);

        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        const userPermission: UserPermission = this.getUserPermission(chatroomDto, userId, userName);
        const roomInfo = {
            roomName: chatroomDto.roomName,
            ownerName: chatroomDto.ownerName,
            status: chatroomDto.status,
            requirePassword: chatroomDto.requirePassword,
            operatorList: await this.getOperatorList(chatroomDto),
            memberList: await this.getMemberList(chatroomDto),
            userPermission: userPermission, //userName 제거
        };
        return roomInfo;
    }

    // operatorList: string[];
    // memberList: string[];
    // inviteList: string[];
    // banList: string[];
    // muteList: string[];
    // roomName: string;
    // ownerName: string;
    // status: RoomStatus; // 또는 RoomStatus 타입으로 정의
    // password: string | null;
    // requirePassword: boolean;
    // userPermission: UserPermission;

    async createChatRoom(socket: Socket, createRoomDto: CreateRoomDto, io: Server): Promise<void> {
        //check duplicate
        let checkDuplicate: ChatRoomDto;
        if (createRoomDto.status === RoomStatus.PUBLIC)
            checkDuplicate = this.publicRoomList.get(createRoomDto.roomName);
        else checkDuplicate = this.privateRoomList.get(createRoomDto.roomName);
        if (checkDuplicate !== undefined) {
            console.log('fail: chat room already exists.');
            this.emitFailReason(socket, 'createChatRoom', 'channel already exists.');
            return;
        }

        const roomDto: ChatRoomDto = new ChatRoomDto();
        console.log('chat room dto created🥪.'); //귀여워 🥹

        roomDto.roomName = createRoomDto.roomName;
        roomDto.ownerName = await this.socketUsersService.getUserNameByUserId(
            await this.socketUsersService.getUserIdByChatSocketId(socket.id),
        );

        roomDto.requirePassword = createRoomDto.requirePassword;
        roomDto.status = createRoomDto.status;
        if (createRoomDto.password) {
            roomDto.password = createRoomDto.password;
        }

        console.log('CREATE CHAT ROOM: chat room', roomDto);
        if (createRoomDto.status === RoomStatus.PRIVATE) this.privateRoomList.set(createRoomDto.roomName, roomDto);
        else this.publicRoomList.set(createRoomDto.roomName, roomDto);

        if (createRoomDto.status === RoomStatus.PRIVATE) await this.joinPrivateChatRoom(socket, roomDto.roomName, io);
        else await this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password, io);

        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    explodeRoom(socket: Socket, pastRoom: ChatRoomDto, io: Server) {
        console.log('ROOM EXPLODE : ', pastRoom.roomName);
        const pastRoomName = pastRoom.roomName;
        io.emit('getChatRoomList', this.getChatRoomList());
        socket.to(pastRoomName).emit('explodeRoom');
        //!test
        io.in(pastRoomName).disconnectSockets(false);
        if (pastRoom.status === RoomStatus.PUBLIC) this.publicRoomList.delete(pastRoomName);
        else if (pastRoom.status === RoomStatus.PRIVATE) this.privateRoomList.delete(pastRoomName);
    }

    async leavePastRoom(socket: Socket, rooms: Set<string>, io: Server): Promise<boolean> {
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        console.log('LEAVE PAST ROOM');
        console.log('userName : ', userName);
        console.log('rooms: ', rooms);
        const array = Array.from(rooms);
        console.log('room list: ', array);
        const pastRoomName = array[0];

        socket.leave(pastRoomName); //void

        if (pastRoomName === undefined) {
            console.log('no past room. bye');
            this.emitFailReason(socket, 'leavePastRoom', 'there was no pastroom');
            return;
        }

        //? 유저가 privateroom에 있었으면 privateRoomList에서 찾아야하지 않을까요? (1) (juhoh) -> 맞는 것 같습니다
        let pastRoom: ChatRoomDto;
        pastRoom = this.publicRoomList.get(pastRoomName);
        if (pastRoom === undefined) pastRoom = this.privateRoomList.get(pastRoomName);
        if (pastRoom === undefined) {
            console.log('LEAVEPASTROOM : 이');
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
            console.log('DELETE ONLY ONE USER (no room explode)');
            pastRoom?.memberList.delete(userId);
            pastRoom?.muteList.delete(userId);
            socket.leave(pastRoomName);
            console.log('LEAVE PAST ROOM: after ', socket.id, ' leave : ', socket.rooms);
            console.log('😭😭😭어째서...', pastRoom);
            const roomInfo = await this.getChatRoomInfo(socket, pastRoomName, pastRoomStatus);
            io.to(pastRoomName).emit('getChatRoomInfo', roomInfo);
        }
        this.emitSuccess(socket, 'leavePastRoom');
        return true;
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string, io: Server): Promise<void> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        const userName = this.socketUsersService.getUserNameByUserId(userId);

        console.log('JOIN PUBLIC CHAT ROOM targetRoom : ', targetRoom);
        console.log('userId: ', userId);
        if (targetRoom === undefined) {
            //NO SUCH ROOM
            console.log('no such room');
            this.emitFailReason(socket, 'joinPublicChatRoom', 'Room does not exists.');
            return;
        }
        //banList
        if (targetRoom.banList.has(userId)) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'user is banned.');
            return;
        }

        //locked ROOMMMMMMMMA
        if (targetRoom.requirePassword === true && password !== targetRoom.password) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'wrong password');
            return;
        }

        console.log('TEST JOIN PUBLIC: before leave: ', socket.rooms);
        await this.leavePastRoom(socket, socket.rooms, io);
        socket.join(roomName);
        console.log('TEST JOIN PUBLIC: after leave: ', socket.rooms);
        //!test
        // sockejoinPublict.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?

        //user의 Channel 변경
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        console.log('joinPublicChatRoom :: targetRoom memberList : ', targetRoom.memberList);
        console.log('JOIN PUBLIC CHAT ROOM, result socket.rooms:', socket.rooms);
        // socket.to(roomName).emit('joinPublicChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPublicChatRoom');
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string, io: Server): Promise<void> {
        const targetRoom = this.privateRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByDMSocketId(socket.id);
        if (targetRoom == undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'Room does not exists.');
            return;
        }
        if (targetRoom.banList.has(userId)) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is banned.');
            return;
        }
        if (!targetRoom.inviteList.has(userId)) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is not invited.');
            return;
        }

        // socket.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?
        await this.leavePastRoom(socket, socket.rooms, io);

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        socket.to(roomName).emit('joinPrivateChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
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
        if (this.checkOperator(roomName, status, userId) === false) console.log('test failed. user is not an oper.');

        //TODO : test . mute  가 잘 사라지나.
        const removeMuteUser = (targetName, roomDto) => {
            roomDto.muteList.delete(targetName);
        };
        let room: ChatRoomDto;
        if (status === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        room.muteList.add(targetId);
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
        if (status == RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else if (status === RoomStatus.PUBLIC) {
            room = this.publicRoomList.get(roomName);
        } else {
            this.emitFailReason(socket, 'sendMessage', 'room has already exploded.');
            return;
        }

        const userId = this.getUserId(socket);
        console.log('message to ', roomName, 'room:', room);
        socket.emit('sendMessage', { userName: userName, content: content }); //sender
        socket.to(room.roomName).emit('sendMessage', { userName: userName, content: content }); //members
        console.log('successfully sent message.', userName, ',', content);
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
            canReceive: isBlocked,
            userName: userName,
            content: content,
        };
        return result;
    }

    async inviteUser(socket: Socket, roomName: string, userName: string) {
        //1. input으로 userName받아서 일치하는 사람을 초대한다.
        //2. roomName 에 해당하는 room의 inviteList에 추가.
        const room = this.privateRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'inviteUser', 'such private room does not exists.');
        const foundId = this.getUserId(socket);
        if (room.inviteList.has(foundId)) {
            this.emitFailReason(socket, 'inviteUser', 'user already invited.');
            return;
        }
        const targetId = await this.socketUsersService.getUserIdByUserName(userName);
        room.inviteList.add(targetId);
        this.emitSuccess(socket, 'inviteUser');
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
        if (room.operatorList === undefined) console.log('test failed. operatorList is undefined.');
        else if (room.operatorList.has(targetId)) this.emitFailReason(socket, 'grantUser', 'is already operator.');

        //operatorList append
        room.operatorList.add(targetId);
        this.emitSuccess(socket, 'grantUser');
    }

    async ungrantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        if (room === undefined) this.emitFailReason(socket, 'ungrantUser', 'room does not exists.');
        if (room.operatorList === undefined) {
            console.log('test failed. operatorList is undefined.');
            return;
        }

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        room.operatorList.delete(targetId);
        this.emitSuccess(socket, 'ungrantUser');
    }

    setRoomPassword(socket: Socket, roomName: string, password: string) {
        const room = this.publicRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'setRoomPassword', 'such room does not exist.');
        room.requirePassword = true;
        room.password = password;
        this.emitSuccess(socket, 'setRoomPassword');
    }

    unsetRoomPassword(socket: Socket, roomName: string) {
        const room = this.publicRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'unsetRoomPassword', 'such room does not exist.');
        room.requirePassword = false;
        room.password = null;
        this.emitSuccess(socket, 'unsetRoomPassword');
    }
}
