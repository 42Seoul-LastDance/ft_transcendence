import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessageService } from './directMessage.service';

@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    transport: ['websocket'],
    namespace: 'DM',
})
export class DirectMessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private directMessageService: DirectMessageService) {}

    @WebSocketServer()
    server: Server;

    // * 커넥션 핸들링 ========================================================
    handleConnection(socket: Socket) {
        console.log('token: ', socket.handshake.query['username']);
        
    }

    handleDisconnect(socket: Socket) {
        
    }

    // * Getter ===========================================================
    @SubscribeMessage('getBlockUser')
    sendMessage(socket: Socket, targetName : string) {
        
    }

}
