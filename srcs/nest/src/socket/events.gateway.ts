import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
}) // 데코레이터 인자로 포트 줄 수 있음
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // 생성자로 서비스 넣고 로직 분리 가능
    client: Record<string, any>;
    index: number;
    constructor() {
        this.client = {};
        this.index = 0;
    }

    connectedClients: { [socketId: string]: boolean } = {};

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        client['nickname'] = 'client ' + this.index++;
        this.client[client.id] = client;
        console.log(client.id, ': new connection.');
    }

    handleDisconnect(client: Socket) {
        delete this.client[client.id];
        console.log(client.id, ': lost connection.');
    }

    //events라는 유형의 message를 받게되면 handleEvent 함수를 작동시킨다
    //return 을 통해 응답할 수 있다.
    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: number): number {
        return data;
    }

    //메시지가 전송되면 모든 유저에게 메시지 전송
    @SubscribeMessage('sendMessage')
    sendMessage(client: Socket, message: string): void {
        this.server.emit('getMessage', message);
    }

    //*DM =========================================
    //DM방 들어가기
    @SubscribeMessage('enterDM')
    enterDM(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //DM 메시지
    @SubscribeMessage('sendDM')
    sendDM(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //*채팅방 =========================================
    //채팅방 만들기
    @SubscribeMessage('createChatRoom')
    createChatRoom(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //채팅방 들어가기
    @SubscribeMessage('enterChatRoom')
    enterChatRoom(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //채팅방 나가기
    @SubscribeMessage('exitChatRoom')
    exitChatRoom(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //채팅방 없애기(방장이 나감)
    @SubscribeMessage('deleteChatRoom')
    deleteChatRoom(client: Socket, roomId: string) {
        // client.join(roomId);
    }

    //* 채팅방 권한 설정 =========================================
    //admin 설정 -> 책봉, 해제
    @SubscribeMessage('updateAdmin')
    updateAdmin(client: Socket, roomId: string) {
        // client.join(roomId);
    }
}
