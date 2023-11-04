import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from './chatRoom.service';
import { CreateRoomDto } from './dto/createRoom.dto';
import { JwtService } from '@nestjs/jwt';
import { RoomStatus } from './roomStatus.enum';
import { UserPermission } from './userPermission.enum';

@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    transport: ['websocket'],
    namespace: 'RoomChat',
})
export class ChatRoomGateway implements OnGatewayConnection {
    private logger = new Logger(ChatRoomGateway.name);
    constructor(
        private chatroomService: ChatRoomService,
        private jwtService: JwtService,
    ) {}

    @WebSocketServer()
    public server: Server;

    // * 커넥션 핸들링 ========================================================
    async handleConnection(socket: Socket) {
        // socket.emit('expireToken', async () => {
        // console.log('token: ', socket.handshake.query.token); // * 테스트용
        // console.log('HANDLE CONNECTION 함수 called');
        // console.log('socket.handshake.auth.token : ', socket.handshake.auth.token); // * 실 구현은 auth.token으로 전달 받기
        const tokenString: string = socket.handshake.auth.token as string;
        try {
            if (!tokenString) throw new Error('jwt is empty.');
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            await this.chatroomService.addNewUser(socket, decodedToken.sub, this.server);
            this.logger.log(`NEW CONNECTION WITH ${decodedToken.userName}, ${socket.id}`);
        } catch (error) {
            this.logger.warn(`Handle Connection : ${error.message}`);
            // => null 들어가면 (토큰 형식 안맞)
            // error.message === 'jwt malformed' ||
            // => undefined 비어 있으면 (토큰 안들어옴)
            // error.message === 'jwt must be provided' ||
            if (error.message === 'jwt expired') {
                // `${BACK_URL}/auth/regenerateToken`
                // * 토큰 만료 => 근데 왜 404 날라와요?.. ?
                this.logger.log('expireToken emit called');
                socket.emit('expireToken');
            } else socket.disconnect(true);
            return;
        }
        socket.emit('connectSuccess');

        socket.on('disconnecting', async (reason) => {
            const rooms: Set<string> = socket.rooms;
            await this.chatroomService.leavePastRoom(socket, rooms, this.server);
            await this.chatroomService.deleteUser(socket);
            const roomList = this.chatroomService.getChatRoomList();
            this.server.emit('getChatRoomList', roomList);
        });
    }

    // * Getter ===========================================================

    @SubscribeMessage('getBanList')
    async getBanList(socket: Socket, payload: JSON) {
        const banList = await this.chatroomService.getBanList(socket, payload['roomName'], payload['roomStatus']);
        socket.emit('getBanList', banList);
    }

    @SubscribeMessage('expireToken')
    expireToken(socket: Socket, payload: string) {
        this.logger.log('EXPIRE TOKEN');
        // console.log('expireToken : ', payload);
        // 프론트 소켓은 별개라 업데이트 안됨 -jaejkim
        // socket.handshake.auth.token = payload;
        // console.log('새로 들어 온 거  : ', payload);
    }

    @SubscribeMessage('getChatRoomList')
    getChatRoomList(socket: Socket) {
        this.logger.log('GET CHAT ROOM List*');
        // ”roomname”: string,
        // ”isLocked” : boolean,
        // ”status” : roomStatus,
        const chatRoomList = this.chatroomService.getChatRoomList();
        this.logger.debug(`GET CHAT ROOM LIST : `, chatRoomList);
        socket.emit('getChatRoomList', chatRoomList);
    }

    @SubscribeMessage('getChatRoomInfo')
    async getChatRoomInfo(socket: Socket, payload: JSON) {
        this.logger.log('GET CHAT ROOM INFO*');
        //roomName: string
        //ownerName: string
        //roomstatus: RoomStatus
        // requirePassword: boolean
        // operatorList: Array<string>
        // memberList: Array<string>
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(socket, payload['roomName'], payload['status']);
        socket.emit('getChatRoomInfo', chatRoomInfo);
        this.logger.debug('GET CHAT ROOM INFO :', chatRoomInfo, socket);
        // Object.fromEntries(chatRoomList)
    }

    @SubscribeMessage('getMemberStateList')
    async getMemberStateList(socket: Socket, payload: JSON) {
        // this.logger.log('GET MEMBER STATE LIST');
        //roomName: string
        //status: RoomStatus
        const memberList = await this.chatroomService.getMemberStateList(
            socket,
            payload['roomName'],
            payload['status'],
        );
        // console.log(memberList);
        socket.emit('getMemberStateList', memberList);
    }

    // * Message ===========================================================
    @SubscribeMessage('sendMessage')
    sendMessage(socket: Socket, payload: JSON): void {
        // this.logger.log(`SEND MESSAGE : ${payload['userName']} in ${payload['roomName']} : ${payload['content']}`);

        this.chatroomService.sendMessage(
            socket,
            payload['roomName'],
            payload['userName'],
            payload['content'],
            payload['status'],
        );
    }

    @SubscribeMessage('receiveMessage')
    async receiveMessage(socket: Socket, payload: JSON): Promise<void> {
        await this.chatroomService.receiveMessage(socket, payload['userName'], payload['content']);
    }

    // * ChatRoom Method ===========================================================
    @SubscribeMessage('createChatRoom')
    async createChatRoom(socket: Socket, payload: JSON) {
        this.logger.log('CREATE CHAT ROOM');
        if (
            !(await this.chatroomService.createChatRoom(
                socket,
                Object.assign(new CreateRoomDto(), payload),
                this.server,
            ))
        )
            return;
        // * 프론트 요청 : create 후 새로 갱신된 리스트 전송
        const chatRoomList = this.chatroomService.getChatRoomList();
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(socket, payload['roomName'], payload['status']);
        socket.emit('createChatRoom', chatRoomInfo);
        this.server.emit('getChatRoomList', chatRoomList);
    }

    @SubscribeMessage('joinPublicChatRoom')
    async joinPublicChatRoom(socket: Socket, payload: JSON) {
        this.logger.log('JOIN PUBLIC CHAT ROOM');
        if (
            !(await this.chatroomService.joinPublicChatRoom(
                socket,
                payload['roomName'],
                payload['password'],
                this.server,
            ))
        )
            return;
        const memberStateList = await this.chatroomService.getMemberStateList(
            socket,
            payload['roomName'],
            RoomStatus.PUBLIC,
        );
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(socket, payload['roomName'], RoomStatus.PUBLIC);
        socket.emit('getChatRoomInfo', chatRoomInfo);
        this.server.to(payload['roomName']).emit('getMemberStateList', memberStateList);
    }

    @SubscribeMessage('joinPrivateChatRoom')
    async joinPrivateChatRoom(socket: Socket, payload: JSON) {
        // this.logger.log('JOIN PRIVATE CHAT ROOM');
        if (!(await this.chatroomService.joinPrivateChatRoom(socket, payload['roomName'], this.server))) return;
        const memberStateList = await this.chatroomService.getMemberStateList(
            socket,
            payload['roomName'],
            RoomStatus.PRIVATE,
        );
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(
            socket,
            payload['roomName'],
            RoomStatus.PRIVATE,
        );
        this.logger.debug('JOIN PRIVATE CHAT ROOM', chatRoomInfo);
        socket.emit('getChatRoomInfo', chatRoomInfo);
        socket.emit('getMemberStateList', memberStateList);
        this.server.to(payload['roomName']).emit('getMemberStateList', memberStateList);
    }

    @SubscribeMessage('invitation')
    async invitation(socket: Socket, payload: JSON) {
        await this.chatroomService.addInvitation(
            socket,
            payload['roomName'],
            payload['roomStatus'],
            payload['slackId'],
        );
    }

    // roomName: string
    @SubscribeMessage('exitChatRoom')
    exitChatRoom(socket: Socket) {
        this.logger.log('EXIT CHAT ROOM');
        this.chatroomService.leavePastRoom(socket, socket.rooms, this.server);
        this.getChatRoomList(socket);
    }

    // getMyPermission
    @SubscribeMessage('getMyPermission')
    async getMyPermission(socket: Socket, payload: JSON) {
        const userPermission: UserPermission = await this.chatroomService.getUserPermission(
            socket,
            payload['roomStatus'],
            payload['roomName'],
        );
        socket.emit('getMyPermission', userPermission);
    }

    // * 채팅방 패스워드 관련 =================================================
    @SubscribeMessage('setRoomPassword')
    async setRoomPassword(socket: Socket, payload: JSON) {
        this.logger.log('SET ROOM PASSWORD');
        await this.chatroomService.setRoomPassword(socket, payload['roomName'], payload['password']);
        const chatRoomList = this.chatroomService.getChatRoomList();
        this.server.emit('getChatRoomList', chatRoomList);
    }

    @SubscribeMessage('unsetRoomPassword')
    async unsetRoomPassword(socket: Socket, payload: JSON) {
        this.logger.log('UNSET ROOM PASSWORD');
        await this.chatroomService.unsetRoomPassword(socket, payload['roomName']);
        const chatRoomList = this.chatroomService.getChatRoomList();
        this.server.emit('getChatRoomList', chatRoomList);
    }

    // * Owner & Operator =====================================================
    @SubscribeMessage('grantUser')
    async grantUser(socket: Socket, payload: JSON) {
        this.logger.log('GRANT USER');
        await this.chatroomService.grantUser(socket, payload['roomName'], payload['roomStatus'], payload['targetName']);
    }

    @SubscribeMessage('ungrantUser')
    async ungrantUser(socket: Socket, payload: JSON) {
        this.logger.log('UNGRANT USER');
        await this.chatroomService.ungrantUser(
            socket,
            payload['roomName'],
            payload['roomStatus'],
            payload['targetName'],
        );
    }

    @SubscribeMessage('kickUser')
    async kickUser(socket: Socket, payload: JSON) {
        this.logger.log('KICK USER');
        await this.chatroomService.kickUser(socket, payload['roomName'], payload['targetName'], this.server);
    }

    @SubscribeMessage('muteUser')
    async muteUser(socket: Socket, payload: JSON) {
        this.logger.log('MUTE USER');
        await this.chatroomService.muteUser(
            socket,
            payload['status'],
            payload['roomName'],
            payload['targetName'],
            payload['time'],
        );
    }

    @SubscribeMessage('banUser')
    async banUser(socket: Socket, payload: JSON) {
        this.logger.log('BAN USER');
        this.chatroomService.banUser(socket, payload['roomName'], payload['roomStatus'], payload['targetSlackId']);
    }

    @SubscribeMessage('unbanUser')
    async unbanUser(socket: Socket, payload: JSON) {
        this.logger.log('UNBAN USER');
        this.chatroomService.unbanUser(socket, payload['roomName'], payload['roomStatus'], payload['targetSlackId']);
    }

    // * Block & Unblock =======================================================

    @SubscribeMessage('blockUser')
    async blockUser(socket: Socket, payload: JSON) {
        this.logger.log('BLOCK USER');
        this.chatroomService.blockUser(socket, payload['targetName']);
        this.server.serverSideEmit('blockUser', {
            userId: this.chatroomService.getUserId(socket),
            targetId: payload['targetName'],
        });
    }

    @SubscribeMessage('unBlockUser')
    async unBlockUser(socket: Socket, payload: JSON) {
        this.logger.log('UNBLOCK USER');
        this.chatroomService.unBlockUser(socket, payload['targetName']);
        this.server.serverSideEmit('blockUser', {
            userId: this.chatroomService.getUserId(socket),
            targetId: payload['targetName'],
        });
    }
}
