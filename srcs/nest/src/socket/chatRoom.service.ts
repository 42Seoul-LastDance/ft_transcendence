import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { RoomInfoDto } from './dto/roominfo.dto';
import { roomStatus } from './room.enum';
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
    private userList: Map<string, Socket> = new Map<string, Socket>(); //{username, Socket}
    private socketList: Map<string, string> = new Map<string, string>(); //{socket id , username}
    private blockList: Map<string, Array<string>> = new Map<string, Array<string>>(); //{socket id , blockUserList}

    constructor() {}

    getUserName(socket: Socket): string | undefined {
        return this.socketList[socket.id];
    }

    addNewUser(socket: Socket) {
        const userName = socket.handshake.query['username'].toString();
        this.socketList.set(socket.id, userName);
        this.userList.set(userName, socket);
        socket.rooms.clear();
    }

    deleteUser(socket: Socket) {
        this.userList.delete(this.socketList[socket.id]);
        this.socketList.delete(socket.id);
    }

    //result, reason
    emitFailReason(socket: Socket, event: string, reason: string) {
        const response = {
            result: false,
            reason: reason,
        };
        socket.emit(event, response);
    }

    getChatRoomList(): Map<string, ChatRoomDto> {
        return this.publicRoomList;
    }

    createChatRoom(
        socket: Socket,
        roomInfoDto: RoomInfoDto,
        // json: JSON,
    ): void {
        const roomDto: ChatRoomDto = new ChatRoomDto();
        //TODO : chat Room 중복 체크

        roomDto.roomName = roomInfoDto.roomName;
        roomDto.ownerName = roomInfoDto.username;
        roomDto.requirePassword = roomInfoDto.requirePassword;
        roomDto.memberList.push(roomDto.ownerName);

        if (roomInfoDto.status == roomStatus.PRIVATE) this.privateRoomList.set(roomInfoDto.roomName, roomDto);
        else this.publicRoomList.set(roomInfoDto.roomName, roomDto);
        if (roomInfoDto.status == roomStatus.PRIVATE) this.joinPrivateChatRoom(socket, roomDto.roomName);
        else this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password);

        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    leavePastRoom(socket: Socket, userName: string) {
        const pastRoomName = this.userList[userName].socket.rooms[0];
        if (pastRoomName !== undefined) {
            //기존에 유저가 있던 채널이 있었다면
            const pastRoom = this.publicRoomList.get(pastRoomName);
            const condition = (element) => element === pastRoomName;
            let idx = pastRoom.memberList.findIndex(condition);
            pastRoom.memberList.splice(idx, 1);
            idx = pastRoom.muteList.findIndex(condition);
            if (idx !== -1) pastRoom.muteList.splice(idx, 1);
            socket.leave(pastRoomName);
            //TODO : 해당 채널의 유저가 0명일 경우, Map에서 삭제
        }
    }

    joinPublicChatRoom(socket: Socket, roomName: string, password: string): void {
        const targetRoom = this.publicRoomList.get(roomName);
        const userName = this.getUserName(socket);
        if (targetRoom == undefined) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'Room does not exists.');
            return;
        }
        if (targetRoom.banList.find((currName) => userName === currName) !== undefined) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'user is banned.');
            return;
        }
        if (targetRoom.requirePassword == true && password !== targetRoom.password) {
            this.emitFailReason(socket, 'joinPublicChatRoom', 'wrong password');
            return;
        }

        this.leavePastRoom(socket, userName);
        //!test
        console.log('test: must be none. ', socket.rooms);
        // socket.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userName);
        socket.to(roomName).emit('joinPublicChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
    }

    joinPrivateChatRoom(socket: Socket, roomName: string): void {
        const targetRoom = this.privateRoomList.get(roomName);
        const userName = this.getUserName(socket);
        if (targetRoom == undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'Room does not exists.');
            return;
        }
        if (targetRoom.banList.find((currName) => userName === currName) !== undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is banned.');
            return;
        }
        if (targetRoom.inviteList.find((currName) => userName === currName) === undefined) {
            this.emitFailReason(socket, 'joinPrivateChatRoom', 'user is not invited.');
            return;
        }

        socket.rooms.clear(); // ? 기존에 있던 방 나간다. docs -> 자기 client id?
        this.leavePastRoom(socket, userName);

        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.push(userName);
        socket.to(roomName).emit('joinPrivateChatRoom', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
    }

    kickUser(socket: Socket, roomName: string, targetName: string) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userName = this.getUserName(socket);
        //!test
        if (socket.rooms[0] != roomName)
            console.log('test failed. user 가 속해있는 room이 1개 이상이거나 맞지 않습니다.');

        socket.to(roomName).emit('kickUser', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        this.leavePastRoom(socket, targetName);
    }

    muteUser(socket: Socket, status: roomStatus, roomName: string, targetName: string, time: number) {
        //TODO : test  : op가 아니어도 된다면?! (front에서 혹시 잘못 띄우는지 확인)

        //TODO : test . mute  가 잘 사라지나.
        const removeMuteUser = (targetName, roomDto) => {
            roomDto.muteList.delete(targetName);
        };
        let room: ChatRoomDto;
        if (status === roomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        room.muteList.push(targetName);
        setTimeout(() => {
            removeMuteUser(targetName, room);
        }, time * 1000);
    }

    // sendMessage(roomname: string, status:roomStatsus, username: string) {
    //     //TODO : muteList 검사
    //     //TODO : blockList 검사. 
    // }
}
