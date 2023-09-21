import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
// import { GameRoomDto } from './gameRoom.dto';
// import { GameRoomInfoDto } from './roominfo.dto';
// import { ClientDto } from './client.dto';
@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    namespace: 'Game',
}) // 데코레이터 인자로 포트 줄 수 있음
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    //플레이어
    //플레이어 방 (게임룸) => 대전, 친선 구분 필요?
    //큐
    clientList = new Map<string, any>();
    constructor(private gameService: GameService) {
        // this.client = new Map<string, any>();
        // // this.rooms = new Map<number, any>();
        // this.idx_client = 0;
        // // this.idx_room = 0;
    }

    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        //jwt 토큰에서 가져온 정보도 추가
        // client['nickname'] = 'user ' + this.idx_client++;
        // this.clientList[socket.id] = clientDto;
        console.log(socket.id, ': new connection.');
    }

    handleDisconnect(socket: Socket) {
        this.clientList.delete(socket.id);
        console.log(socket.id, ': lost connection.');
    }

    // //메시지가 전송되면 모든 유저에게 메시지 전송
    // @SubscribeMessage('sendMessage')
    // sendMessage(client: Socket, message: string): void {
    //     console.log('function called ', this.clientList.size);

    //     this.clientList.forEach((element) => {
    //         console.log(element.nickname);
    //         if (element.connected) {
    //             element.emit('getMessage', message);
    //         }
    //     });
    // }

    //* Game 시작과 종료 ======================================
    //게임 시작
    @SubscribeMessage('StartGame')
    startGame(client: Socket, msg: string) {
        // this.gameService.startGame(client);
        console.log(client.id, ':', msg);
        client.emit('StartGame');
    }

    //게임 재시작
    @SubscribeMessage('RestartGame')
    restartGame(client: Socket, msg: string) {
        // this.gameService.restartGame(client);
        console.log(client.id, ':', msg);
        client.emit('RestartGame');
    }

    //게임 종료
    @SubscribeMessage('GameOver')
    overGame(client: Socket, msg: string) {
        // this.gameService.overGame(client);
        console.log(client.id, ':', msg);
        client.emit('GameOver');
    }
}
