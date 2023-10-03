import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { RoomInfoDto } from './dto/roominfo.dto';
import { RoomStatus } from './roomStatus.enum';
import { UserService } from 'src/user/user.service';
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
    private userList: Map<number, Socket> = new Map<number, Socket>(); //{username->id, Socket}
    private socketList: Map<string, number> = new Map<string, number>(); //{socket id , username->id}
    private blockList: Map<string, Array<number>> = new Map<string, Array<number>>(); //{socket id , blockUserList}

    constructor(private userService: UserService) {
        const chatRoom = {
            roomName: 'default room',
            ownerName: 'ebang',
            status: RoomStatus.PUBLIC,
            password: 'password',
            requirePasswod: false,
        };
        this.publicRoomList.set('default room', Object.assign(new ChatRoomDto(), chatRoom));
    }

    getUserId(socket: Socket): number | undefined {
        return this.socketList.get(socket.id);
    }

    async addNewUser(socket: Socket, userId: number) {
        // const userName = socket.handshake.query['username'].toString();
        console.log('socket id, userId in ADD NEW USER : ', socket.id, userId);
        this.socketList.set(socket.id, userId);
        this.userList.set(userId, socket);
        this.blockList.set(socket.id, new Array<number>());
        // ? blockList를 DB에서 꺼내와서 채워놔야 하지 않을까?
        //!test : 들어오면 default 룸으로 들어가게 하기.
        socket.rooms.clear();
        await this.joinPublicChatRoom(socket, 'default room', 'password');

        //!test
        // console.log('add new user, has rooms : ', socket.rooms);
        // console.log('add new user, has rooms : ', socket.rooms);
    }

    deleteUser(socket: Socket) {
        this.userList.delete(this.socketList.get(socket.id));
        this.socketList.delete(socket.id);
        this.blockList.delete(socket.id);
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
            result: false,
            reason: null,
        };
        socket.emit(event, response);
    }

    getChatRoomList() {
        // console.log('will send', this.publicRoomList);
        const keyArray = Array.from(this.publicRoomList.keys()); // keyArray:  [ 'default room', 'roomName', ... ]
        // console.log('keyArray: ', keyArray);
        return keyArray;
    }

    getChatRoomInfo(roomName: string, roomstatus: RoomStatus) {
        //public/private 중 특정 방 정보를 준다.
        let roominfo: ChatRoomDto;
        if (roomstatus === RoomStatus.PUBLIC) roominfo = this.publicRoomList.get(roomName);
        else roominfo = this.privateRoomList.get(roomName);
        return roominfo;
    }

    async createChatRoom(socket: Socket, roomInfoDto: RoomInfoDto): Promise<void> {
        //check duplicate
        let checkDuplicate: ChatRoomDto;
        if (roomInfoDto.status === RoomStatus.PUBLIC) checkDuplicate = this.publicRoomList.get(roomInfoDto.roomName);
        else checkDuplicate = this.privateRoomList.get(roomInfoDto.roomName);
        if (checkDuplicate !== undefined) {
            this.emitFailReason(socket, 'createChatRoom', 'channel already exists.');
            return;
        }

        const roomDto: ChatRoomDto = new ChatRoomDto();

        roomDto.roomName = roomInfoDto.roomName;
        roomDto.ownerName = roomInfoDto.userName;
        roomDto.requirePassword = roomInfoDto.requirePassword;
        if (roomInfoDto.password) roomDto.password = roomInfoDto.password;
        if (roomInfoDto.status == RoomStatus.PRIVATE) this.privateRoomList.set(roomInfoDto.roomName, roomDto);
        else this.publicRoomList.set(roomInfoDto.roomName, roomDto);
        if (roomInfoDto.status == RoomStatus.PRIVATE) this.joinPrivateChatRoom(socket, roomDto.roomName);
        else this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password);
        this.emitSuccess(socket, 'createChatRoom');
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    async leavePastRoom(socket: Socket, userId: number) {
        // console.log('socket: ', socket);
        // console.log('LEAVE PAST ROOM ', socket.rooms);
        const userName = (await this.userService.findUserById(userId)).username;
        const pastRoom = this.userList.get(userId)?.rooms;
        let pastRoomName;
        if (pastRoom) pastRoomName = Array.from(pastRoom)[0];
        else pastRoomName = undefined;
        //! test - 1개의 방을 유지하는가?
        // for (const value of this.userList.get(userId).rooms) {
        //     console.log('room : ', value);
        // }
        // console.log('LEAVE PAST ROOM - Get USERID ROOMS', this.userList.get(userId)?.rooms);
        // console.log('LEAVE PAST ROOM - ROOM NAME : ', pastRoomName);
        // console.log('pastRoomName: ', pastRoomName);
        if (pastRoomName !== undefined) {
            //기존에 유저가 있던 채널이 있는지 확인
            const pastRoom: ChatRoomDto = this.publicRoomList.get(pastRoomName);
            socket.to(pastRoomName).emit('sendMessage', userName + '님이 방을 나가셨습니다.');
            //user가 나갈 것임을 출력
            //user가 room owner 인 경우 방 폭파 메시지 출력
            //한 명씩 for 문으로 leave
            if (userName === pastRoom.ownerName) {
                //방 하나를 폭파.
                socket.to(pastRoomName).emit('explodeChatRoom', '방 소유자가 나갔으므로 채팅방이 사라집니다.');
                // 방 타입 검사 후 해당 리스트에서 key-value쌍 item 삭제
                let roomList;
                if (pastRoom.status == RoomStatus.PUBLIC) roomList = this.publicRoomList;
                else roomList = this.privateRoomList;
                roomList.delete(pastRoomName);
            } else {
                //한 유저만 chatRoom에서 삭제
                const condition = (element) => element === pastRoomName;
                let idx = pastRoom.memberList.findIndex(condition);
                pastRoom.memberList.splice(idx, 1); //memberList
                idx = pastRoom.muteList.findIndex(condition); //muteList
                if (idx !== -1) pastRoom.muteList.splice(idx, 1);
                socket.leave(pastRoomName);
            }

            // // 해당 채널의 유저가 0명일 경우, Map에서 삭제
            // if (pastRoom.memberList.length == 0) {
            //     if (pastRoom.status == RoomStatus.PRIVATE) this.privateRoomList.delete(pastRoomName);
            //     else this.publicRoomList.delete(pastRoomName);
            // }
            // console.log('AFTER LEAVE PAST ROOM ', socket.rooms);
            this.emitSuccess(socket, 'leavePastRoom');
        }
        this.emitFailReason(socket, 'leavePastRoom', 'there was no past room.');
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string): Promise<void> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.getUserId(socket);
        console.log('JOIN PUBLIC CHAT ROOM', roomName);
        console.log('socket list:', this.socketList);
        // console.log('userId, socketId', userId, socket.id);
        if (targetRoom == undefined) {
            //NO SUCH ROOM
            this.emitFailReason(socket, 'joinPublicChatRoom', 'Room does not exists.');
            return;
        }
        //banList
        if (targetRoom.banList.find((curId) => curId === userId) !== undefined) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'user is banned.');
            return;
        }
        //locked ROOM
        if (targetRoom.requirePassword == true && password !== targetRoom.password) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'wrong password');
            return;
        }

        this.leavePastRoom(socket, userId);
        //!test
        // console.log('test: must be none: ', socket.rooms);
        // sockejoinPublict.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userId);
        // console.log('user id', userId);
        const user = await this.userService.findUserById(userId);
        // console.log('user :', user);
        const userName = user.username;
        socket.to(roomName).emit('joinPublicChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPublicChatRoom');
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string): Promise<void> {
        const targetRoom = this.privateRoomList.get(roomName);
        const userId = this.getUserId(socket);
        if (targetRoom == undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'Room does not exists.');
            return;
        }
        if (targetRoom.banList.find((curId) => userId === curId) !== undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is banned.');
            return;
        }
        if (targetRoom.inviteList.find((curId) => userId === curId) === undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is not invited.');
            return;
        }

        socket.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?
        this.leavePastRoom(socket, userId);

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userId);
        const userName = (await this.userService.findUserById(userId)).username;
        socket.to(roomName).emit('joinPrivateChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPrivateChatRoom');
    }

    async kickUser(socket: Socket, roomName: string, targetName: string) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userId = this.getUserId(socket);
        //!test
        if (socket.rooms[0] != roomName)
            console.log('test failed. user 가 속해있는 room이 1개 이상이거나 맞지 않습니다.'); //default room도 있음
        const userName = (await this.userService.findUserById(userId)).username;
        socket.to(roomName).emit('kickUser', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        this.leavePastRoom(socket, targetId);
        this.emitSuccess(socket, 'kickUser');
    }

    async muteUser(
        socket: Socket,
        status: RoomStatus,
        roomName: string,
        targetName: string,
        time: number,
    ): Promise<void> {
        //TODO : test  : op가 아니어도 된다면?! (front에서 혹시 잘못 띄우는지 확인)

        //TODO : test . mute  가 잘 사라지나.
        const removeMuteUser = (targetName, roomDto) => {
            roomDto.muteList.delete(targetName);
        };
        let room: ChatRoomDto;
        if (status === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        room.muteList.push(targetId);
        setTimeout(() => {
            removeMuteUser(targetName, room);
        }, time * 1000);
    }

    getUserBlockList(socket: Socket) {
        return this.blockList.get(socket.id);
        //Array<User>
    }

    async blockUser(socket: Socket, targetName: string): Promise<void> {
        //1. map에서 가져옴
        //2. 추가후 다시 갱신
        //! test
        if (!this.blockList.has(socket.id)) console.log('test failed: socket.id에 해당하는 키 값이 존재하지 않습니다.');
        const blockedList = this.blockList.get(socket.id);
        // //! test
        // if (blockedList === undefined) console.log('test failed : blockList의 Array값이 undefined입니다.');
        const condition = (element) => element === socket.id;
        const blockedElement = blockedList.find(condition);
        if (blockedElement !== undefined) this.emitFailReason(socket, 'blockUser', 'already blocked.');
        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        blockedList.push(targetId);
        this.emitSuccess(socket, 'blockUser');
    }

    async unBlockUser(socket: Socket, targetName: string): Promise<void> {
        //1. socket.id를 통해 blockList의 value(Array<string>) 가져오기
        //2. value에서 targetName 찾기
        //3. targetName 제거
        const blockedList = this.blockList.get(socket.id);
        // ? blockedList 에서 키를 못찾거나 밸류가 없으면?
        //!test
        if (!this.blockList.has(socket.id)) console.log('test failed: socket.id에 해당하는 키 값이 존재하지 않습니다.');
        // //! test
        // if (blockedList === undefined) console.log('test failed : blockList의 Array값이 undefined입니다.');
        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const condition = (element) => element === targetId;
        const idx = blockedList.findIndex(condition);
        blockedList.splice(idx, 1);
        this.emitSuccess(socket, 'unBlockUser');
    }

    async sendMessage(socket: Socket, roomName: string, status: RoomStatus, userName: string, content: string) {
        // TODO : muteList 검사 -> room
        // TODO : blockList 검사는 프론트랑 협의 하기
        //1. 해당 room에서 user가 muteList 에 있는지 조회.
        //2. broadcast
        let room: ChatRoomDto;
        if (status == RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else {
            room = this.publicRoomList.get(roomName);
        }
        const userId = (await this.userService.getUserByUsername(userName)).id;
        if (room.muteList === undefined) console.log('mutelist is undefine.\n');
        else if (room.muteList.find((element) => userId === element) !== undefined) return;

        console.log('successfully sent message.');
        socket.to(roomName).emit('sendMessage', content);
    }

    async inviteUser(socket: Socket, roomName: string, username: string) {
        //1. input으로 username받아서 일치하는 사람을 초대한다.
        //2. roomName 에 해당하는 room의 inviteList에 추가.
        const room = this.privateRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'inviteUser', 'such private room does not exists.');
        const condition = (element) => element === username;
        if (room.inviteList.find(condition) !== undefined) {
            this.emitFailReason(socket, 'inviteUser', 'user already invited.');
            return;
        }
        const userId = (await this.userService.getUserByUsername(username)).id;
        room.inviteList.push(userId);
        this.emitSuccess(socket, 'inviteUser');
    }

    async banUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const condition = (curId) => {
            curId === targetId;
        };
        if (room.banList.find(condition) !== undefined) {
            this.emitFailReason(socket, 'banUser', '');
            return;
        }
        room.banList.push(targetId);
        this.emitSuccess(socket, 'banUser');
    }

    async unbanUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const condition = (curId) => {
            curId === targetId;
        };
        const idx = room.banList.findIndex(condition);
        if (idx === -1) this.emitFailReason(socket, 'unbanUser', 'was not banned.');
        room.banList.splice(idx, 1);
        this.emitSuccess(socket, 'unbanUser');
    }

    async grantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const condition = (curId) => {
            curId === targetId;
        };
        if (room === undefined) this.emitFailReason(socket, 'grantUser', 'such room does not exists.');

        //! test
        if (room.operatorList === undefined) console.log('test failed. operatorList is undefined.');
        else if (room.operatorList.find(condition) !== undefined)
            this.emitFailReason(socket, 'grantUser', 'is already operator.');

        //operatorList append
        room.operatorList.push(targetId);
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

        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const condition = (curId) => {
            curId === targetId;
        };
        const idx = room.operatorList.findIndex(condition);
        if (idx === -1) this.emitFailReason(socket, 'ungrantUser', 'is not operator.');
        room.operatorList.splice(idx, 1);
        this.emitSuccess(socket, 'ungrantUser');
    }

    // TODO : roomName vs socket.rooms[0] 으로 할지 test 필요
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
