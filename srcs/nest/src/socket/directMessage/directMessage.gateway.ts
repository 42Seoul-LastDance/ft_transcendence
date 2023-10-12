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
        // socket.emit('expireToken', async () => {
        // console.log('token: ', socket.handshake.query.token); // * 테스트용
        // console.log('token: ', socket.handshake.auth.token); // * 실 구현은 auth.token으로 전달 받기
        const tokenString: string = socket.handshake.auth.token as string;
        try {
            if (!tokenString) throw new Error('jwt is invalid.');
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            await this.directMessageService.addNewUser(socket, decodedToken.sub);
        } catch (error) {
            if (error.message === 'jwt expired') {
                console.log('DM : expireToken emit called');
                socket.emit('expireToken');
            }
            socket.disconnect(true);
            // console.log(error);
            return;
        }
        console.log(socket.id, ': new connection. (DM)');
        socket.emit('connectSuccess');
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
    }

    @SubscribeMessage('expireToken')
    expireToken(socket: Socket, payload: string) {
        console.log('expireToken called - DM');
    }

    //* updateBlockUser
    @SubscribeMessage('blockUser')
    blockUser(socket: Socket, payload: JSON) {
        console.log('blockUser called - DM');
        this.directMessageService.blockUser(socket, payload['userId'], payload['targetId']);
    }

    @SubscribeMessage('unBlockUser')
    unblockUser(socket: Socket, payload: JSON) {
        console.log('unBlockUser called - DM');
        this.directMessageService.unblockUser(socket, payload['userId'], payload['targetId']);
    }

    // * invite Chat Room

    // * invite Game

    // *
}
