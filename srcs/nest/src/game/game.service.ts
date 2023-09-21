import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
// import { RoomDto } from './room.dto';
// import { RoomInfoDto } from './roominfo.dto';
// import { roomStatus } from './room.enum';

@Injectable()
export class GameService {
    // private gameRoomList: Map<string, RoomDto> = new Map<string, RoomDto>();
    // private idx_room: number = 0;

    constructor() {}

    createChatRoom(
        client: Socket,
        roomInfoDto: RoomInfoDto,
        // json: JSON,
    ): void {
        const roomDto: RoomDto = new RoomDto();
        // console.log('roomInfoDto:', roomInfoDto);
        roomDto.id = this.idx_room++;
        roomDto.roomname = roomInfoDto.roomname;
        roomDto.owner = roomInfoDto.username;
        // roomDto.password = roomInfoDto.password;
        roomDto.isLocked = roomInfoDto.isLocked;
        // console.log('username: ', username);
        // console.log('owner', roomDto.owner);
        roomDto.member.push(roomDto.owner);
        // console.log('roomname:', roomDto.roomname);
        if (roomInfoDto.status == roomStatus.PRIVATE) {
            // console.log('private: ', roomDto);
            this.privateRoomList.set(roomInfoDto.roomname, roomDto);
        } else {
            // console.log('public: ', roomDto);
            this.privateRoomList.set(roomInfoDto.roomname, roomDto);
        }
        // if(roomInfoDto.)
        client.rooms.clear();
        client.join('' + roomDto.id);
        client.emit(
            'getMessage',
            `"${client.id}"님이 "${roomDto.roomname}"방에 접속하셨습니다.`,
        );
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    joinChatRoom(client: Socket, roomInfoDto: RoomInfoDto) {
        // const targetRoom = this.publicRoomList.get(roomInfoDto.roomname);
        // if (targetRoom === undefined)
        //     // 있으면;
        //     //error
        //     client.join(roomInfoDto.roomname);
    }

    getChatRoomList(): Map<string, RoomDto> {
        return this.publicRoomList;
    }

    getChatRoom(roomInfoDto: RoomInfoDto): RoomDto {
        //public, private 방 분기 필요
        if (roomInfoDto.status == roomStatus.PRIVATE)
            return this.privateRoomList[roomInfoDto.roomname];
        else return this.publicRoomList[roomInfoDto.roomname];
    }

    deleteChatRoom(roomInfoDto: RoomInfoDto) {
        this.privateRoomList.delete(roomInfoDto.roomname);
    }

    // const roomId = `room:${uuidv4()}`;
    // const nickname: string = client.data.nickname;
    // this.chatRoomList[roomId] = {
    //     roomId,
    //     cheifId: client.id,
    //     roomName,
    // };
    // client.data.roomId = roomId;
    // client.rooms.clear();
    // client.join(roomId);
    // client.emit('getMessage', {
    //     id: null,
    //     nickname: '안내',
    //     message:
    //         '"' + nickname + '"님이 "' + roomName + '"방을 생성하였습니다.',
    // });

    // enterChatRoom(client: Socket, roomId: string) {
    //     client.data.roomId = roomId;
    //     client.rooms.clear();
    //     client.join(roomId);
    //     const { nickname } = client.data;
    //     const { roomName } = this.getChatRoom(roomId);
    //     client.to(roomId).emit('getMessage', {
    //         id: null,
    //         nickname: '안내',
    //         message: `"${nickname}"님이 "${roomName}"방에 접속하셨습니다.`,
    //     });
    // }

    // exitChatRoom(client: Socket, roomId: string) {
    //     client.data.roomId = `room:lobby`;
    //     client.rooms.clear();
    //     client.join(`room:lobby`);
    //     const { nickname } = client.data;
    //     client.to(roomId).emit('getMessage', {
    //         id: null,
    //         nickname: '안내',
    //         message: '"' + nickname + '"님이 방에서 나갔습니다.',
    //     });
    // }
}
