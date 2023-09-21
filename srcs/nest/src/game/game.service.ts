import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameMode, GameType } from './game.enum';
import { WaitRoom, GameRoom, Player } from './game.interface';

@Injectable()
export class GameService {
    // private gameRoomList: Map<string, RoomDto> = new Map<string, RoomDto>();
    // private idx_room: number = 0;
    //game 큐: matchNormal, matchHard, friendNormal, friendHard
    //gameInfo json
    //- roomId
    //- gameMode: match / friend
    //- gameMode: hard / normal
    //- host player: user.id
    //- guest player: user.id
    //- startTime:
    //* when it ends
    //- winner:
    //- loser:
    //- endTime:
    //- GameEndStatus:
    //- gameId

    constructor() {}
    //Room
    private waitRoomIdx = 0;
    private gameRoomIdx: number = 0;
    private waitRoomList: Map<number, WaitRoom> = new Map<number, WaitRoom>();
    private gameRoomList: Map<number, GameRoom> = new Map<number, GameRoom>();
    //Queue
    private friendGameList: Map<string, Player> = new Map<string, Player>();
    private matchNormal: [string, string];
    private matchHard: [string, string];
    //* Match Game ======================================
    //큐 등록
    pushQueue(client: Socket, gameMode: number, username: string) {
        if (gameMode == GameMode.NORMAL) {
            //큐에 사람 있으면 연결
            if (this.matchNormal) {
                const [rivalSocketId, rivalUsername] = this.matchNormal;
                this.matchNormal = undefined;
                let waitRoom: WaitRoom = {
                    id: this.waitRoomIdx,
                    gameType: GameType.MATCH,
                    gameMode: GameMode.NORMAL,
                    hostUsername: rivalUsername,
                    hostSocket: rivalSocketId,
                    hostReady: false,
                    guestUsername: username,
                    guestSocket: client.id,
                    guestReady: false,
                };
                this.waitRoomList.set(this.waitRoomIdx++, waitRoom);
            } else {
                this.matchNormal = [client.id, username];
            }
            //없으면 큐에 집어넣긔!
        } else {
            //큐에 사람 있으면 연결
            if (this.matchHard) {
                const [partnerId, partnerUsername] = this.matchHard;
                this.matchHard = undefined;
            } else {
                this.matchHard = [client.id, username];
            }
            //없으면 큐에 집어넣긔!
        }
        //등록됐으면 emit 처리 필요함
        return;
    }

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
