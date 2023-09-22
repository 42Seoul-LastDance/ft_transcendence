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
@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    namespace: 'Game',
}) // 데코레이터 인자로 포트 줄 수 있음
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private gameService: GameService) {}

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(client.id, ': new connection.');
    }

    handleDisconnect(client: Socket) {
        console.log(client.id, ': lost connection.');
        //플레이어 상황에 따라 분기 처리

        this.gameService.deletePlayer(client.id);
    }

    //* Match Game ======================================
    //매칭게임요청 -> 큐 등록 or waitRoom 등록
    @SubscribeMessage('pushQueue')
    pushQueue(client: Socket, clientInfo: JSON) {
        //TESTCODE
        console.log('pushQueue:', client.id);
        this.gameService.pushQueue(
            client,
            +clientInfo['gameMode'],
            clientInfo['username'],
        );
    }

    //큐에 있던 플레이어 나감
    @SubscribeMessage('popQueue')
    popQueue(client: Socket) {
        //TESTCODE
        console.log('popQueue:', client.id);
        this.gameService.popQueue(client.id);
    }

    //* Friend Game ======================================

    //* Game Room ======================================
    @SubscribeMessage('getReady')
    getReady(client: Socket) {
        //TESTCODE
        console.log('getReady:', client.id);
        this.gameService.getReady(client.id);
    }

    //* In Game ======================================
    //패들 움직임, 상대에게 패들위치 전달
    @SubscribeMessage('movePaddle')
    movePaddle(client: Socket, gameInfo: JSON) {
        //TESTCODE
        console.log('movePaddle:', client.id);
        //TODO(check): x, y축도 확인 필요한가?
        this.gameService.movePaddle(client.id, gameInfo['paddlePosition']['z']);
    }

    //(only from left) 득점 신고
    @SubscribeMessage('scorePoint')
    async scorePoint(client: Socket, gameInfo: JSON) {
        //TESTCODE
        console.log('scorePoint:', client.id);
        await this.gameService.scorePoint(client.id, +gameInfo['side']);
    }
}
