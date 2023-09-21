import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { RoomInfoDto } from './dto/roominfo.dto';
import { roomStatus } from './room.enum';
/*
1. 채팅방 개설
2. 채팅방 나가기
3. 채팅방 리스트 주기
4. 채팅방 안에 있는 사람들끼리 채팅
*/
@Injectable()
export class ChatRoomService {
    private publicRoomList: Map<string, RoomDto> = new Map<
        string,
        ChatRoomDto
    >();
    private privateRoomList: Map<string, RoomDto> = new Map<
        string,
        ChatRoomDto
    >();
    private idx_room: number = 0;
    constructor() {}

    createChatRoom(
        client: Socket,
        roomInfoDto: RoomInfoDto,
        // json: JSON,
    ): void {
        const roomDto: ChatRoomDto = new RoomDto();
        //TODO : chat Room 중복 체크
        roomDto.id = this.idx_room++;
        roomDto.roomname = roomInfoDto.roomname;
        roomDto.owner = roomInfoDto.username;
        roomDto.isLocked = roomInfoDto.isLocked;
        roomDto.member.push(roomDto.owner);
        if (roomInfoDto.status == roomStatus.PRIVATE) {
            this.privateRoomList.set(roomInfoDto.roomname, roomDto);
        } else {
            this.publicRoomList.set(roomInfoDto.roomname, roomDto);
        }
        client.rooms.clear();
        client.join('' + roomDto.id);
        client.emit(
            'getMessage',
            `"${client.id}"님이 "${roomDto.roomname}"방을 만들었습니다~`,
        );
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
    }

    joinChatRoom(client: Socket, roomInfoDto: RoomInfoDto) {
        let targetRoom;
        //TODO : 없는 chatRoom 확인
        if (roomInfoDto.status == roomStatus.PUBLIC)
            targetRoom = this.publicRoomList.get(roomInfoDto.roomname);
        else targetRoom = this.privateRoomList.get(roomInfoDto.roomname);

        if (targetRoom === undefined) {
            //없는 방! => error 처리
            //
        }
        // client.rooms.clear();
        client.join(roomInfoDto.roomname);
        // targetRoom.member.push(client.id);
        //     client.to(roomInfoDto.roomname).emit('getMessage',
        //          `"${client.id}"님이 방에 접속하셨습니다.`,
        //     );
        // }
    }

    getChatRoomList(): Map<string, ChatRoomDto> {
        return this.publicRoomList;
    }

    getChatRoom(roomInfoDto: RoomInfoDto): ChatRoomDto {
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
