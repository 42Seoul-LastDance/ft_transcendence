import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessageService } from './directMessage.service';
import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
export const TIMEZONE: string = 'Asia/Seoul';

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
    constructor(
        private directMessageService: DirectMessageService,
        private jwtService: JwtService,
    ) {}

    @WebSocketServer()
    server: Server;

    // * 커넥션 핸들링 ========================================================
    handleConnection(socket: Socket) {
        console.log('token: ', socket.handshake.auth.token);

        try {
            const decodedToken = this.jwtService.verify(socket.handshake.auth.token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            this.directMessageService.addNewUser(socket, decodedToken.sub);
        } catch (error) {
            socket.disconnect(true); //true면 아예 끊고, false 면 해당 namespace만 끊는다.
            return;
        }
        console.log(socket.id, ': new connection. (DM)');
    }

    handleDisconnect(socket: Socket) {
        this.directMessageService.deleteUser(socket);
    }

    // * Sender =============================================================
    @SubscribeMessage('sendMessasge')
    async sendMessage(socket: Socket, payload: JSON) {
        // payload['targetName']: string,
        // payload['message]: string
        await this.directMessageService.sendMessage(socket, payload['content'], payload['targetId']);
        // socket.emit('sendMessage', ...);
    }
}
