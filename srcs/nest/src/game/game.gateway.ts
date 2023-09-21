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

    //* Match Game ======================================
    //큐 등록
    @SubscribeMessage('pushQueue')
    pushQueue(client: Socket, clientInfo: JSON) {
        this.gameService.pushQueue(
            client,
            +clientInfo['gameMode'],
            clientInfo['username'],
        );

        console.log('pushQueue:', clientInfo['username']);
        // client.emit('pushQueue');
    }

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

    //* In Game ======================================
    //패들 움직임
    @SubscribeMessage('movePaddle')
    movePaddle(client: Socket, paddlePos: JSON) {
        // 상대에게 패들위치 전달
        // this.gameService.movePaddle(client, paddlePos);
        // console.log(client.id, ':', msg);
        client.emit('movePaddle');
    }
}
