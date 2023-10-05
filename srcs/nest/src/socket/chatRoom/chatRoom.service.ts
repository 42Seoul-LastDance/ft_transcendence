import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { RoomInfoDto } from './dto/roominfo.dto';
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
    private userList: Map<number, Socket> = new Map<number, Socket>(); //{username->id, Socket}
    private socketList: Map<string, number> = new Map<string, number>(); //{socket id , username->id}
    private blockList: Map<string, Array<number>> = new Map<string, Array<number>>(); //{socket id , blockUserList} // ! -> DB에 저장

    constructor(private userService: UserService, private blockedUsersService: BlockedUsersService,) {
        const chatRoom = {
            roomName: 'default room',
            ownerName: 'ebang',
            status: RoomStatus.PUBLIC,
            password: 'password',
            requirePassword: false,
        };
        this.publicRoomList.set('default room', Object.assign(new ChatRoomDto(), chatRoom));
    }

    private async getMemberList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        
        let userName;
        for(const member of chatRoom.memberList){
            userName = (await this.userService.findUserById(member)).username;
            memberList.push(userName);
        }
        return memberList;
    }

    private async getOperatorList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        
        let userName;
        for(const member of chatRoom.operatorList){
            userName = (await this.userService.findUserById(member)).username;
            memberList.push(userName);
        }
        return memberList;
    }

    private async getBlockListById(socket: Socket) : Promise<Array<number>> {
        return this.blockList.get(socket.id);
        
        //Array<User>
    }

    private getUserId(socket: Socket): number | undefined {
        return this.socketList.get(socket.id);
    }

    async addNewUser(socket: Socket, userId: number, io: Server) {
        // const userName = socket.handshake.query['username'].toString();
        console.log('socket id, userId in ADD NEW USER : ', socket.id, userId);
        socket.rooms.clear();

        this.socketList.set(socket.id, userId);
        this.userList.set(userId, socket);
        this.blockList.set(socket.id, new Array<number>());
        // ? blockList를 DB에서 꺼내와서 채워놔야 하지 않을까?
        //!test : 들어오면 default 룸으로 들어가게 하기.
        // await this.joinPublicChatRoom(socket, 'default room', 'password', io);

        //!test
        console.log('add new user, has rooms : ', socket.rooms);
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
        console.log('keyArray: ', keyArray);
        return keyArray;
    }
    private getUserPermission(room: ChatRoomDto, userId: number, userName: string) {
        let result: UserPermission;     

        result = UserPermission.MEMBER;
        for (const memberId of room.operatorList) {
            if (memberId === userId) 
                result =  UserPermission.ADMIN;
        }
        if(room.ownerName === userName)
            result = UserPermission.OWNER;

        return result;
    }
    
    
    getChatRoomInfo(socket : Socket, roomName: string, roomstatus: RoomStatus) {
        //public/private 중 특정 방 정보를 준다.
        let chatroomDto: ChatRoomDto;
        if (roomstatus === RoomStatus.PUBLIC) chatroomDto = this.publicRoomList.get(roomName);
        else chatroomDto = this.privateRoomList.get(roomName);
        
        const userId = this.getUserId(socket);
        
        const userName = ( await this.userService.findUserById(userId)).username;
        const userPermission: UserPermission = this.getUserPermission(chatroomDto, userId, userName);
        const roomInfo = {
            roomName: chatroomDto.roomName,
            ownerName: chatroomDto.ownerName,
            roomstatus: chatroomDto.status,
            requirePassword: chatroomDto.requirePassword,
            operatorList: this.getOperatorList(chatroomDto),
            memberList: this.getMemberList(chatroomDto),
            myName: userName ? userName : null, 
            myPermission: userPermission, 
        }
        return roomInfo;
    }
    

    async createChatRoom(socket: Socket, roomInfoDto: RoomInfoDto, io: Server): Promise<void> {
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
		// 아래 주석 대신 socket으로 찾은 userName 예스
        //roomDto.ownerName = roomInfoDto.userName;
        roomDto.requirePassword = roomInfoDto.requirePassword;
        roomDto.status = roomInfoDto.status;

        console.log('createChatRoom : ', roomDto);
        if (roomInfoDto.password) roomDto.password = roomInfoDto.password;
        if (roomInfoDto.status == RoomStatus.PRIVATE) this.privateRoomList.set(roomInfoDto.roomName, roomDto);
        else this.publicRoomList.set(roomInfoDto.roomName, roomDto);
        if (roomInfoDto.status == RoomStatus.PRIVATE) this.joinPrivateChatRoom(socket, roomDto.roomName, io);
        else this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password, io);
        this.emitSuccess(socket, 'createChatRoom');
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    async leavePastRoom(socket: Socket, io: Server) {
        // 방이 터졌을 경우 true 반환 : 브로드캐스팅을 위해서
        console.log('LPR2 : socket.rooms : ', socket.rooms);
        const pastRoomName = Array.from(socket.rooms).at(-1);
        console.log('LPR2 : pastRoomName : ', pastRoomName);
        if (pastRoomName !== undefined) {
            // 기존에 유저가 있던 채널이 있으면
            const userId = this.socketList.get(socket.id);
            const userName = (await this.userService.findUserById(userId)).username;

            //? 유저가 privateroom에 있었으면 privateRoomList에서 찾아야하지 않을까요? (1) (juhoh) -> 맞는 것 같습니다
            
            let pastRoom;
            pastRoom = this.publicRoomList.get(pastRoomName);
            if(pastRoom === undefined) pastRoom = this.privateRoomList.get(pastRoomName);

            console.log('>>>>>pastRoom : ', pastRoom);
            socket.to(pastRoomName).emit('sendMessage', userName + '님이 방을 나가셨습니다.');
            if (userName === pastRoom.ownerName) {
                // owner가 나갈 경우 방 폭파
                socket.to(pastRoomName).emit('explodeChatRoom', '방 소유자가 나갔으므로 채팅방이 사라집니다.');
                // 방 타입 검사 후 해당 리스트에서 key-value쌍 item 삭제
                if (pastRoom.status === RoomStatus.PUBLIC) this.publicRoomList.delete(pastRoomName);
                else this.privateRoomList.delete(pastRoomName);
                console.log('LPR2 : some room has broken : ', pastRoomName);
                console.log('LPR2 : publicRoomList : ', this.publicRoomList);
                io.emit('getChatRoomList', this.getChatRoomList());
            } else {
                //한 유저만 chatRoom에서 삭제
                const condition = (element) => element === pastRoomName;
                let idx = pastRoom.memberList.findIndex(condition);
                pastRoom.memberList.splice(idx, 1); //memberList
                idx = pastRoom.muteList.findIndex(condition); //muteList
                if (idx !== -1) pastRoom.muteList.splice(idx, 1);
                socket.leave(pastRoomName);
                console.log('LPR2 : after ', socket.id, ' leave : ', socket.rooms);
            }
            this.emitSuccess(socket, 'leavePastRoom');
        }
        this.emitFailReason(socket, 'leavePastRoom', 'there was no past room.');
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string, io: Server): Promise<void> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.getUserId(socket);

        console.log('JOIN PUBLIC CHAT ROOM : ', roomName);
        console.log('userId: ', userId);
        // console.log('socket list:', this.socketList);
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

        console.log('test: before leave: ', socket.rooms);
        this.leavePastRoom(socket, io);
        //!test
        console.log('test: must be none: ', socket.rooms);
        // sockejoinPublict.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?

        //user의 Channel 변경
        socket.join(roomName);
        console.log('test: must not be none: ', socket.rooms);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userId);
        // console.log('user id', userId);
        const user = await this.userService.findUserById(userId);
        // console.log('user :', user);
        const userName = user.username;
        socket.to(roomName).emit('joinPublicChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPublicChatRoom');
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string, io: Server): Promise<void> {
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

        // socket.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?
        this.leavePastRoom(socket, io);

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userId);
        const userName = (await this.userService.findUserById(userId)).username;
        socket.to(roomName).emit('joinPrivateChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        this.emitSuccess(socket, 'joinPrivateChatRoom');
    }

    async kickUser(socket: Socket, roomName: string, targetName: string, io: Server) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userId = this.getUserId(socket);
        //!test
        if (socket.rooms[0] != roomName)
            console.log('test failed. user 가 속해있는 room이 1개 이상이거나 맞지 않습니다.'); //default room도 있음
        const userName = (await this.userService.findUserById(userId)).username;
        socket.to(roomName).emit('kickUser', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        const targetId = (await this.userService.getUserByUsername(targetName)).id;
        const targetSocket = this.userList.get(targetId);
        if (targetSocket !== undefined) this.leavePastRoom(socket, io);
        this.emitSuccess(socket, 'kickUser');
    }

    private checkOperator(roomName: string, roomStatus: RoomStatus, userId: number): boolean {
        let room;
        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else room = this.privateRoomList.get(roomName);
        const condition= (id) => { if(id === userId) return true;}
        if (room.operatorList.findIndex(condition) === -1)
            return false;
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
        if (this.checkOperator(roomName, status, userId) === false)
            console.log('test failed. user is not an oper.');

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

    async sendMessage(socket: Socket, payload: JSON) {

        let room: ChatRoomDto;
        if (payload['status'] == RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(payload['roomName']);
        } else {
            room = this.publicRoomList.get(payload['roomName']);
        }

        const userId = this.getUserId(socket);
        const blockList = await this.blockedUsersService.getBlockUserListById(userId);
        for(const memberId of room.memberList){
            var receiverSocket = this.userList.get(memberId);
            var receiverId = this.getUserId(receiverSocket);
            if (blockList.indexOf(receiverId) === -1){
                //emit
            }
        } //퇴근하신다네용 커밋메시지 제가 

            .to(payload['roomName'])
            .emit('sendMessage', { userName: payload['userName'], content: payload['content'] });
        console.log('successfully sent message.');
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
