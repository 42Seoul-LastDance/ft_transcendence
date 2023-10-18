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
import { UserStatus } from 'src/user/user-status.enum';
import { Logger } from '@nestjs/common';
import { User } from 'src/user/user.entity';
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
    private logger = new Logger(DirectMessageGateway.name);
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
            this.logger.log(`NEW CONNECTION WITH ${decodedToken.userName}, ${socket.id}`);
        } catch (error) {
            this.logger.warn(`Handle Connection : ${error.message}`);
            if (error.message === 'jwt expired') {
                this.logger.log('expireToken emit called');
                socket.emit('expireToken');
            }
            socket.disconnect(true);
            return;
        }
        socket.emit('connectSuccess');
    }

    handleDisconnect(socket: Socket) {
        this.directMessageService.deleteUser(socket);
        this.logger.log(`DM socket >>> LOST CONNECTION WITH ${socket.id}`);
    }

    // * Sender =============================================================
    @SubscribeMessage('sendMessage')
    async sendMessage(socket: Socket, payload: JSON) {
        // payload['content']: string
        // payload['targetName']: string,
        await this.directMessageService.sendMessage(socket, payload['content'], payload['roomName']);
    }

    @SubscribeMessage('receiveMessage')
    async receiveMessage(socket: Socket, payload: JSON) {
        //userName: string,
        //content: string,
        this.logger.log('DM : RECEIVE MESSAGE <---- 이거 왜 보냄??');
    }

    @SubscribeMessage('expireToken')
    expireToken(socket: Socket, payload: string) {
        this.logger.log('expireToken called - DM');
    }

    @SubscribeMessage('getMyName')
    async getMyName(socket: Socket) {
        const user: User = await this.directMessageService.getUserBySocketId(socket.id);
        this.logger.log(`getMyName : ${user.userName}`);
        socket.emit('getMyName', [user.userName, user.slackId]);
    }

    //* updateBlockUser
    @SubscribeMessage('blockUser')
    blockUser(socket: Socket, payload: JSON) {
        this.logger.log('blockUser called - DM');
        this.directMessageService.blockUser(socket, payload['userId'], payload['targetId']); //왜 Id로 되어있지...?
    }

    @SubscribeMessage('unBlockUser')
    unblockUser(socket: Socket, payload: JSON) {
        this.logger.log('unBlockUser called - DM');
        this.directMessageService.unblockUser(socket, payload['userId'], payload['targetId']);
    }

    // * friendList
    @SubscribeMessage('getFriendStateList')
    async getFriendStateList(socket: Socket, userName: string): Promise<void> {
        this.logger.log('** DM - GET FRIEND STATE LIST**');
        await this.directMessageService.getFriendStateList(socket, userName);
    }

    // * invite
    @SubscribeMessage('getInvitationList')
    async getInvitationList(socket: Socket) {
        this.logger.log('DM socket:: getInvitationList');
        const invitationList = await this.directMessageService.getInvitationList(socket.id);
        socket.emit('getInvitationList', invitationList);
    }

    @SubscribeMessage('sendInvitation')
    async sendInvitation(socket: Socket, payload: JSON) {
        this.logger.log('DM socket:: sendInvitation');
        await this.directMessageService.sendInvitation(socket.id, payload);
    }

    @SubscribeMessage('agreeInvite')
    async agreeInvite(socket: Socket, payload: JSON) {
        this.logger.log('DM socket:: agreeInvite');
        await this.directMessageService.agreeInvite(socket.id, payload);
    }

    @SubscribeMessage('declineInvite')
    async declineInvite(socket: Socket, payload: JSON) {
        this.logger.log('DM socket:: declineInvite');
        await this.directMessageService.declineInvite(socket.id, payload);
    }
    @SubscribeMessage('acceptFriend')
    async acceptFriend(socket: Socket, payload: JSON) {
        this.logger.log('DM socket:: acceptFriend');
        await this.directMessageService.addFriend(socket, payload);
    }

    @SubscribeMessage('deleteFriend')
    async deleteFriend(socket: Socket, payload: JSON) {
        this.logger.log('DM socket:: deleteFriend');
        await this.directMessageService.deleteFriend(socket, payload);
    }

    // *update userName
    @SubscribeMessage('updateUserName')
    async updateUserName(socket: Socket, paylod: JSON) {
        this.logger.log('updateUserName');
    }
}
