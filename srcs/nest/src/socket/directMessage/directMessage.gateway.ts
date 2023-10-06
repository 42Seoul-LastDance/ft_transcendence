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
    async handleConnection(socket: Socket) {
        // console.log('token: ', socket.handshake.query.token); // * 테스트용
        // console.log('token: ', socket.handshake.auth.token); // * 실 구현은 auth.token으로 전달 받기
        const tokenString: string = socket.handshake.query.token as string;
        try {
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            await this.directMessageService.addNewUser(socket, decodedToken.sub);
        } catch (error) {
            socket.disconnect(true);
            console.log(error);
            return;
        }
        console.log(socket.id, ': new connection. (DM)');
    }

    handleDisconnect(socket: Socket) {
        this.directMessageService.deleteUser(socket);
        console.log(socket.id, ': lost connection. (DM)');
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
