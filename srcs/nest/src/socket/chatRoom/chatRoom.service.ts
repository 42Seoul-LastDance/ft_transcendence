import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomStatus } from './roomStatus.enum';
import { UserService } from 'src/user/user.service';
import { BlockedUsersService } from 'src/user/blockedUsers/blockedUsers.service';
import { UserPermission } from './userPermission.enum';
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
    private userList: Map<number, Socket> = new Map<number, Socket>(); //{userName->id, Socket}
    private socketList: Map<string, number> = new Map<string, number>(); //{socket id , userName->id}
    private blockList: Map<number, Array<number>> = new Map<number, Array<number>>(); //{user id , blockUserList} // ! -> DB에서 한번 가져 들고왔다가 지속 업데이트

    constructor(
        private userService: UserService,
        private blockedUsersService: BlockedUsersService,
    ) {
        // // rdefulatoom 이제 없애고 테스트??
        // const chatRoom = {
        //     roomName: 'default room',
        //     ownerName: 'ebang',
        //     status: RoomStatus.PUBLIC,
        //     password: 'password',
        //     requirePassword: false,
        // };
        // this.publicRoomList.set('default room', Object.assign(new ChatRoomDto(), chatRoom));
        console.log('🌟🌟🌟new connection!!!! 다 초기화 됨!!!!!!!🌟🌟🌟');
    }

    private async getMemberList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        console.log(chatRoom.roomName, ' : ', chatRoom.memberList);
        let userName;
        for (const member of chatRoom.memberList) {
            userName = (await this.userService.findUserById(member)).userName;
            memberList.push(userName);
        }
        return memberList;
    }

    private async getOperatorList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];

        let userName;
        for (const member of chatRoom.operatorList) {
            userName = (await this.userService.findUserById(member)).userName;
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

    // private async saveBlockListById(userId: number): Promise<void> {
    //     // userId의 blockList를 DB에 저장
    //     // 근데 기존이랑 신규를 어떻게 구분하지?
    //     // 아 block/unblock 마다 DB 찍는구나
    // }

    getUserId(socket: Socket): number | undefined {
        return this.socketList.get(socket.id);
    }

    async addNewUser(socket: Socket, userId: number, io: Server) {
        // const userName = socket.handshake.query['userName'].toString();
        console.log('socket id, userId in ADD NEW USER : ', socket.id, userId);
        socket.rooms.clear();

        this.socketList.set(socket.id, userId);
        this.userList.set(userId, socket);
        this.blockList.set(userId, await this.blockedUsersService.getBlockUserListById(userId)); //이거 주석 처리 되어있엇네욤!!!!!!!!!

        //!test
        console.log('add new user, has rooms : ', socket.rooms);
    }

    deleteUser(socket: Socket) {
        console.log('DELETE USER');
        const userId: number = this.socketList.get(socket.id);
        this.userList.delete(userId);
        this.socketList.delete(socket.id);
        this.blockList.delete(userId);
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
        const userId: number = this.getUserId(socket);
        const userName: string = (await this.userService.findUserById(userId)).userName;
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
        const userId = this.getUserId(socket);

        const userName = (await this.userService.findUserById(userId)).userName;
        const userPermission: UserPermission = this.getUserPermission(chatroomDto, userId, userName);
        const roomInfo = {
            roomName: chatroomDto.roomName,
            ownerName: chatroomDto.ownerName,
            roomstatus: chatroomDto.status,
            requirePassword: chatroomDto.requirePassword,
            operatorList: await this.getOperatorList(chatroomDto),
            memberList: await this.getMemberList(chatroomDto),
            userPermission: userPermission, //userName 제거
        };
        return roomInfo;
    }

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
        roomDto.ownerName = (await this.userService.findUserById(this.getUserId(socket))).userName;
        roomDto.requirePassword = createRoomDto.requirePassword;
        roomDto.status = createRoomDto.status;
        if (createRoomDto.password) roomDto.password = createRoomDto.password;
        if (createRoomDto.status === RoomStatus.PRIVATE) this.privateRoomList.set(createRoomDto.roomName, roomDto);
        else this.publicRoomList.set(createRoomDto.roomName, roomDto);

        if (createRoomDto.status === RoomStatus.PRIVATE) await this.joinPrivateChatRoom(socket, roomDto.roomName, io);
        else await this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password, io);

        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    async leavePastRoom(socket: Socket, io: Server): Promise<void> {
        // 방이 터졌을 경우 true 반환 : 브로드캐스팅을 위해서
        const userId = this.socketList.get(socket.id);
        const userName = (await this.userService.findUserById(userId)).userName;
        console.log('LEAVE PAST ROOM : ', userName);
        // console.log('LEAVE PAST ROOM : socket : ', socket);

        const pastRoomName = Array.from(socket.rooms).at(-1);
        // console.log('pastRoomName: ', pastRoomName);
        if (pastRoomName === undefined) {
            console.log('no past room. bye');
            return;
        }
        // 기존에 유저가 있던 채널이 있으면
        //? 유저가 privateroom에 있었으면 privateRoomList에서 찾아야하지 않을까요? (1) (juhoh) -> 맞는 것 같습니다
        let pastRoom: ChatRoomDto;
        pastRoom = this.publicRoomList.get(pastRoomName);
        if (pastRoom === undefined) pastRoom = this.privateRoomList.get(pastRoomName);
        console.log('>>>>>pastRoom : ', pastRoom);
        socket.to(pastRoomName).emit('sendMessage', userName + '님이 방을 나가셨습니다.');
        if (userName === pastRoom?.ownerName) {
            //! test
            console.log('ROOM EXPLODE : ', pastRoom.roomName);
            // owner가 나갈 경우 방 폭파
            socket.to(pastRoomName).emit('explodeChatRoom', '방 소유자가 나갔으므로 채팅방이 사라집니다.');
            // 방 타입 검사 후 해당 리스트에서 key-value쌍 item 삭제
            if (pastRoom.status === RoomStatus.PUBLIC) this.publicRoomList.delete(pastRoomName);
            else this.privateRoomList.delete(pastRoomName);
            // console.log('LPR2 : some room has broken : ', pastRoomName);
            // console.log('LPR2 : publicRoomList : ', this.publicRoomList);
            io.emit('getChatRoomList', this.getChatRoomList());
        } else {
            //한 유저만 chatRoom에서 삭제
            // const condition = (element) => element === pastRoomName; //d이거도 이상한데요?? 이거 왜 멤버리스트에서 이전 방 이름을 검사하고있지??
            // let idx = pastRoom.memberList.findIndex(condition); //이거 받아서 삭제할라고 인덱스 받는 거같아요 멤버리스트에서 자기 제거하려구 -> 방에서 자기 이름을 찾아야 하는거 아닌가요?.?
            // pastRoom.memberList.splice(idx, 1); //memberList
            console.log('DELETE ONLY ONE USER (no room explode)');
            pastRoom?.memberList.delete(userId);
            pastRoom?.muteList.delete(userId);
            // idx = pastRoom.muteList.findIndex(condition); //muteList
            // if (idx !== -1) pastRoom.muteList.splice(idx, 1);
            socket.leave(pastRoomName);
            console.log('LPR2 : after ', socket.id, ' leave : ', socket.rooms);
        }
        this.emitSuccess(socket, 'leavePastRoom');
        this.emitFailReason(socket, 'leavePastRoom', 'there was no past room.');
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string, io: Server): Promise<void> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.getUserId(socket);

        console.log('JOIN PUBLIC CHAT ROOM : ', targetRoom);
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
        await this.leavePastRoom(socket, io);
        socket.join(roomName);
        console.log('TEST JOIN PUBLIC: after leave: ', socket.rooms);
        //!test
        // console.log('test: must be none: ', socket.rooms);
        // sockejoinPublict.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?

        //user의 Channel 변경
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        console.log('joinPublicChatRoom :: targetRoom memberList : ', targetRoom.memberList);
        console.log('JOIN PUBLIC CHAT ROOM, result socket.rooms:', socket.rooms);
        const user = await this.userService.findUserById(userId);
        const userName = user.userName;
        // socket.to(roomName).emit('joinPublicChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPublicChatRoom');
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string, io: Server): Promise<void> {
        const targetRoom = this.privateRoomList.get(roomName);
        const userId = this.getUserId(socket);
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
        await this.leavePastRoom(socket, io);

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        const userName = (await this.userService.findUserById(userId)).userName;
        socket.to(roomName).emit('joinPrivateChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPrivateChatRoom');
    }

    async kickUser(socket: Socket, roomName: string, targetName: string, io: Server) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userId = this.getUserId(socket);
        //!test
        if (socket.rooms[0] != roomName)
            console.log('test failed. user 가 속해있는 room이 1개 이상이거나 맞지 않습니다.'); //default room도 있음
        const userName = (await this.userService.findUserById(userId)).userName;
        socket.to(roomName).emit('kickUser', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        const targetId = (await this.userService.getUserByUserName(targetName)).id;
        const targetSocket = this.userList.get(targetId);
        if (targetSocket !== undefined) await this.leavePastRoom(socket, io);
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

        const targetId = (await this.userService.getUserByUserName(targetName)).id;
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
        const targetId = (await this.userService.getUserByUserName(targetName)).id;
        const blockedList = this.blockList.get(userId);
        if (blockedList === undefined) console.log('test failed: user id에 해당하는 키 값이 존재하지 않습니다.');
        if (blockedList.indexOf(targetId) === -1) return this.emitFailReason(socket, 'blockUser', 'already blocked.');
        blockedList.push(targetId);
        await this.blockedUsersService.blockUserById(userId, targetId); //DB
        this.emitSuccess(socket, 'blockUser');
    }

    async unBlockUser(socket: Socket, targetName: string): Promise<void> {
        //1. socket.id를 통해 blockList의 value(Array<string>) 가져오기
        //2. value에서 targetName 찾기
        //3. targetName 제거
        const userId = this.getUserId(socket);
        const targetId = (await this.userService.getUserByUserName(targetName)).id;
        const blockedList = this.blockList.get(userId);
        //!test
        if (blockedList === undefined) console.log('test failed: user id에 해당하는 키 값이 존재하지 않습니다.');
        if (blockedList.indexOf(targetId) === -1)
            return this.emitFailReason(socket, 'blockUser', 'was not blocked yet');
        const condition = (id) => id === targetId;
        const idx = blockedList.findIndex(condition);
        blockedList.splice(idx, 1);
        await this.blockedUsersService.unblockUserById(userId, targetId); //DB
        this.emitSuccess(socket, 'unBlockUser');
    }

    sendMessage(socket: Socket, roomName: string, userName: string, content: string, status: RoomStatus) {
        let room: ChatRoomDto;
        if (status == RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else {
            room = this.publicRoomList.get(roomName);
        }

        const userId = this.getUserId(socket);
        socket.to(room.roomName).emit('sendMessage', { userName: userName, content: content });
        console.log('successfully sent message.');
    }

    /*
    socket 친구가 userName 친구의 메시지를 받아도 될까요?
    A가 B의 메시지를 받아도 되는가? A->B B->A 둘 다 검사??
    @Brief userName이 보낸 메시지를 socket의 front 에게 렌더링 할지 말지 알려줍니다.
    */
    receiveMessage(socket: Socket, userName: string): void {
        socket.emit('receiveMessage', { canReceive: true });

        // const userId = this.getUserId(socket);
        // const blockedList = this.blockList.get(userId);
        // if (blockedList === undefined) {
        //     console.log('error: blockedList undefined');
        //     this.emitFailReason(socket, 'receiveMessage', 'undefined issue');
        //     return false;
        // }
        // if (blockedList?.indexOf(userId) === -1) return true;
        // return false;
    }

    async inviteUser(socket: Socket, roomName: string, userName: string) {
        //1. input으로 userName받아서 일치하는 사람을 초대한다.
        //2. roomName 에 해당하는 room의 inviteList에 추가.
        const room = this.privateRoomList.get(roomName);
        if (room === undefined) this.emitFailReason(socket, 'inviteUser', 'such private room does not exists.');
        //저희 다 id로 관리하기로 해서 그런것 같은데용
        const foundId = this.getUserId(socket);
        if (room.inviteList.has(foundId)) {
            this.emitFailReason(socket, 'inviteUser', 'user already invited.');
            return;
        }
        const targetId = (await this.userService.getUserByUserName(userName)).id;
        room.inviteList.add(targetId);
        this.emitSuccess(socket, 'inviteUser');
    }

    async banUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUserName(targetName)).id;
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

        const targetId = (await this.userService.getUserByUserName(targetName)).id;
        room.banList.delete(targetId);
        this.emitSuccess(socket, 'unbanUser');
    }

    async grantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = (await this.userService.getUserByUserName(targetName)).id;
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

        const targetId = (await this.userService.getUserByUserName(targetName)).id;
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
