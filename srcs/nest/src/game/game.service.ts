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

    startGame(client: Socket, json: JSON): void {
        //room 세팅?
        // client.rooms.clear();
        // client.join('' + roomDto.id);
        // client.to('' + roomDto.id).emit(
        //     'getMessage',
        //     `"${client.id}"님이 "${roomDto.roomname}"방에 접속하셨습니다.`,
        // );
    }

    restartGame(client: Socket, json: JSON): void {
        //room 세팅?
        // client.rooms.clear();
        // client.join('' + roomDto.id);
        // client.to('' + roomDto.id).emit(
        //     'getMessage',
        //     `"${client.id}"님이 "${roomDto.roomname}"방에 접속하셨습니다.`,
        // );
    }

    overGame(client: Socket, json: JSON): void {
        //room 세팅?
        // client.rooms.clear();
        // client.join('' + roomDto.id);
        // client.to('' + roomDto.id).emit(
        //     'getMessage',
        //     `"${client.id}"님이 "${roomDto.roomname}"방에 접속하셨습니다.`,
        // );
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
